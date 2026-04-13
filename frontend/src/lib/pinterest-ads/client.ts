import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { PinterestAdAccount, PinterestCampaign, CreatePinterestCampaignInput } from './types';

const API_BASE = 'https://api.pinterest.com/v5';

// ─── Core HTTP ────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Pinterest Ads. Complete OAuth first.');

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

async function pinterestFetch(path: string, init?: RequestInit): Promise<any> {
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
    throw new Error(`Pinterest API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function getAdAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.ad_account_id) throw new Error('No Pinterest Ads account selected.');
  return tokens.ad_account_id;
}

// ─── Ad Accounts ─────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<PinterestAdAccount[]> {
  const data = await pinterestFetch('/ad_accounts?include_shared_accounts=true');
  const items: any[] = data.items ?? [];
  return items.map((a: any) => ({
    id: a.id,
    name: a.name ?? `Account ${a.id}`,
    currency: a.currency ?? '',
    status: a.status ?? 'ACTIVE',
    owner: a.owner?.username,
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<PinterestCampaign[]> {
  const adAccountId = getAdAccountId();
  const data = await pinterestFetch(
    `/ad_accounts/${adAccountId}/campaigns?entity_statuses=ACTIVE,PAUSED`
  );
  const campaigns: any[] = data.items ?? [];

  if (campaigns.length === 0) return [];

  // Fetch analytics for all campaigns
  const analyticsMap = await fetchCampaignAnalytics(adAccountId, campaigns.map(c => c.id));

  return campaigns.map((c: any) => {
    const metrics = analyticsMap.get(c.id) ?? { impressions: 0, clicks: 0, spend: 0, saves: 0, ctr: 0, cpc: 0 };
    return {
      id: c.id,
      name: c.name,
      status: c.status ?? 'PAUSED',
      objective_type: c.objective_type ?? '',
      daily_spend_cap: c.daily_spend_cap ? c.daily_spend_cap / 1_000_000 : undefined,
      lifetime_spend_cap: c.lifetime_spend_cap ? c.lifetime_spend_cap / 1_000_000 : undefined,
      start_time: c.start_time ? new Date(c.start_time * 1000).toISOString() : undefined,
      end_time: c.end_time ? new Date(c.end_time * 1000).toISOString() : undefined,
      metrics,
    };
  });
}

async function fetchCampaignAnalytics(
  adAccountId: string,
  campaignIds: string[]
): Promise<Map<string, PinterestCampaign['metrics']>> {
  const map = new Map<string, PinterestCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      columns: 'IMPRESSION_1,OUTBOUND_CLICK_1,SPEND_IN_DOLLAR,SAVE,OUTBOUND_CLICK_1_RATE',
      granularity: 'TOTAL',
      campaign_ids: campaignIds.slice(0, 100).join(','),
    });

    const data = await pinterestFetch(
      `/ad_accounts/${adAccountId}/campaigns/analytics?${params}`
    );

    const rows: any[] = Array.isArray(data) ? data : (data.value ?? []);
    for (const row of rows) {
      const id = row.campaign_id ?? row.CAMPAIGN_ID;
      if (!id) continue;
      const m = row.metrics ?? row;
      map.set(String(id), {
        impressions: Number(m.IMPRESSION_1 ?? 0),
        clicks: Number(m.OUTBOUND_CLICK_1 ?? 0),
        spend: Number(m.SPEND_IN_DOLLAR ?? 0),
        saves: Number(m.SAVE ?? 0),
        ctr: Number(m.OUTBOUND_CLICK_1_RATE ?? 0),
        cpc: Number(m.OUTBOUND_CLICK_1 ?? 0) > 0
          ? Number(m.SPEND_IN_DOLLAR ?? 0) / Number(m.OUTBOUND_CLICK_1)
          : 0,
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

export async function createCampaign(input: CreatePinterestCampaignInput) {
  const adAccountId = getAdAccountId();

  const payload: Record<string, any> = {
    name: input.name,
    objective_type: input.objective_type,
    status: input.status ?? 'PAUSED',
  };

  if (input.daily_spend_cap !== undefined) {
    payload.daily_spend_cap = Math.round(input.daily_spend_cap * 1_000_000);
  }
  if (input.lifetime_spend_cap !== undefined) {
    payload.lifetime_spend_cap = Math.round(input.lifetime_spend_cap * 1_000_000);
  }
  if (input.start_time) payload.start_time = input.start_time;
  if (input.end_time) payload.end_time = input.end_time;

  const result = await pinterestFetch(`/ad_accounts/${adAccountId}/campaigns`, {
    method: 'POST',
    body: JSON.stringify([payload]),
  });

  const created = Array.isArray(result) ? result[0] : result?.items?.[0] ?? result;
  return { success: true, campaignId: created?.id ?? null };
}
