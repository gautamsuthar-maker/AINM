export interface LinkedInTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_acquired_at: number;
  account_id: string;
  account_name?: string;
  connected_at: string;
}

export type LinkedInConnectionStep = 'disconnected' | 'authenticated' | 'connected';

export interface LinkedInConnectionStatus {
  connected: boolean;
  step: LinkedInConnectionStep;
  accountId?: string;
  accountName?: string;
  connectedAt?: string;
  error?: string;
}

export interface LinkedInAdAccount {
  id: string;
  name: string;
  status: string;
  currency: string;
  type: string;
}

// ─── Campaign Groups ─────────────────────────────────────────────────────────

export interface LinkedInCampaignGroup {
  id: string;
  name: string;
  status: string;
  totalBudget?: { amount: string; currencyCode: string };
  runSchedule?: { start: number; end?: number };
}

export interface CreateCampaignGroupInput {
  name: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  totalBudget?: { amount: string; currencyCode: string };
  runSchedule?: { start: number; end?: number };
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  costType: string;
  objectiveType: string;
  dailyBudget?: number;
  totalBudget?: number;
  currencyCode: string;
  unitCost?: number;
  campaignGroup?: string;
  audienceExpansionEnabled?: boolean;
  runSchedule?: { start: number; end?: number };
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
  };
}

export interface TargetingCriteria {
  include: {
    and: Array<{
      or: Record<string, string[]>;
    }>;
  };
  exclude?: {
    or: Record<string, string[]>;
  };
}

export interface CreateLinkedInCampaignInput {
  name: string;
  campaignGroupId?: string;
  objectiveType:
    | 'BRAND_AWARENESS'
    | 'WEBSITE_VISITS'
    | 'ENGAGEMENT'
    | 'VIDEO_VIEWS'
    | 'LEAD_GENERATION'
    | 'WEBSITE_CONVERSIONS'
    | 'JOB_APPLICANTS';
  type: 'SPONSORED_UPDATES' | 'TEXT_AD' | 'SPONSORED_INMAILS' | 'DYNAMIC';
  costType: 'CPC' | 'CPM' | 'CPV';
  dailyBudget: number;
  totalBudget?: number;
  unitCost?: number;
  currencyCode?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  locale?: { country: string; language: string };
  targetingCriteria?: TargetingCriteria;
  audienceExpansionEnabled?: boolean;
  runSchedule?: { start: number; end?: number };
}

// ─── Creatives ───────────────────────────────────────────────────────────────

export interface LinkedInCreative {
  id: string;
  campaignId: string;
  status: string;
  type: string;
  title?: string;
  text?: string;
  clickUri?: string;
}

export interface CreateCreativeInput {
  campaignId: string;
  type: 'TEXT_AD' | 'SPONSORED_UPDATES' | 'SPONSORED_INMAILS' | 'SPONSORED_VIDEO';
  status?: 'ACTIVE' | 'PAUSED';
  clickUri: string;
  title?: string;
  text?: string;
}

// ─── Targeting ───────────────────────────────────────────────────────────────

export interface TargetingFacet {
  facetName: string;
  entityTypes: string[];
  urn: string;
}

export interface TargetingEntity {
  urn: string;
  facetUrn: string;
  name: string;
}

export interface AudienceCount {
  total: number;
  active: number;
}

// ─── Budget Pricing ──────────────────────────────────────────────────────────

export interface BudgetPricing {
  suggestedBid: { default: MoneyAmount; min: MoneyAmount; max: MoneyAmount };
  dailyBudgetLimits: { default: MoneyAmount; min: MoneyAmount; max: MoneyAmount };
  bidLimits: { min: MoneyAmount; max: MoneyAmount };
}

interface MoneyAmount {
  amount: string;
  currencyCode: string;
}
