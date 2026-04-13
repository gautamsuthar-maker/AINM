export interface XAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  ad_account_id: string;
  ad_account_name?: string;
  connected_at: string;
}

export type XAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface XAdsConnectionStatus {
  connected: boolean;
  step: XAdsConnectionStep;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface XAdAccount {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  business_name?: string;
  approval_status: string;
}

export interface XAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget_amount_local_micro?: number;
  total_budget_amount_local_micro?: number;
  start_time?: string;
  end_time?: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    engagements: number;
    ctr: number;
    cpe: number;
  };
}

export interface CreateXAdsCampaignInput {
  name: string;
  objective:
    | 'AWARENESS'
    | 'TWEET_ENGAGEMENTS'
    | 'WEBSITE_CLICKS'
    | 'APP_INSTALLS'
    | 'VIDEO_VIEWS'
    | 'FOLLOWERS'
    | 'LEAD_GENERATION';
  status?: 'ACTIVE' | 'PAUSED';
  daily_budget_amount_local_micro?: number;
  total_budget_amount_local_micro?: number;
  start_time?: string;
  end_time?: string;
}
