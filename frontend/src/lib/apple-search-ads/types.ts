export interface AppleSearchAdsTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  token_acquired_at: number;
  org_id?: string;
  org_name?: string;
  connected_at?: string;
}

export type AppleSearchAdsConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface AppleSearchAdsConnectionStatus {
  connected: boolean;
  step: AppleSearchAdsConnectionStep;
  orgId?: string;
  orgName?: string;
  connectedAt?: string;
  error?: string;
}

export interface AppleSearchAdsOrg {
  orgId: number;
  orgName: string;
  currency: string;
  timeZone: string;
  paymentModel: string;
  roleNames: string[];
}

export interface AppleSearchAdsCampaign {
  id: string;
  name: string;
  status: string;
  servingStatus: string;
  budgetAmount: { amount: string; currency: string };
  dailyBudgetAmount?: { amount: string; currency: string };
  countriesOrRegions: string[];
  adamId: number;
  startTime: string;
  endTime?: string;
  metrics: {
    impressions: number;
    taps: number;
    conversions: number;
    spend: number;
    ttr: number;
    cpt: number;
    cpa: number;
  };
}

export interface CreateAppleSearchAdsCampaignInput {
  name: string;
  adamId: number;
  budgetAmount: string;
  currency?: string;
  dailyBudgetAmount?: string;
  countriesOrRegions?: string[];
  status?: 'ENABLED' | 'PAUSED';
}
