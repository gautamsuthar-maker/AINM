import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { RedditAdAccount, RedditAdsCampaign, CreateRedditAdsCampaignInput } from './types';

const API_BASE = 'https://ads-api.reddit.com/api/v2.0';

// ─── Core HTTP ───────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Reddit Ads. Complete OAuth first.');

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
  if (!tokens?.ad_account_id) throw new Error('No Reddit Ads account selected.');
  return tokens.ad_account_id;
}

async function redditFetch(endpoint: string, init?: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AINM/1.0',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Reddit Ads API ${res.status}: ${errText}`);
  }

  return res.json();
}

// ─── Ad Accounts ─────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<RedditAdAccount[]> {
  const data = await redditFetch('/accounts');
  const accounts: any[] = data.data ?? [];

  return accounts.map((a: any) => ({
    id: a.id ?? a.account_id ?? '',
    name: a.name ?? '',
    currency: a.currency ?? 'USD',
    status: a.status ?? 'ACTIVE',
    timezone: a.timezone ?? '',
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<RedditAdsCampaign[]> {
  const accountId = getAdAccountId();
  const data = await redditFetch(`/campaigns?account_id=${accountId}&limit=100`);
  const campaigns: any[] = data.data ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignMetrics(accountId, campaigns.map((c: any) => c.id));

  return campaigns.map((c: any) => {
    const metrics = metricsMap.get(c.id) ?? { impressions: 0, clicks: 0, spend_cents: 0, ctr: 0, cpc_cents: 0, video_completions: 0 };
    return {
      id: c.id,
      name: c.name ?? '',
      status: c.status ?? 'UNKNOWN',
      objective: c.objective ?? '',
      daily_budget_cents: c.daily_budget_cents,
      total_budget_cents: c.total_budget_cents,
      start_date: c.start_date,
      end_date: c.end_date,
      metrics,
    };
  });
}

async function fetchCampaignMetrics(
  accountId: string,
  campaignIds: string[]
): Promise<Map<string, RedditAdsCampaign['metrics']>> {
  const map = new Map<string, RedditAdsCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  try {
    const params = new URLSearchParams({
      account_id: accountId,
      campaign_ids: campaignIds.slice(0, 20).join(','),
      date_start: fmt(thirtyDaysAgo),
      date_stop: fmt(now),
      breakdown: 'campaign',
      fields: 'impressions,clicks,spend,ctr,cpc,video_completions',
    });

    const data = await redditFetch(`/campaigns/analytics?${params}`);
    const rows: any[] = data.data ?? [];

    for (const row of rows) {
      const id = row.campaign_id ?? row.id ?? '';
      if (!id) continue;
      map.set(id, {
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        spend_cents: Math.round(Number(row.spend ?? 0) * 100),
        ctr: Number(row.ctr ?? 0),
        cpc_cents: Math.round(Number(row.cpc ?? 0) * 100),
        video_completions: Number(row.video_completions ?? 0),
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateRedditAdsCampaignInput) {
  const accountId = getAdAccountId();

  const payload: Record<string, any> = {
    account_id: accountId,
    name: input.name,
    objective: input.objective,
    status: input.status ?? 'PAUSED',
  };

  if (input.daily_budget_cents !== undefined) payload.daily_budget_cents = input.daily_budget_cents;
  if (input.total_budget_cents !== undefined) payload.total_budget_cents = input.total_budget_cents;
  if (input.start_date) payload.start_date = input.start_date;
  if (input.end_date) payload.end_date = input.end_date;

  const result = await redditFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const created = result.data;
  return { success: true, campaignId: created?.id ?? null };
}
