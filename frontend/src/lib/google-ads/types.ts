export interface GoogleAdsTokens {
  access_token?: string;
  refresh_token: string;
  expiry_date?: number;
  customer_id: string;
  login_customer_id?: string;
  connected_at: string;
  account_name?: string;
}

export type ConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  channelType: string;
  startDate?: string;
  endDate?: string;
  budgetAmountMicros?: number;
  budgetName?: string;
  metrics: {
    impressions: number;
    clicks: number;
    costMicros: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
  };
}

export interface CreateCampaignInput {
  name: string;
  channelType:
    | 'SEARCH'
    | 'DISPLAY'
    | 'SHOPPING'
    | 'VIDEO'
    | 'PERFORMANCE_MAX';
  budgetAmountMicros: number;
  biddingStrategy:
    | 'MAXIMIZE_CONVERSIONS'
    | 'MAXIMIZE_CONVERSION_VALUE'
    | 'TARGET_CPA'
    | 'TARGET_ROAS'
    | 'MANUAL_CPC';
  startDate: string;
  endDate?: string;
  targetCpaMicros?: number;
  targetRoas?: number;
  status?: 'ENABLED' | 'PAUSED';
}

export interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  step: ConnectionStep;
  customerId?: string;
  accountName?: string;
  connectedAt?: string;
  error?: string;
}
