export interface FlipkartAdsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_acquired_at: number;
  advertiser_id?: string;
  advertiser_name?: string;
  connected_at?: string;
}

export type FlipkartAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface FlipkartAdsConnectionStatus {
  connected: boolean;
  step: FlipkartAdsConnectionStep;
  advertiserId?: string;
  advertiserName?: string;
  connectedAt?: string;
  error?: string;
}

export interface FlipkartAdvertiser {
  id: string;
  name: string;
  currency: string;
  status: string;
  timezone: string;
}

export interface FlipkartAdsCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
  metrics: {
    impressions: number;
    clicks: number;
    orders: number;
    spend: number;
    ctr: number;
    cpc: number;
    roas: number;
    acos: number;
  };
}

export interface CreateFlipkartAdsCampaignInput {
  name: string;
  type: 'SPONSORED_PRODUCTS' | 'SPONSORED_BRANDS' | 'DISPLAY';
  status?: 'ACTIVE' | 'PAUSED';
  budget: number;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
}
