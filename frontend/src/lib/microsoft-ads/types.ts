export interface MicrosoftAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  account_id: string;
  account_name?: string;
  customer_id?: string;
  connected_at: string;
}

export type MicrosoftAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface MicrosoftAdsConnectionStatus {
  connected: boolean;
  step: MicrosoftAdsConnectionStep;
  accountId?: string;
  accountName?: string;
  customerId?: string;
  connectedAt?: string;
  error?: string;
}

export interface MicrosoftAdsAccount {
  id: string;
  name: string;
  number: string;
  status: string;
  customer_id: string;
}

export interface MicrosoftAdsCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  daily_budget?: number;
  budget_type?: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
  };
}

export interface CreateMicrosoftAdsCampaignInput {
  name: string;
  type: 'Search' | 'Shopping' | 'DynamicSearchAds' | 'Audience';
  daily_budget: number;
  status?: 'Active' | 'Paused';
  time_zone?: string;
}
