export interface RedditAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  ad_account_id: string;
  ad_account_name?: string;
  connected_at: string;
}

export type RedditAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface RedditAdsConnectionStatus {
  connected: boolean;
  step: RedditAdsConnectionStep;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface RedditAdAccount {
  id: string;
  name: string;
  currency: string;
  status: string;
  timezone: string;
}

export interface RedditAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget_cents?: number;
  total_budget_cents?: number;
  start_date?: string;
  end_date?: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend_cents: number;
    ctr: number;
    cpc_cents: number;
    video_completions: number;
  };
}

export interface CreateRedditAdsCampaignInput {
  name: string;
  objective:
    | 'BRAND_AWARENESS'
    | 'TRAFFIC'
    | 'CONVERSIONS'
    | 'VIDEO_VIEWS'
    | 'APP_INSTALLS'
    | 'LEAD_GENERATION';
  status?: 'ACTIVE' | 'PAUSED';
  daily_budget_cents?: number;
  total_budget_cents?: number;
  start_date?: string;
  end_date?: string;
}
