export interface MetaAdsTokens {
  access_token: string;
  expires_in: number;
  token_acquired_at: number;
  ad_account_id?: string;
  ad_account_name?: string;
  connected_at?: string;
}

export type MetaAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface MetaAdsConnectionStatus {
  connected: boolean;
  step: MetaAdsConnectionStep;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: number; // 1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED, etc.
}

export interface MetaAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
  metrics: {
    impressions: number;
    clicks: number;
    reach: number;
    spend: number;
    ctr: number;
    cpc: number;
    cpm: number;
    conversions: number;
    roas: number;
  };
}

export interface CreateMetaAdsCampaignInput {
  name: string;
  objective:
    | 'OUTCOME_AWARENESS'
    | 'OUTCOME_ENGAGEMENT'
    | 'OUTCOME_TRAFFIC'
    | 'OUTCOME_LEADS'
    | 'OUTCOME_APP_PROMOTION'
    | 'OUTCOME_SALES';
  status?: 'ACTIVE' | 'PAUSED';
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
  specialAdCategories?: string[];
}
