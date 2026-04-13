import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { connectAndGetToken } from './oauth';
import type { AppleSearchAdsOrg, AppleSearchAdsCampaign, CreateAppleSearchAdsCampaignInput } from './types';

const API_BASE = 'https://api.searchads.apple.com/api/v5';

// ─── Core HTTP ─────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Apple Search Ads. Click Connect first.');

  if (isTokenExpired(tokens)) {
    // Apple client_credentials tokens can't be refreshed — re-fetch
    const fresh = await connectAndGetToken();
    storeTokens({
      ...tokens,
      access_token: fresh.access_token,
      expires_in: fresh.expires_in,
      token_acquired_at: Date.now(),
    });
    return fresh.access_token;
  }

  return tokens.access_token;
}

function getOrgId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.org_id) throw new Error('No Apple Search Ads organization selected.');
  return tokens.org_id;
}

async function appleFetch(endpoint: string, init?: RequestInit, withOrg = false): Promise<any> {
  const token = await getAccessToken();
  const orgId = withOrg ? getOrgId() : null;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(orgId ? { 'X-AP-Context': `orgId=${orgId}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apple Search Ads API ${res.status}: ${errText}`);
  }

  return res.json();
}

// ─── Organizations ─────────────────────────────────────────────────────────────

export async function listOrganizations(): Promise<AppleSearchAdsOrg[]> {
  const data = await appleFetch('/acls');
  const orgs: any[] = data.data ?? [];

  return orgs.map((o: any) => ({
    orgId: o.orgId ?? 0,
    orgName: o.orgName ?? '',
    currency: o.currency ?? 'USD',
    timeZone: o.timeZone ?? 'UTC',
    paymentModel: o.paymentModel ?? 'PAYG',
    roleNames: o.roleNames ?? [],
  }));
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<AppleSearchAdsCampaign[]> {
  const data = await appleFetch('/campaigns?limit=100', undefined, true);
  const campaigns: any[] = data.data ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignMetrics(campaigns.map((c: any) => String(c.id)));

  return campaigns.map((c: any) => {
    const metrics = metricsMap.get(String(c.id)) ?? {
      impressions: 0, taps: 0, conversions: 0, spend: 0, ttr: 0, cpt: 0, cpa: 0,
    };
    return {
      id: String(c.id),
      name: c.name ?? '',
      status: c.status ?? 'UNKNOWN',
      servingStatus: c.servingStatus ?? 'NOT_RUNNING',
      budgetAmount: c.budgetAmount ?? { amount: '0', currency: 'USD' },
      dailyBudgetAmount: c.dailyBudgetAmount,
      countriesOrRegions: c.countriesOrRegions ?? [],
      adamId: c.adamId ?? 0,
      startTime: c.startTime ?? '',
      endTime: c.endTime,
      metrics,
    };
  });
}

async function fetchCampaignMetrics(
  campaignIds: string[]
): Promise<Map<string, AppleSearchAdsCampaign['metrics']>> {
  const map = new Map<string, AppleSearchAdsCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  try {
    const body = {
      startTime: fmt(thirtyDaysAgo),
      endTime: fmt(now),
      timeZone: 'UTC',
      granularity: 'TOTAL',
      selector: {
        conditions: [{ field: 'campaignId', operator: 'IN', values: campaignIds.slice(0, 20) }],
        orderBy: [{ field: 'impressions', sortOrder: 'DESCENDING' }],
        pagination: { offset: 0, limit: 20 },
      },
      groupBy: ['campaignId'],
      returnRowTotals: true,
      returnRecordsWithNoMetrics: true,
    };

    const data = await appleFetch('/reports/campaigns', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);

    const rows: any[] = data.data?.reportingDataResponse?.row ?? [];

    for (const row of rows) {
      const id = String(row.metadata?.campaignId ?? '');
      if (!id) continue;
      const t = row.total ?? {};
      map.set(id, {
        impressions: Number(t.impressions ?? 0),
        taps: Number(t.taps ?? 0),
        conversions: Number(t.conversions ?? 0),
        spend: parseFloat(t.localSpend?.amount ?? '0'),
        ttr: parseFloat(t.ttr ?? '0'),
        cpt: parseFloat(t.avgCPT?.amount ?? '0'),
        cpa: parseFloat(t.avgCPA?.amount ?? '0'),
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateAppleSearchAdsCampaignInput) {
  const currency = input.currency ?? 'USD';

  const payload: Record<string, any> = {
    name: input.name,
    adamId: input.adamId,
    budgetAmount: { amount: input.budgetAmount, currency },
    status: input.status ?? 'PAUSED',
    countriesOrRegions: input.countriesOrRegions ?? ['US'],
    startTime: new Date().toISOString(),
  };

  if (input.dailyBudgetAmount) {
    payload.dailyBudgetAmount = { amount: input.dailyBudgetAmount, currency };
  }

  const result = await appleFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);

  const created = result.data;
  return { success: true, campaignId: created?.id ? String(created.id) : null };
}
