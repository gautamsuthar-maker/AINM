import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { SnapchatAdAccount, SnapchatCampaign, CreateSnapchatCampaignInput } from './types';

const API_BASE = 'https://adsapi.snapchat.com';

// ─── Core HTTP ───────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Snapchat Ads. Complete OAuth first.');

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

async function snapchatFetch(path: string, init?: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Snapchat API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function getAdAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.ad_account_id) throw new Error('No Snapchat Ads account selected.');
  return tokens.ad_account_id;
}

// ─── Organizations & Ad Accounts ─────────────────────────────────────────────

export async function listAdAccounts(): Promise<SnapchatAdAccount[]> {
  const orgData = await snapchatFetch('/v1/me/organizations');
  const orgs: any[] = orgData.organizations ?? [];
  if (orgs.length === 0) return [];

  const orgId = orgs[0].organization.id;
  const data = await snapchatFetch(`/v1/organizations/${orgId}/adaccounts`);

  return (data.adaccounts ?? []).map((el: any) => ({
    id: el.adaccount.id,
    name: el.adaccount.name,
    status: el.adaccount.status ?? 'UNKNOWN',
    currency: el.adaccount.currency_code ?? '',
    organization_id: el.adaccount.organization_id ?? orgId,
    timezone: el.adaccount.timezone ?? '',
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<SnapchatCampaign[]> {
  const adAccountId = getAdAccountId();
  const data = await snapchatFetch(`/v1/adaccounts/${adAccountId}/campaigns`);
  const campaigns: any[] = data.campaigns ?? [];
  if (campaigns.length === 0) return [];

  const campaignIds = campaigns.map((el: any) => el.campaign.id);
  const statsMap = await fetchCampaignStats(campaignIds);

  return campaigns.map((el: any) => {
    const c = el.campaign;
    const metrics = statsMap.get(c.id) ?? { impressions: 0, swipes: 0, spend: 0, conversions: 0, swipe_up_rate: 0 };
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective ?? '',
      daily_budget_micro: c.daily_budget_micro,
      lifetime_spend_cap_micro: c.lifetime_spend_cap_micro,
      start_time: c.start_time,
      end_time: c.end_time,
      created_at: c.created_at,
      updated_at: c.updated_at,
      metrics,
    };
  });
}

async function fetchCampaignStats(
  campaignIds: string[]
): Promise<Map<string, SnapchatCampaign['metrics']>> {
  const map = new Map<string, SnapchatCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startTime = thirtyDaysAgo.toISOString();
  const endTime = now.toISOString();

  for (const campaignId of campaignIds.slice(0, 20)) {
    try {
      const params = new URLSearchParams({
        granularity: 'TOTAL',
        start_time: startTime,
        end_time: endTime,
        fields: 'impressions,swipes,spend,conversion_purchases',
      });
      const data = await snapchatFetch(`/v1/campaigns/${campaignId}/stats?${params}`);

      const stat = data.timeseries_stats?.[0]?.timeseries_stat;
      const stats = stat?.stats ?? {};
      const impressions = Number(stats.impressions ?? 0);
      const swipes = Number(stats.swipes ?? 0);
      const spendMicros = Number(stats.spend ?? 0);

      map.set(campaignId, {
        impressions,
        swipes,
        spend: spendMicros / 1_000_000,
        conversions: Number(stats.conversion_purchases ?? 0),
        swipe_up_rate: impressions > 0 ? swipes / impressions : 0,
      });
    } catch {
      // non-fatal per campaign — leave metrics as zeros
    }
  }

  return map;
}

export async function createCampaign(input: CreateSnapchatCampaignInput) {
  const adAccountId = getAdAccountId();

  const campaignPayload: Record<string, any> = {
    name: input.name,
    status: input.status ?? 'PAUSED',
    objective: input.objective,
  };

  if (input.daily_budget_micro !== undefined) campaignPayload.daily_budget_micro = input.daily_budget_micro;
  if (input.lifetime_spend_cap_micro !== undefined) campaignPayload.lifetime_spend_cap_micro = input.lifetime_spend_cap_micro;
  if (input.start_time) campaignPayload.start_time = input.start_time;
  if (input.end_time) campaignPayload.end_time = input.end_time;

  const result = await snapchatFetch(`/v1/adaccounts/${adAccountId}/campaigns`, {
    method: 'POST',
    body: JSON.stringify({ campaigns: [campaignPayload] }),
  });

  const created = result.campaigns?.[0]?.campaign;
  return { success: true, campaignId: created?.id ?? null };
}
