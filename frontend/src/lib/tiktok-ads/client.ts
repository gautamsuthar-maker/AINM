import { getStoredTokens } from './token-store';
import type { TikTokAdvertiser, TikTokCampaign, CreateTikTokCampaignInput } from './types';

const API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

// ─── Core HTTP ───────────────────────────────────────────────────────────────

function getAccessToken(): string {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to TikTok Ads. Complete OAuth first.');
  return tokens.access_token;
}

function getAdvertiserId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.advertiser_id) throw new Error('No TikTok advertiser account selected.');
  return tokens.advertiser_id;
}

async function tiktokFetch(endpoint: string, init?: RequestInit): Promise<any> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      'Access-Token': token,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TikTok API ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`TikTok API error: ${json.message}`);
  }

  return json.data;
}

// ─── Advertisers ─────────────────────────────────────────────────────────────

export async function listAdvertisers(): Promise<TikTokAdvertiser[]> {
  const token = getAccessToken();
  const params = new URLSearchParams({
    access_token: token,
    app_id: process.env.TIKTOK_ADS_APP_ID!,
    secret: process.env.TIKTOK_ADS_SECRET!,
  });

  const res = await fetch(`${API_BASE}/oauth2/advertiser/get/?${params}`, {
    headers: { 'Access-Token': token, 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TikTok advertisers fetch failed: ${errText}`);
  }

  const json = await res.json();
  if (json.code !== 0) throw new Error(`TikTok error: ${json.message}`);

  const list: any[] = json.data?.list ?? [];
  return list.map((a: any) => ({
    advertiser_id: String(a.advertiser_id),
    advertiser_name: a.advertiser_name ?? '',
    status: a.status ?? 'UNKNOWN',
    currency: a.currency ?? '',
    timezone: a.timezone ?? '',
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<TikTokCampaign[]> {
  const advertiserId = getAdvertiserId();

  const params = new URLSearchParams({
    advertiser_id: advertiserId,
    page_size: '50',
    fields: JSON.stringify(['campaign_id', 'campaign_name', 'objective_type', 'budget', 'budget_mode', 'operation_status']),
  });

  const data = await tiktokFetch(`/campaign/get/?${params}`);
  const campaigns: any[] = data?.list ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignMetrics(
    advertiserId,
    campaigns.map((c: any) => String(c.campaign_id))
  );

  return campaigns.map((c: any) => {
    const id = String(c.campaign_id);
    const metrics = metricsMap.get(id) ?? { impressions: 0, clicks: 0, spend: 0, ctr: 0, cpc: 0, conversions: 0 };
    return {
      campaign_id: id,
      campaign_name: c.campaign_name ?? '',
      status: c.operation_status ?? 'UNKNOWN',
      objective_type: c.objective_type ?? '',
      budget: c.budget ?? 0,
      budget_mode: c.budget_mode ?? '',
      operation_status: c.operation_status ?? '',
      metrics,
    };
  });
}

async function fetchCampaignMetrics(
  advertiserId: string,
  campaignIds: string[]
): Promise<Map<string, TikTokCampaign['metrics']>> {
  const map = new Map<string, TikTokCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  try {
    const data = await tiktokFetch('/report/integrated/get/', {
      method: 'POST',
      body: JSON.stringify({
        advertiser_id: advertiserId,
        report_type: 'BASIC',
        data_level: 'AUCTION_CAMPAIGN',
        dimensions: ['campaign_id'],
        metrics: ['impressions', 'clicks', 'spend', 'ctr', 'cpc', 'conversion'],
        start_date: fmt(thirtyDaysAgo),
        end_date: fmt(now),
        page_size: 100,
        filtering: [{ field_name: 'campaign_ids', filter_type: 'IN', filter_value: JSON.stringify(campaignIds) }],
      }),
    });

    const rows: any[] = data?.list ?? [];
    for (const row of rows) {
      const id = String(row.dimensions?.campaign_id ?? '');
      if (!id) continue;
      const m = row.metrics ?? {};
      map.set(id, {
        impressions: Number(m.impressions ?? 0),
        clicks: Number(m.clicks ?? 0),
        spend: Number(m.spend ?? 0),
        ctr: Number(m.ctr ?? 0),
        cpc: Number(m.cpc ?? 0),
        conversions: Number(m.conversion ?? 0),
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateTikTokCampaignInput) {
  const advertiserId = getAdvertiserId();

  const payload: Record<string, any> = {
    advertiser_id: advertiserId,
    campaign_name: input.campaign_name,
    objective_type: input.objective_type,
    budget_mode: input.budget_mode,
    operation_status: input.operation_status ?? 'DISABLE',
  };

  if (input.budget !== undefined) payload.budget = input.budget;

  const data = await tiktokFetch('/campaign/create/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return { success: true, campaignId: data?.campaign_id ?? null };
}
