import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type {
  LinkedInAdAccount,
  LinkedInCampaign,
  LinkedInCampaignGroup,
  LinkedInCreative,
  CreateLinkedInCampaignInput,
  CreateCampaignGroupInput,
  CreateCreativeInput,
  TargetingFacet,
  TargetingEntity,
  AudienceCount,
  BudgetPricing,
} from './types';

const API_BASE = 'https://api.linkedin.com/rest';
const API_VERSION = '202603';

// ─── Core HTTP ───────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to LinkedIn Ads. Complete OAuth first.');

  if (isTokenExpired(tokens) && tokens.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    storeTokens({
      ...tokens,
      access_token: refreshed.access_token,
      expires_in: refreshed.expires_in,
      token_acquired_at: Date.now(),
    });
    return refreshed.access_token;
  }

  return tokens.access_token;
}

async function linkedInFetch(path: string, init?: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function getAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.account_id) throw new Error('No LinkedIn Ads account selected.');
  return tokens.account_id;
}

// ─── Ad Accounts ─────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<LinkedInAdAccount[]> {
  const data = await linkedInFetch('/adAccounts?q=search&search=(status:(values:List(ACTIVE)))&count=50');

  return (data.elements ?? []).map((el: any) => ({
    id: String(el.id),
    name: el.name ?? `Account ${el.id}`,
    status: el.status ?? 'UNKNOWN',
    currency: el.currency ?? '',
    type: el.type ?? '',
  }));
}

// ─── Campaign Groups ─────────────────────────────────────────────────────────

export async function listCampaignGroups(): Promise<LinkedInCampaignGroup[]> {
  const accountId = getAccountId();
  const data = await linkedInFetch(`/adAccounts/${accountId}/adCampaignGroups?count=100`);

  return (data.elements ?? []).map((el: any) => ({
    id: String(el.id),
    name: el.name ?? '',
    status: el.status ?? 'UNKNOWN',
    totalBudget: el.totalBudget,
    runSchedule: el.runSchedule,
  }));
}

