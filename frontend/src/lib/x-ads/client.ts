import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { XAdAccount, XAdsCampaign, CreateXAdsCampaignInput } from './types';

const API_BASE = 'https://ads-api.twitter.com/9';

// ─── Core HTTP ───────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to X Ads. Complete OAuth first.');

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

function getAdAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.ad_account_id) throw new Error('No X Ads account selected.');
  return tokens.ad_account_id;
}

async function xFetch(endpoint: string, init?: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`X Ads API ${res.status}: ${errText}`);
  }

  return res.json();
}

// ─── Ad Accounts ─────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<XAdAccount[]> {
  const data = await xFetch('/accounts');
  const accounts: any[] = data.data ?? [];

  return accounts.map((a: any) => ({
    id: a.id,
    name: a.name ?? '',
    timezone: a.timezone ?? '',
    currency: a.currency ?? '',
    business_name: a.business_name,
    approval_status: a.approval_status ?? 'UNKNOWN',
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<XAdsCampaign[]> {
  const accountId = getAdAccountId();
  const data = await xFetch(`/accounts/${accountId}/campaigns?count=100`);
  const campaigns: any[] = data.data ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignMetrics(accountId, campaigns.map((c: any) => c.id));

  return campaigns.map((c: any) => {
    const metrics = metricsMap.get(c.id) ?? { impressions: 0, clicks: 0, spend: 0, engagements: 0, ctr: 0, cpe: 0 };
    return {
      id: c.id,
      name: c.name ?? '',
      status: c.entity_status ?? 'UNKNOWN',
      objective: c.objective ?? '',
      daily_budget_amount_local_micro: c.daily_budget_amount_local_micro,
      total_budget_amount_local_micro: c.total_budget_amount_local_micro,
      start_time: c.start_time,
      end_time: c.end_time,
      metrics,
    };
  });
}

async function fetchCampaignMetrics(
  accountId: string,
  campaignIds: string[]
): Promise<Map<string, XAdsCampaign['metrics']>> {
  const map = new Map<string, XAdsCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace('.000Z', 'Z');

  try {
    const params = new URLSearchParams({
      entity: 'CAMPAIGN',
      entity_ids: campaignIds.slice(0, 20).join(','),
      granularity: 'TOTAL',
      metric_groups: 'ENGAGEMENT,BILLING',
      start_time: fmt(thirtyDaysAgo),
      end_time: fmt(now),
      placement: 'ALL_ON_TWITTER',
    });

    const data = await xFetch(`/stats/accounts/${accountId}?${params}`);
    const rows: any[] = data.data ?? [];

    for (const row of rows) {
      const id = row.id ?? '';
      const metrics = row.id_data?.[0]?.metrics ?? {};
      const impressions = Number((metrics.impressions ?? [0])[0] ?? 0);
      const clicks = Number((metrics.url_clicks ?? [0])[0] ?? 0);
      const spendMicro = Number((metrics.billed_charge_local_micro ?? [0])[0] ?? 0);
      const engagements = Number((metrics.engagements ?? [0])[0] ?? 0);

      map.set(id, {
        impressions,
        clicks,
        spend: spendMicro / 1_000_000,
        engagements,
        ctr: impressions > 0 ? clicks / impressions : 0,
        cpe: engagements > 0 ? (spendMicro / 1_000_000) / engagements : 0,
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateXAdsCampaignInput) {
  const accountId = getAdAccountId();

  const payload: Record<string, any> = {
    name: input.name,
    objective: input.objective,
    entity_status: input.status ?? 'PAUSED',
  };

  if (input.daily_budget_amount_local_micro !== undefined) {
    payload.daily_budget_amount_local_micro = input.daily_budget_amount_local_micro;
  }
  if (input.total_budget_amount_local_micro !== undefined) {
    payload.total_budget_amount_local_micro = input.total_budget_amount_local_micro;
  }
  if (input.start_time) payload.start_time = input.start_time;
  if (input.end_time) payload.end_time = input.end_time;

  const result = await xFetch(`/accounts/${accountId}/campaigns`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const created = result.data;
  return { success: true, campaignId: created?.id ?? null };
}
