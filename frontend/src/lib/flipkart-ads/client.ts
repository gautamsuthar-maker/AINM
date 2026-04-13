import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { FlipkartAdvertiser, FlipkartAdsCampaign, CreateFlipkartAdsCampaignInput } from './types';

const API_BASE = 'https://api.flipkart.net/ads/api/v1';

// ─── Core HTTP ─────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Flipkart Ads. Complete OAuth first.');

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

function getAdvertiserId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.advertiser_id) throw new Error('No Flipkart Ads advertiser selected.');
  return tokens.advertiser_id;
}

async function flipkartFetch(endpoint: string, init?: RequestInit): Promise<any> {
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
    throw new Error(`Flipkart Ads API ${res.status}: ${errText}`);
  }

  return res.json();
}

// ─── Advertisers ──────────────────────────────────────────────────────────────

export async function listAdvertisers(): Promise<FlipkartAdvertiser[]> {
  const data = await flipkartFetch('/advertisers');
  const advertisers: any[] = data.advertisers ?? data.data ?? [];

  return advertisers.map((a: any) => ({
    id: a.advertiserId ?? a.id ?? '',
    name: a.advertiserName ?? a.name ?? '',
    currency: a.currency ?? 'INR',
    status: a.status ?? 'ACTIVE',
    timezone: a.timezone ?? 'Asia/Kolkata',
  }));
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<FlipkartAdsCampaign[]> {
  const advertiserId = getAdvertiserId();
  const data = await flipkartFetch(`/campaigns?advertiserId=${advertiserId}&limit=100`);
  const campaigns: any[] = data.campaigns ?? data.data ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignMetrics(advertiserId, campaigns.map((c: any) => String(c.campaignId ?? c.id)));

  return campaigns.map((c: any) => {
    const id = String(c.campaignId ?? c.id ?? '');
    const metrics = metricsMap.get(id) ?? {
      impressions: 0, clicks: 0, orders: 0, spend: 0, ctr: 0, cpc: 0, roas: 0, acos: 0,
    };
    return {
      id,
      name: c.campaignName ?? c.name ?? '',
      type: c.campaignType ?? c.type ?? 'SPONSORED_PRODUCTS',
      status: c.status ?? 'UNKNOWN',
      budget: Number(c.budget ?? 0),
      dailyBudget: c.dailyBudget ? Number(c.dailyBudget) : undefined,
      startDate: c.startDate,
      endDate: c.endDate,
      metrics,
    };
  });
}

async function fetchCampaignMetrics(
  advertiserId: string,
  campaignIds: string[]
): Promise<Map<string, FlipkartAdsCampaign['metrics']>> {
  const map = new Map<string, FlipkartAdsCampaign['metrics']>();
  if (campaignIds.length === 0) return map;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  try {
    const params = new URLSearchParams({
      advertiserId,
      campaignIds: campaignIds.slice(0, 20).join(','),
      startDate: fmt(thirtyDaysAgo),
      endDate: fmt(now),
      granularity: 'TOTAL',
    });

    const data = await flipkartFetch(`/reports/campaign?${params}`);
    const rows: any[] = data.report ?? data.data ?? [];

    for (const row of rows) {
      const id = String(row.campaignId ?? row.id ?? '');
      if (!id) continue;
      const clicks = Number(row.clicks ?? 0);
      const spend = Number(row.spend ?? row.totalSpend ?? 0);
      const revenue = Number(row.revenue ?? row.totalRevenue ?? 0);
      map.set(id, {
        impressions: Number(row.impressions ?? 0),
        clicks,
        orders: Number(row.orders ?? row.conversions ?? 0),
        spend,
        ctr: clicks > 0 ? Number(row.ctr ?? 0) : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        roas: spend > 0 ? revenue / spend : 0,
        acos: revenue > 0 ? (spend / revenue) * 100 : 0,
      });
    }
  } catch {
    // non-fatal — return empty metrics
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateFlipkartAdsCampaignInput) {
  const advertiserId = getAdvertiserId();

  const payload: Record<string, any> = {
    advertiserId,
    campaignName: input.name,
    campaignType: input.type,
    status: input.status ?? 'PAUSED',
    budget: input.budget,
  };

  if (input.dailyBudget !== undefined) payload.dailyBudget = input.dailyBudget;
  if (input.startDate) payload.startDate = input.startDate;
  if (input.endDate) payload.endDate = input.endDate;

  const result = await flipkartFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const created = result.campaign ?? result.data ?? result;
  return { success: true, campaignId: created?.campaignId ?? created?.id ?? null };
}
