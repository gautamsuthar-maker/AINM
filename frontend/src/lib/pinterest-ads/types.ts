export interface PinterestAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  ad_account_id: string;
  ad_account_name?: string;
  connected_at: string;
}

export type PinterestAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface PinterestAdsConnectionStatus {
  connected: boolean;
  step: PinterestAdsConnectionStep;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface PinterestAdAccount {
  id: string;
  name: string;
  currency: string;
  status: string;
  owner?: string;
}

export interface PinterestCampaign {
  id: string;
  name: string;
  status: string;
  objective_type: string;
  daily_spend_cap?: number;
  lifetime_spend_cap?: number;
  start_time?: string;
  end_time?: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    saves: number;
    ctr: number;
    cpc: number;
  };
}

export interface CreatePinterestCampaignInput {
  name: string;
  objective_type:
    | 'AWARENESS'
    | 'CONSIDERATION'
    | 'VIDEO_VIEW'
    | 'WEB_CONVERSION'
    | 'CATALOG_SALES'
    | 'WEB_SESSIONS';
  status?: 'ACTIVE' | 'PAUSED';
  daily_spend_cap?: number;
  lifetime_spend_cap?: number;
  start_time?: number;
  end_time?: number;
}
