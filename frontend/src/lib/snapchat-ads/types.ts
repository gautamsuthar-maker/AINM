export interface SnapchatTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  ad_account_id: string;
  ad_account_name?: string;
  organization_id?: string;
  connected_at: string;
}

export type SnapchatConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface SnapchatConnectionStatus {
  connected: boolean;
  step: SnapchatConnectionStep;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface SnapchatAdAccount {
  id: string;
  name: string;
  status: string;
  currency: string;
  organization_id: string;
  timezone: string;
}

export interface SnapchatCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget_micro?: number;
  lifetime_spend_cap_micro?: number;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
  metrics: {
    impressions: number;
    swipes: number;
    spend: number;
    conversions: number;
    swipe_up_rate: number;
  };
}

export interface CreateSnapchatCampaignInput {
  name: string;
  objective:
    | 'BRAND_AWARENESS'
    | 'APP_INSTALL'
    | 'DRIVE_WEBSITE_TRAFFIC'
    | 'ENGAGE_CONSUMER'
    | 'APP_ENGAGEMENT'
    | 'LEAD_GENERATION'
    | 'CATALOG_SALES';
  status?: 'ACTIVE' | 'PAUSED';
  daily_budget_micro?: number;
  lifetime_spend_cap_micro?: number;
  start_time?: string;
  end_time?: string;
}
