export interface TikTokTokens {
  access_token: string;
  expires_in: number;
  token_acquired_at: number;
  advertiser_id: string;
  advertiser_name?: string;
  connected_at: string;
}

export type TikTokConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface TikTokConnectionStatus {
  connected: boolean;
  step: TikTokConnectionStep;
  advertiserId?: string;
  advertiserName?: string;
  connectedAt?: string;
  error?: string;
}

export interface TikTokAdvertiser {
  advertiser_id: string;
  advertiser_name: string;
  status: string;
  currency: string;
  timezone: string;
}

export interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
  objective_type: string;
  budget: number;
  budget_mode: string;
  operation_status: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversions: number;
  };
}

export interface CreateTikTokCampaignInput {
  campaign_name: string;
  objective_type:
    | 'REACH'
    | 'TRAFFIC'
    | 'VIDEO_VIEWS'
    | 'LEAD_GENERATION'
    | 'APP_PROMOTION'
    | 'WEB_CONVERSIONS'
    | 'PRODUCT_SALES';
  budget_mode: 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_DAY' | 'BUDGET_MODE_INFINITE';
  budget?: number;
  operation_status?: 'ENABLE' | 'DISABLE';
}
