import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { AmazonAdsProfile, AmazonAdsCampaign, CreateAmazonAdsCampaignInput } from './types';

const API_BASE = 'https://advertising-api.amazon.com';

// ─── Core HTTP ────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Amazon Ads. Complete OAuth first.');

  if (isTokenExpired(tokens) && tokens.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    storeTokens({
      ...tokens,
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
      expires_in: refreshed.expires_in,
      token_acquired_at: Date.now(),
    });
    return refreshed.access_token;
  }

  return tokens.access_token;
}

async function amazonFetch(path: string, init?: RequestInit, profileId?: string): Promise<any> {
  const token = await getAccessToken();
  const clientId = process.env.AMAZON_ADS_CLIENT_ID;
  if (!clientId) throw new Error('Missing AMAZON_ADS_CLIENT_ID');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Amazon-Advertising-API-ClientId': clientId,
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };

  if (profileId) {
    headers['Amazon-Advertising-API-Scope'] = profileId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Amazon Ads API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function getProfileId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.profile_id) throw new Error('No Amazon Ads profile selected.');
  return tokens.profile_id;
}

// ─── Profiles (Ad Accounts) ───────────────────────────────────────────────────

export async function listProfiles(): Promise<AmazonAdsProfile[]> {
  const data: any[] = await amazonFetch('/v2/profiles');

  return data.map((p: any) => ({
    profileId: String(p.profileId),
    name: p.accountInfo?.name ?? `Profile ${p.profileId}`,
    countryCode: p.countryCode ?? '',
    currencyCode: p.currencyCode ?? '',
    timezone: p.timezone ?? '',
    type: p.accountInfo?.type ?? 'seller',
    marketplaceId: p.accountInfo?.marketplaceStringId ?? '',
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<AmazonAdsCampaign[]> {
  const profileId = getProfileId();

  // Fetch Sponsored Products campaigns
  const spRaw: any = await amazonFetch(
    '/v2/sp/campaigns?stateFilter=enabled,paused',
    undefined,
    profileId
  ).catch(() => []);

  // Fetch Sponsored Brands campaigns
  const sbRaw: any = await amazonFetch(
    '/v4/campaigns?campaignType=sponsoredBrands&stateFilter=enabled,paused',
    undefined,
    profileId
  ).catch(() => []);

  const spData: any[] = Array.isArray(spRaw) ? spRaw : (spRaw?.campaigns ?? []);
  const sbData: any[] = Array.isArray(sbRaw) ? sbRaw : (sbRaw?.campaigns ?? []);

  const spCampaigns = spData.map((c: any) => ({
    id: String(c.campaignId),
    name: c.name,
    campaignType: 'sponsoredProducts',
    targetingType: c.targetingType ?? 'manual',
    state: c.state ?? 'paused',
    daily_budget: c.dailyBudget ?? 0,
    start_date: c.startDate,
    end_date: c.endDate,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, acos: 0, roas: 0 },
  }));

  const sbCampaigns = sbData.map((c: any) => ({
    id: String(c.campaignId ?? c.id),
    name: c.name,
    campaignType: 'sponsoredBrands',
    targetingType: 'manual',
    state: c.state ?? c.status ?? 'paused',
    daily_budget: c.budget?.budget ?? c.dailyBudget ?? 0,
    start_date: c.startDate,
    end_date: c.endDate,
    metrics: { impressions: 0, clicks: 0, spend: 0, sales: 0, acos: 0, roas: 0 },
  }));

  return [...spCampaigns, ...sbCampaigns];
}

export async function createCampaign(input: CreateAmazonAdsCampaignInput) {
  const profileId = getProfileId();

  const payload = {
    name: input.name,
    campaignType: input.campaignType,
    targetingType: input.targetingType,
    state: input.state ?? 'paused',
    dailyBudget: input.daily_budget,
    startDate: input.start_date.replace(/-/g, ''),
    ...(input.end_date ? { endDate: input.end_date.replace(/-/g, '') } : {}),
  };

  const result = await amazonFetch(
    '/v2/sp/campaigns',
    { method: 'POST', body: JSON.stringify([payload]) },
    profileId
  );

  const created = Array.isArray(result) ? result[0] : result;
  return { success: true, campaignId: created?.campaignId ? String(created.campaignId) : null };
}
