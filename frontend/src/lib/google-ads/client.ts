import { GoogleAdsApi, enums } from 'google-ads-api';
import { getStoredTokens } from './token-store';
import type { CampaignData, CreateCampaignInput } from './types';

export function getGoogleAdsApi() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!clientId || !clientSecret || !developerToken) {
    throw new Error(
      'Missing Google Ads credentials. Set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN.'
    );
  }

  return new GoogleAdsApi({ client_id: clientId, client_secret: clientSecret, developer_token: developerToken });
}

export function getCustomer() {
  const tokens = getStoredTokens();
  if (!tokens?.refresh_token || !tokens?.customer_id) {
    throw new Error('Not connected to Google Ads. Complete OAuth first.');
  }

  const api = getGoogleAdsApi();
  return api.Customer({
    customer_id: tokens.customer_id,
    refresh_token: tokens.refresh_token,
    login_customer_id: tokens.login_customer_id,
  });
}

// ─── Campaign Queries ────────────────────────────────────────────────────────

export async function listCampaigns(dateRange = 'LAST_30_DAYS'): Promise<CampaignData[]> {
  const customer = getCustomer();

  const rows = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.start_date,
      campaign.end_date,
      campaign_budget.amount_micros,
      campaign_budget.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `);

  return rows.map((row: Record<string, any>) => ({
    id: String(row.campaign?.id ?? ''),
    name: String(row.campaign?.name ?? ''),
    status: String(row.campaign?.status ?? ''),
    channelType: String(row.campaign?.advertising_channel_type ?? ''),
    startDate: row.campaign?.start_date ?? undefined,
    endDate: row.campaign?.end_date ?? undefined,
    budgetAmountMicros: Number(row.campaign_budget?.amount_micros ?? 0),
    budgetName: row.campaign_budget?.name ?? undefined,
    metrics: {
      impressions: Number(row.metrics?.impressions ?? 0),
      clicks: Number(row.metrics?.clicks ?? 0),
      costMicros: Number(row.metrics?.cost_micros ?? 0),
      conversions: Number(row.metrics?.conversions ?? 0),
      ctr: Number(row.metrics?.ctr ?? 0),
      averageCpc: Number(row.metrics?.average_cpc ?? 0),
    },
  }));
}

// ─── Campaign Creation ───────────────────────────────────────────────────────

const CHANNEL_TYPE_MAP: Record<string, number> = {
  SEARCH: enums.AdvertisingChannelType.SEARCH,
  DISPLAY: enums.AdvertisingChannelType.DISPLAY,
  SHOPPING: enums.AdvertisingChannelType.SHOPPING,
  VIDEO: enums.AdvertisingChannelType.VIDEO,
  PERFORMANCE_MAX: enums.AdvertisingChannelType.PERFORMANCE_MAX,
};

const STATUS_MAP: Record<string, number> = {
  ENABLED: enums.CampaignStatus.ENABLED,
  PAUSED: enums.CampaignStatus.PAUSED,
};

export async function createCampaign(input: CreateCampaignInput) {
  const customer = getCustomer();
  const tokens = getStoredTokens()!;

  const budgetResult = await customer.campaignBudgets.create([
    {
      name: `Budget – ${input.name} – ${Date.now()}`,
      amount_micros: input.budgetAmountMicros,
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    },
  ]);

  const budgetResourceName =
    budgetResult?.results?.[0]?.resource_name ??
    `customers/${tokens.customer_id}/campaignBudgets/${Date.now()}`;

  const biddingConfig = buildBiddingConfig(input);

  const campaignPayload: Record<string, any> = {
    name: input.name,
    advertising_channel_type: CHANNEL_TYPE_MAP[input.channelType] ?? enums.AdvertisingChannelType.SEARCH,
    status: STATUS_MAP[input.status ?? 'PAUSED'] ?? enums.CampaignStatus.PAUSED,
    campaign_budget: budgetResourceName,
    start_date: input.startDate.replace(/-/g, ''),
    ...biddingConfig,
  };

  if (input.endDate) {
    campaignPayload.end_date = input.endDate.replace(/-/g, '');
  }

  if (input.channelType === 'SEARCH') {
    campaignPayload.network_settings = {
      target_google_search: true,
      target_search_network: true,
    };
  }

  const campaignResult = await customer.campaigns.create([campaignPayload as any]);

  return {
    success: true,
    resourceName: campaignResult?.results?.[0]?.resource_name,
    budgetResourceName,
  };
}

function buildBiddingConfig(input: CreateCampaignInput): Record<string, any> {
  switch (input.biddingStrategy) {
    case 'MAXIMIZE_CONVERSIONS':
      return { maximize_conversions: { target_cpa_micros: input.targetCpaMicros ?? 0 } };
    case 'MAXIMIZE_CONVERSION_VALUE':
      return { maximize_conversion_value: { target_roas: input.targetRoas ?? 0 } };
    case 'TARGET_CPA':
      return { maximize_conversions: { target_cpa_micros: input.targetCpaMicros ?? 0 } };
    case 'TARGET_ROAS':
      return { maximize_conversion_value: { target_roas: input.targetRoas ?? 0 } };
    case 'MANUAL_CPC':
      return { manual_cpc: { enhanced_cpc_enabled: true } };
    default:
      return { maximize_conversions: {} };
  }
}
