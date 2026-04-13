import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshLongLivedToken } from './oauth';
import type { MetaAdAccount, MetaAdsCampaign, CreateMetaAdsCampaignInput } from './types';

const API_BASE = 'https://graph.facebook.com/v19.0';

// ─── Core HTTP ─────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Meta Ads. Complete OAuth first.');

  if (isTokenExpired(tokens)) {
    const refreshed = await refreshLongLivedToken(tokens.access_token);
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

function getAdAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.ad_account_id) throw new Error('No Meta Ads account selected.');
  // Ensure act_ prefix
  const id = tokens.ad_account_id;
  return id.startsWith('act_') ? id : `act_${id}`;
}

async function metaFetch(endpoint: string, init?: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const sep = endpoint.includes('?') ? '&' : '?';
  const res = await fetch(`${API_BASE}${endpoint}${sep}access_token=${token}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message ?? errData?.error ?? `HTTP ${res.status}`;
    throw new Error(`Meta Ads API error: ${msg}`);
  }

  return res.json();
}

// ─── Ad Accounts ──────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<MetaAdAccount[]> {
  const data = await metaFetch(
    '/me/adaccounts?fields=id,name,currency,timezone_name,account_status&limit=100'
  );
  const accounts: any[] = data.data ?? [];

  return accounts.map((a: any) => ({
    id: a.id ?? '',
    name: a.name ?? '',
    currency: a.currency ?? 'USD',
    timezone: a.timezone_name ?? 'UTC',
    status: a.account_status ?? 1,
  }));
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<MetaAdsCampaign[]> {
  const adAccountId = getAdAccountId();
  const data = await metaFetch(
    `/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&limit=100`
  );
  const campaigns: any[] = data.data ?? [];

  if (campaigns.length === 0) return [];

  const metricsMap = await fetchCampaignInsights(adAccountId);

  return campaigns.map((c: any) => {
    const metrics = metricsMap.get(c.id) ?? {
      impressions: 0, clicks: 0, reach: 0, spend: 0, ctr: 0, cpc: 0, cpm: 0, conversions: 0, roas: 0,
    };
    return {
      id: c.id,
      name: c.name ?? '',
      status: c.status ?? 'UNKNOWN',
      objective: c.objective ?? '',
      dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : undefined,
      lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : undefined,
      startTime: c.start_time,
      stopTime: c.stop_time,
      metrics,
    };
  });
}

async function fetchCampaignInsights(
  adAccountId: string
): Promise<Map<string, MetaAdsCampaign['metrics']>> {
  const map = new Map<string, MetaAdsCampaign['metrics']>();

  try {
    const data = await metaFetch(
      `/${adAccountId}/insights?fields=campaign_id,impressions,clicks,reach,spend,ctr,cpc,cpm,actions&level=campaign&date_preset=last_30_days&limit=100`
    );
    const rows: any[] = data.data ?? [];

    for (const row of rows) {
      const id = row.campaign_id ?? '';
      if (!id) continue;

      const actions: any[] = row.actions ?? [];
      const conversions = actions
        .filter((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase')
        .reduce((sum: number, a: any) => sum + Number(a.value ?? 0), 0);
      const conversionValue = actions
        .filter((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase')
        .reduce((sum: number, a: any) => sum + Number(a.value ?? 0), 0);
      const spend = parseFloat(row.spend ?? '0');

      map.set(id, {
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        reach: Number(row.reach ?? 0),
        spend,
        ctr: parseFloat(row.ctr ?? '0'),
        cpc: parseFloat(row.cpc ?? '0'),
        cpm: parseFloat(row.cpm ?? '0'),
        conversions,
        roas: spend > 0 ? conversionValue / spend : 0,
      });
    }
  } catch {
    // non-fatal
  }

  return map;
}

// ─── Create Campaign ──────────────────────────────────────────────────────────

export async function createCampaign(input: CreateMetaAdsCampaignInput) {
  const adAccountId = getAdAccountId();

  const payload: Record<string, any> = {
    name: input.name,
    objective: input.objective,
    status: input.status ?? 'PAUSED',
    special_ad_categories: input.specialAdCategories ?? [],
  };

  // Budgets in Meta API are in cents
  if (input.dailyBudget !== undefined) payload.daily_budget = Math.round(input.dailyBudget * 100);
  if (input.lifetimeBudget !== undefined) payload.lifetime_budget = Math.round(input.lifetimeBudget * 100);
  if (input.startTime) payload.start_time = input.startTime;
  if (input.stopTime) payload.stop_time = input.stopTime;

  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/${adAccountId}/campaigns?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok || result.error) {
    throw new Error(result?.error?.message ?? 'Failed to create campaign');
  }

  return { success: true, campaignId: result.id ?? null };
}