export async function createCampaignGroup(input: CreateCampaignGroupInput) {
  const accountId = getAccountId();
  const accountUrn = `urn:li:sponsoredAccount:${accountId}`;

  const payload: Record<string, any> = {
    account: accountUrn,
    name: input.name,
    status: input.status ?? 'ACTIVE',
  };

  if (input.totalBudget) payload.totalBudget = input.totalBudget;
  if (input.runSchedule) payload.runSchedule = input.runSchedule;

  const result = await linkedInFetch(`/adAccounts/${accountId}/adCampaignGroups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { success: true, groupId: result?.id ?? null };
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<LinkedInCampaign[]> {
  const accountId = getAccountId();
  const accountUrn = `urn:li:sponsoredAccount:${accountId}`;

  const campaignsData = await linkedInFetch(
    `/adCampaigns?q=search&search=(account:(values:List(${encodeURIComponent(accountUrn)})))&count=100`
  );
  const campaigns: any[] = campaignsData.elements ?? [];
  if (campaigns.length === 0) return [];

  const campaignUrns = campaigns.map((c: any) => `urn:li:sponsoredCampaign:${c.id}`);
  const analyticsMap = await fetchCampaignAnalytics(accountId, campaignUrns);

  return campaigns.map((c: any) => {
    const metrics = analyticsMap.get(String(c.id)) ?? { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 };
    return {
      id: String(c.id),
      name: c.name ?? '',
      status: c.status ?? 'UNKNOWN',
      type: c.type ?? '',
      costType: c.costType ?? '',
      objectiveType: c.objectiveType ?? '',
      dailyBudget: c.dailyBudget ? parseFloat(c.dailyBudget.amount) : undefined,
      totalBudget: c.totalBudget ? parseFloat(c.totalBudget.amount) : undefined,
      currencyCode: c.dailyBudget?.currencyCode ?? c.totalBudget?.currencyCode ?? '',
      unitCost: c.unitCost ? parseFloat(c.unitCost.amount) : undefined,
      campaignGroup: c.campaignGroup,
      audienceExpansionEnabled: c.audienceExpansionEnabled,
      runSchedule: c.runSchedule,
      metrics,
    };
  });
}

async function fetchCampaignAnalytics(
  accountId: string,
  campaignUrns: string[]
): Promise<Map<string, LinkedInCampaign['metrics']>> {
  const map = new Map<string, LinkedInCampaign['metrics']>();
  if (campaignUrns.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dateRange = `(start:(year:${thirtyDaysAgo.getFullYear()},month:${thirtyDaysAgo.getMonth() + 1},day:${thirtyDaysAgo.getDate()}),end:(year:${now.getFullYear()},month:${now.getMonth() + 1},day:${now.getDate()}))`;
  const urnList = campaignUrns.map(u => encodeURIComponent(u)).join(',');
  const accountUrn = encodeURIComponent(`urn:li:sponsoredAccount:${accountId}`);

  try {
    const data = await linkedInFetch(
      `/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=${dateRange}&timeGranularity=ALL&accounts=List(${accountUrn})&campaigns=List(${urnList})&fields=List(impressions,clicks,costInLocalCurrency,externalWebsiteConversions)`
    );

    for (const el of data.elements ?? []) {
      const pivotUrn: string = el.pivotValue ?? '';
      const campaignId = pivotUrn.replace('urn:li:sponsoredCampaign:', '');
      const impressions = Number(el.impressions ?? 0);
      const clicks = Number(el.clicks ?? 0);
      map.set(campaignId, {
        impressions,
        clicks,
        spend: parseFloat(el.costInLocalCurrency ?? '0'),
        conversions: Number(el.externalWebsiteConversions ?? 0),
        ctr: impressions > 0 ? clicks / impressions : 0,
      });
    }
  } catch (err) {
    console.error('LinkedIn analytics fetch failed (non-fatal):', err);
  }

  return map;
}

// Docs: POST /adAccounts/{adAccountID}/adCampaigns
export async function createCampaign(input: CreateLinkedInCampaignInput) {
  const accountId = getAccountId();
  const accountUrn = `urn:li:sponsoredAccount:${accountId}`;

  const payload: Record<string, any> = {
    account: accountUrn,
    name: input.name,
    status: input.status ?? 'PAUSED',
    type: input.type,
    costType: input.costType,
    objectiveType: input.objectiveType,
    creativeSelection: 'OPTIMIZED',
    audienceExpansionEnabled: input.audienceExpansionEnabled ?? false,
    offsiteDeliveryEnabled: false,
    dailyBudget: {
      amount: String(input.dailyBudget),
      currencyCode: input.currencyCode ?? 'USD',
    },
    locale: input.locale ?? { country: 'US', language: 'en' },
  };

  if (input.unitCost) {
    payload.unitCost = {
      amount: String(input.unitCost),
      currencyCode: input.currencyCode ?? 'USD',
    };
  }

  if (input.totalBudget) {
    payload.totalBudget = {
      amount: String(input.totalBudget),
      currencyCode: input.currencyCode ?? 'USD',
    };
  }

  if (input.campaignGroupId) {
    payload.campaignGroup = `urn:li:sponsoredCampaignGroup:${input.campaignGroupId}`;
  }

  if (input.runSchedule) {
    payload.runSchedule = input.runSchedule;
  }

  if (input.targetingCriteria) {
    payload.targetingCriteria = input.targetingCriteria;
  }

  const result = await linkedInFetch(`/adAccounts/${accountId}/adCampaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { success: true, campaignId: result?.id ?? null };
}

// ─── Creatives ───────────────────────────────────────────────────────────────

export async function listCreatives(campaignId?: string): Promise<LinkedInCreative[]> {
  const accountId = getAccountId();
  let url = `/adAccounts/${accountId}/creatives?count=100`;
  if (campaignId) {
    url += `&q=search&search=(campaign:(values:List(${encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`)})))`;
  }

  const data = await linkedInFetch(url);

  return (data.elements ?? []).map((el: any) => ({
    id: String(el.id ?? ''),
    campaignId: el.campaign ? el.campaign.replace('urn:li:sponsoredCampaign:', '') : '',
    status: el.status ?? 'UNKNOWN',
    type: el.type ?? '',
    title: el.variables?.data?.['com.linkedin.ads.TextAdCreativeVariables']?.title,
    text: el.variables?.data?.['com.linkedin.ads.TextAdCreativeVariables']?.text,
    clickUri: el.variables?.clickUri,
  }));
}

// Docs: POST /adAccounts/{adAccountID}/creatives
export async function createCreative(input: CreateCreativeInput) {
  const accountId = getAccountId();

  const payload: Record<string, any> = {
    campaign: `urn:li:sponsoredCampaign:${input.campaignId}`,
    status: input.status ?? 'ACTIVE',
    type: input.type,
    variables: {
      clickUri: input.clickUri,
      data: {},
    },
  };

  if (input.type === 'TEXT_AD' && input.title && input.text) {
    payload.variables.data = {
      'com.linkedin.ads.TextAdCreativeVariables': {
        title: input.title,
        text: input.text,
      },
    };
  }

  const result = await linkedInFetch(`/adAccounts/${accountId}/creatives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { success: true, creativeId: result?.id ?? null };
}

