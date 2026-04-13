export interface AmazonAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  profile_id: string;
  profile_name?: string;
  country_code?: string;
  currency_code?: string;
  account_type?: string;
  connected_at: string;
}

export type AmazonAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface AmazonAdsConnectionStatus {
  connected: boolean;
  step: AmazonAdsConnectionStep;
  profileId?: string;
  profileName?: string;
  countryCode?: string;
  connectedAt?: string;
  error?: string;
}

export interface AmazonAdsProfile {
  profileId: string;
  name: string;
  countryCode: string;
  currencyCode: string;
  timezone: string;
  type: string; // 'seller' | 'vendor' | 'agency'
  marketplaceId: string;
}

export interface AmazonAdsCampaign {
  id: string;
  name: string;
  campaignType: string;
  targetingType: string;
  state: string;
  daily_budget: number;
  start_date?: string;
  end_date?: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    sales: number;
    acos: number;
    roas: number;
  };
}

export interface CreateAmazonAdsCampaignInput {
  name: string;
  campaignType: 'sponsoredProducts' | 'sponsoredBrands' | 'sponsoredDisplay';
  targetingType: 'manual' | 'auto';
  daily_budget: number;
  start_date: string;
  end_date?: string;
  state?: 'enabled' | 'paused';
}