// ─── Targeting ───────────────────────────────────────────────────────────────

export async function listTargetingFacets(): Promise<TargetingFacet[]> {
  const data = await linkedInFetch('/adTargetingFacets');

  return (data.elements ?? []).map((el: any) => ({
    facetName: el.facetName ?? '',
    entityTypes: el.entityTypes ?? [],
    urn: el.$URN ?? '',
  }));
}

export async function listTargetingEntities(facetUrn: string): Promise<TargetingEntity[]> {
  const data = await linkedInFetch(
    `/adTargetingEntities?q=adTargetingFacet&queryVersion=QUERY_USES_URNS&facet=${encodeURIComponent(facetUrn)}`
  );

  return (data.elements ?? []).map((el: any) => ({
    urn: el.urn ?? '',
    facetUrn: el.facetUrn ?? '',
    name: el.name ?? '',
  }));
}

export async function getAudienceCounts(
  includedFacets: Record<string, string[]>,
  excludedFacets?: Record<string, string[]>
): Promise<AudienceCount> {
  const params: string[] = ['q=targetingCriteria'];

  for (const [facet, urns] of Object.entries(includedFacets)) {
    urns.forEach((urn, i) => {
      params.push(`target.includedTargetingFacets.${facet}[${i}]=${encodeURIComponent(urn)}`);
    });
  }

  if (excludedFacets) {
    for (const [facet, urns] of Object.entries(excludedFacets)) {
      urns.forEach((urn, i) => {
        params.push(`target.excludingTargetingFacets.${facet}[${i}]=${encodeURIComponent(urn)}`);
      });
    }
  }

  const data = await linkedInFetch(`/audienceCounts?${params.join('&')}`);
  const el = data.elements?.[0] ?? {};
  return { total: el.total ?? 0, active: el.active ?? 0 };
}

// ─── Budget Pricing ──────────────────────────────────────────────────────────

export async function getBudgetPricing(opts: {
  bidType: 'CPC' | 'CPM' | 'CPV';
  campaignType: string;
  dailyBudgetAmount: number;
  currencyCode?: string;
  includedFacets?: Record<string, string[]>;
  excludedFacets?: Record<string, string[]>;
}): Promise<BudgetPricing | null> {
  const accountId = getAccountId();
  const accountUrn = encodeURIComponent(`urn:li:sponsoredAccount:${accountId}`);
  const currency = opts.currencyCode ?? 'USD';

  const params: string[] = [
    `account=${accountUrn}`,
    `bidType=${opts.bidType}`,
    `campaignType=${opts.campaignType}`,
    `matchType=EXACT`,
    `q=criteria`,
    `dailyBudget.amount=${opts.dailyBudgetAmount}`,
    `dailyBudget.currencyCode=${currency}`,
  ];

  if (opts.includedFacets) {
    for (const [facet, urns] of Object.entries(opts.includedFacets)) {
      urns.forEach((urn, i) => {
        params.push(`target.includedTargetingFacets.${facet}[${i}]=${encodeURIComponent(urn)}`);
      });
    }
  }

  if (opts.excludedFacets) {
    for (const [facet, urns] of Object.entries(opts.excludedFacets)) {
      urns.forEach((urn, i) => {
        params.push(`target.excludingTargetingFacets.${facet}[${i}]=${encodeURIComponent(urn)}`);
      });
    }
  }

  const data = await linkedInFetch(`/adBudgetPricing?${params.join('&')}`);
  return data.elements?.[0] ?? null;
}
