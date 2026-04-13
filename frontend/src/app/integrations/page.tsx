'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Zap,
  BarChart2,
  Target,
  Users,
  RefreshCw,
  DollarSign,
  Megaphone,
  FileSearch,
  ShoppingCart,
  BrainCircuit,
  Lock,
  ExternalLink,
  Info,
  Plus,
  Plug,
  Loader2,
  Unplug,
  TrendingUp,
  MousePointerClick,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import type { CampaignData, ConnectionStatus as GadsStatus, CreateCampaignInput, GoogleAdsAccount } from '@/lib/google-ads/types';
import type { LinkedInCampaign, LinkedInCampaignGroup, LinkedInCreative, LinkedInConnectionStatus as LiStatus, LinkedInAdAccount, CreateLinkedInCampaignInput, CreateCampaignGroupInput, CreateCreativeInput, TargetingCriteria } from '@/lib/linkedin-ads/types';
import type { SnapchatConnectionStatus as SnapStatus, SnapchatAdAccount as SnapAdAccount, SnapchatCampaign, CreateSnapchatCampaignInput } from '@/lib/snapchat-ads/types';
import type { MicrosoftAdsConnectionStatus as MsStatus, MicrosoftAdsAccount as MsAdAccount, MicrosoftAdsCampaign as MsCampaign, CreateMicrosoftAdsCampaignInput } from '@/lib/microsoft-ads/types';
import type { AmazonAdsConnectionStatus as AmzStatus, AmazonAdsProfile as AmzProfile, AmazonAdsCampaign as AmzCampaign, CreateAmazonAdsCampaignInput } from '@/lib/amazon-ads/types';
import type { PinterestAdsConnectionStatus as PinStatus, PinterestAdAccount as PinAdAccount, PinterestCampaign as PinCampaign, CreatePinterestCampaignInput } from '@/lib/pinterest-ads/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlatformConnectionStatus = 'connected' | 'partial' | 'disconnected';
type CapabilityStatus = 'available' | 'beta' | 'planned' | 'unavailable';

interface Capability {
  name: string;
  description: string;
  status: CapabilityStatus;
  endpoints?: string[];
}

interface CapabilityGroup {
  group: string;
  icon: React.ElementType;
  capabilities: Capability[];
}

interface Platform {
  id: string;
  name: string;
  logo: string;
  status: PlatformConnectionStatus;
  lastSync?: string;
  accountId?: string;
  capabilityGroups: CapabilityGroup[];
  docsUrl: string;
  authType: string;
}

// ─── Platform Data ────────────────────────────────────────────────────────────

const basePlatforms: Platform[] = [
  {
    id: 'google-ads',
    name: 'Google Ads',
    logo: 'G',
    status: 'disconnected',
    docsUrl: 'https://developers.google.com/google-ads/api',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Create & manage campaigns', description: 'Full CRUD on Search, Display, Shopping, Video, App, Demand Gen, and Performance Max campaigns.', status: 'available', endpoints: ['CampaignService.MutateCampaigns', 'CampaignService.GetCampaign'] },
          { name: 'Ad group management', description: 'Create, pause, or remove ad groups within campaigns.', status: 'available', endpoints: ['AdGroupService.MutateAdGroups'] },
          { name: 'Ad creation & variants', description: 'Responsive search ads, display ads, shopping ads, video ads, and dynamic search ads.', status: 'available', endpoints: ['AdGroupAdService.MutateAdGroupAds'] },
          { name: 'Performance Max campaigns', description: 'Cross-channel campaigns across Search, Display, YouTube, Gmail, Maps.', status: 'available', endpoints: ['CampaignService', 'AssetGroupService', 'AssetGroupAssetService'] },
          { name: 'Campaign Drafts & Experiments', description: 'A/B test campaign settings or targeting with experiment arms.', status: 'available', endpoints: ['ExperimentService', 'ExperimentArmService'] },
        ],
      },
      {
        group: 'Bidding & Budget',
        icon: DollarSign,
        capabilities: [
          { name: 'Smart Bidding strategies', description: 'Maximize Conversions, Target CPA, Target ROAS, Enhanced CPC, Maximize Conversion Value.', status: 'available', endpoints: ['BiddingStrategyService.MutateBiddingStrategies'] },
          { name: 'Portfolio bidding', description: 'Cross-campaign shared bidding strategies.', status: 'available', endpoints: ['BiddingStrategyService'] },
          { name: 'Manual bid management', description: 'Keyword-level, ad group-level, and placement-level bid adjustments.', status: 'available', endpoints: ['AdGroupCriterionService', 'CampaignBidModifierService'] },
          { name: 'Budget creation & sharing', description: 'Create, assign, share budgets across campaigns.', status: 'available', endpoints: ['CampaignBudgetService.MutateCampaignBudgets'] },
          { name: 'Seasonality adjustments', description: 'Temporary conversion rate adjustments for known high/low traffic events.', status: 'available', endpoints: ['BiddingSeasonalityAdjustmentService'] },
          { name: 'Bid simulations', description: 'Forecast performance impact of different bid values.', status: 'available', endpoints: ['AdGroupBidSimulationService', 'KeywordPlanService'] },
        ],
      },
      {
        group: 'Reporting & Analytics',
        icon: BarChart2,
        capabilities: [
          { name: 'GAQL custom reporting', description: 'SQL-like query language to fetch any metric/dimension combination across all resources.', status: 'available', endpoints: ['GoogleAdsService.Search', 'GoogleAdsService.SearchStream'] },
          { name: 'Performance metrics', description: 'Impressions, clicks, CTR, CPC, conversions, ROAS, quality score, view-through conversions.', status: 'available', endpoints: ['GoogleAdsService.Search'] },
          { name: 'Segmented reporting', description: 'Segment by device, network, date, ad schedule, click type, conversion action, and more.', status: 'available', endpoints: ['GoogleAdsService.Search'] },
          { name: 'Reach forecasting', description: 'Forecast impressions, views, CPM for video/display campaigns.', status: 'available', endpoints: ['ReachPlanService.GenerateReachForecast'] },
          { name: 'Keyword forecast metrics', description: 'Historical and forecast performance data for keyword planning.', status: 'available', endpoints: ['KeywordPlanService.GenerateForecastMetrics'] },
        ],
      },
      {
        group: 'Audience Management',
        icon: Users,
        capabilities: [
          { name: 'Customer Match', description: 'Upload hashed email/phone lists to target existing customers.', status: 'available', endpoints: ['UserListService.MutateUserLists', 'OfflineUserDataJobService'] },
          { name: 'Remarketing lists (RLSA)', description: 'Create and manage website visitor remarketing audiences.', status: 'available', endpoints: ['UserListService'] },
          { name: 'Lookalike segments', description: 'Automatically generated audiences similar to your customer lists.', status: 'available', endpoints: ['UserListService'] },
          { name: 'Custom audiences', description: 'Audiences based on interests, search behavior, app usage.', status: 'available', endpoints: ['CustomAudienceService'] },
          { name: 'Audience insights', description: 'Demographic and interest breakdown of your audiences.', status: 'available', endpoints: ['AudienceInsightsService'] },
        ],
      },
      {
        group: 'Conversion Tracking',
        icon: Target,
        capabilities: [
          { name: 'Conversion action management', description: 'Create and configure online conversion actions (web, app, calls).', status: 'available', endpoints: ['ConversionActionService.MutateConversionActions'] },
          { name: 'Offline conversion import', description: 'Upload CRM-matched conversions with click IDs (GCLID).', status: 'available', endpoints: ['OfflineUserDataJobService', 'ConversionUploadService'] },
          { name: 'Enhanced conversions (web)', description: 'Improve conversion measurement by sending hashed first-party customer data.', status: 'available', endpoints: ['ConversionUploadService.UploadClickConversions'] },
          { name: 'Enhanced conversions (leads)', description: 'Match form leads to conversions using email/phone hashes.', status: 'available', endpoints: ['ConversionUploadService'] },
          { name: 'Store sales conversions', description: 'Measure in-store purchases driven by ads.', status: 'available', endpoints: ['OfflineUserDataJobService'] },
          { name: 'Conversion value rules', description: 'Adjust conversion values based on audience, location, or device.', status: 'available', endpoints: ['ConversionValueRuleService', 'ConversionValueRuleSetService'] },
        ],
      },
      {
        group: 'Assets & Creative',
        icon: FileSearch,
        capabilities: [
          { name: 'Asset library management', description: 'Upload, link, and manage image, text, video, call, and location assets.', status: 'available', endpoints: ['AssetService.MutateAssets'] },
          { name: 'Video upload', description: 'Upload video assets directly via the API.', status: 'available', endpoints: ['AssetService'] },
          { name: 'Asset group setup (PMax)', description: 'Manage asset groups and listing groups for Performance Max.', status: 'available', endpoints: ['AssetGroupService', 'AssetGroupAssetService', 'AssetGroupListingGroupFilterService'] },
          { name: 'Asset performance reporting', description: 'Performance metrics per asset across all campaigns.', status: 'available', endpoints: ['GoogleAdsService.Search (asset_field_type_view)'] },
          { name: 'AI asset generation', description: 'Generate ad creatives using Google AI (closed beta).', status: 'beta', endpoints: ['AssetGenerationService'] },
        ],
      },
      {
        group: 'Keyword & SEO',
        icon: BrainCircuit,
        capabilities: [
          { name: 'Keyword planning', description: 'Generate keyword ideas from seed keywords or URLs.', status: 'available', endpoints: ['KeywordPlanIdeaService.GenerateKeywordIdeas'] },
          { name: 'Ad group theme generation', description: 'AI-suggested ad group themes from a set of seed keywords.', status: 'available', endpoints: ['KeywordPlanIdeaService.GenerateAdGroupThemes'] },
          { name: 'Keyword criteria management', description: 'Add, pause, remove keywords; set match types and bids.', status: 'available', endpoints: ['AdGroupCriterionService.MutateAdGroupCriteria'] },
          { name: 'Search term reports', description: 'Actual search queries that triggered your ads.', status: 'available', endpoints: ['GoogleAdsService.Search (search_term_view)'] },
        ],
      },
      {
        group: 'Account & Access',
        icon: Lock,
        capabilities: [
          { name: 'Multi-account (MCC) management', description: 'Manage hundreds of accounts from a single manager account.', status: 'available', endpoints: ['CustomerService.ListAccessibleCustomers', 'GoogleAdsService'] },
          { name: 'Account creation', description: 'Programmatically create new sub-accounts under a manager.', status: 'available', endpoints: ['CustomerService.CreateCustomerClient'] },
          { name: 'User access management', description: 'Invite users and manage access levels per account.', status: 'available', endpoints: ['CustomerUserAccessService', 'CustomerUserAccessInvitationService'] },
          { name: 'Change history', description: 'Full audit log of all changes made to campaigns, ads, bids.', status: 'available', endpoints: ['ChangeStatusService', 'ChangeEventService'] },
          { name: 'Billing & invoices', description: 'Manage billing setups, account budgets, and retrieve invoices.', status: 'available', endpoints: ['BillingSetupService', 'AccountBudgetService', 'InvoiceService'] },
        ],
      },
      {
        group: 'Shopping & Retail',
        icon: ShoppingCart,
        capabilities: [
          { name: 'Shopping campaigns', description: 'Create and manage Shopping campaigns linked to Merchant Center.', status: 'available', endpoints: ['CampaignService', 'ProductGroupViewService'] },
          { name: 'Listing group filters', description: 'Segment product inventory for bid control within Shopping/PMax.', status: 'available', endpoints: ['AssetGroupListingGroupFilterService'] },
          { name: 'Merchant Center link', description: 'Link Merchant Center accounts for product feed access.', status: 'available', endpoints: ['MerchantCenterLinkService'] },
          { name: 'Retail Performance Max', description: 'Shopping-feed-driven Performance Max campaigns.', status: 'available', endpoints: ['CampaignService', 'ShoppingProductService'] },
        ],
      },
    ],
  },
  {
    id: 'linkedin-ads',
    name: 'LinkedIn Ads',
    logo: 'Li',
    status: 'disconnected',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Campaign group & campaign', description: 'Sponsored Content, Message Ads, Dynamic Ads, Text Ads.', status: 'available', endpoints: ['POST /adCampaignGroups', 'POST /adCampaigns'] },
          { name: 'Ad creative', description: 'Single image, carousel, video, conversation ads.', status: 'available', endpoints: ['POST /adCreatives'] },
        ],
      },
      {
        group: 'Audience & Targeting',
        icon: Users,
        capabilities: [
          { name: 'Matched audiences', description: 'Contact list upload, website retargeting, Lookalike.', status: 'available', endpoints: ['POST /dmpSegments'] },
          { name: 'B2B targeting', description: 'Company size, job function, seniority, industry, skills.', status: 'available', endpoints: ['GET /adTargetingFacets'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Analytics API', description: 'Impressions, clicks, leads, video views, engagement.', status: 'available', endpoints: ['GET /adAnalytics'] },
        ],
      },
    ],
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    logo: 'M',
    status: 'disconnected',
    docsUrl: 'https://developers.facebook.com/docs/marketing-api',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Create campaigns', description: 'Facebook, Instagram, Audience Network, Messenger campaigns.', status: 'available', endpoints: ['POST /act_{id}/campaigns'] },
          { name: 'Ad set & placement management', description: 'Targeting, placements, scheduling, budget at ad set level.', status: 'available', endpoints: ['POST /act_{id}/adsets'] },
          { name: 'Ad creative management', description: 'Images, videos, carousels, stories, reels creatives.', status: 'available', endpoints: ['POST /act_{id}/adcreatives'] },
          { name: 'Advantage+ campaigns', description: 'AI-automated campaigns for catalog sales and app installs.', status: 'available', endpoints: ['POST /act_{id}/campaigns (OUTCOME_SALES)'] },
        ],
      },
      {
        group: 'Audience & Targeting',
        icon: Users,
        capabilities: [
          { name: 'Custom audiences', description: 'Upload customer lists, website visitors, app events.', status: 'available', endpoints: ['POST /act_{id}/customaudiences'] },
          { name: 'Lookalike audiences', description: 'Generate audiences similar to your best customers.', status: 'available', endpoints: ['POST /act_{id}/customaudiences (LOOKALIKE)'] },
          { name: 'Detailed targeting', description: 'Demographics, interests, behaviors from Meta graph.', status: 'available', endpoints: ['GET /targetingSearch'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Insights API', description: 'Impressions, reach, spend, conversions, ROAS, frequency.', status: 'available', endpoints: ['GET /{id}/insights'] },
          { name: 'Breakdown reporting', description: 'Segment by age, gender, placement, device, region.', status: 'available', endpoints: ['GET /{id}/insights?breakdowns='] },
          { name: 'Async report jobs', description: 'Queue large reports and fetch when complete.', status: 'available', endpoints: ['POST /act_{id}/async_requests'] },
        ],
      },
      {
        group: 'Conversions',
        icon: Target,
        capabilities: [
          { name: 'Conversions API (CAPI)', description: 'Server-side event tracking bypassing browser limitations.', status: 'available', endpoints: ['POST /{pixel_id}/events'] },
          { name: 'Offline conversions', description: 'Upload offline events matched to Meta ad clicks.', status: 'available', endpoints: ['POST /act_{id}/offlineconversiondatasets'] },
        ],
      },
    ],
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    logo: 'T',
    status: 'disconnected',
    docsUrl: 'https://ads.tiktok.com/marketing_api/docs',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Campaign creation', description: 'In-Feed, TopView, Brand Takeover, Spark Ads.', status: 'available', endpoints: ['POST /v1.3/campaign/create/'] },
          { name: 'Ad group targeting', description: 'Demographics, interests, device, behavior targeting.', status: 'available', endpoints: ['POST /v1.3/adgroup/create/'] },
          { name: 'Creative management', description: 'Video, image, carousel ad creatives.', status: 'available', endpoints: ['POST /v1.3/ad/create/'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Integrated reporting', description: 'Impressions, clicks, video views, conversions.', status: 'available', endpoints: ['GET /v1.3/report/integrated/get/'] },
          { name: 'Audience insights', description: 'Audience breakdown by demographics and interests.', status: 'available', endpoints: ['GET /v1.3/audience/evaluate/'] },
        ],
      },
      {
        group: 'Pixel & Events',
        icon: Target,
        capabilities: [
          { name: 'Events API', description: 'Server-side pixel events for conversion tracking.', status: 'available', endpoints: ['POST /v1.3/pixel/batch/'] },
        ],
      },
    ],
  },
  
  {
    id: 'microsoft-ads',
    name: 'Microsoft Ads',
    logo: 'Ms',
    status: 'disconnected',
    docsUrl: 'https://learn.microsoft.com/en-us/advertising/guides/',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Search & shopping campaigns', description: 'Bing, Yahoo, DuckDuckGo network campaigns.', status: 'available', endpoints: ['CampaignManagementService.AddCampaigns'] },
          { name: 'Audience & native ads', description: 'MSN, Outlook, Edge native placements.', status: 'available', endpoints: ['CampaignManagementService'] },
          { name: 'Import from Google Ads', description: 'Sync Google Ads campaigns directly into Microsoft Ads.', status: 'available', endpoints: ['BulkService + ImportService'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Reporting service', description: 'Full performance reports with custom date ranges.', status: 'available', endpoints: ['ReportingService.SubmitGenerateReport'] },
        ],
      },
    ],
  },
  {
    id: 'amazon-ads',
    name: 'Amazon Ads',
    logo: 'A',
    status: 'disconnected',
    docsUrl: 'https://advertising.amazon.com/API/docs/',
    authType: 'OAuth 2.0 (LWA)',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Sponsored Products', description: 'Keyword and product targeting within Amazon search results.', status: 'available', endpoints: ['POST /v2/sp/campaigns'] },
          { name: 'Sponsored Brands', description: 'Banner ads with logo, headline, and product carousel.', status: 'available', endpoints: ['POST /v4/campaigns (SB)'] },
          { name: 'Sponsored Display', description: 'Display ads on and off Amazon.', status: 'available', endpoints: ['POST /v3/campaigns (SD)'] },
          { name: 'DSP (Demand Side Platform)', description: 'Programmatic display and video via Amazon DSP.', status: 'planned', endpoints: ['POST /dsp/campaigns'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Reporting API v3', description: 'Impressions, clicks, spend, sales, ACOS, ROAS.', status: 'available', endpoints: ['POST /reporting/reports'] },
        ],
      },
    ],
  },
  {
    id: 'snapchat-ads',
    name: 'Snapchat Ads',
    logo: 'Sn',
    status: 'disconnected',
    docsUrl: 'https://marketingapi.snapchat.com/docs/',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Campaign & ad squad', description: 'Snap Ads, Collection Ads, Story Ads, AR Lens Ads.', status: 'available', endpoints: ['POST /v1/campaigns', 'POST /v1/adsquads'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Stats API', description: 'Swipe-ups, impressions, video views, conversions.', status: 'available', endpoints: ['GET /v1/campaigns/{id}/stats'] },
        ],
      },
    ],
  },
  {
    id: 'pinterest-ads',
    name: 'Pinterest Ads',
    logo: 'P',
    status: 'disconnected',
    docsUrl: 'https://developers.pinterest.com/docs/api/v5/',
    authType: 'OAuth 2.0',
    capabilityGroups: [
      {
        group: 'Campaign Management',
        icon: Megaphone,
        capabilities: [
          { name: 'Campaign & ad group', description: 'Standard, Shopping, Video, Carousel, Collections pins.', status: 'available', endpoints: ['POST /v5/campaigns', 'POST /v5/ad_groups'] },
        ],
      },
      {
        group: 'Reporting',
        icon: BarChart2,
        capabilities: [
          { name: 'Analytics API', description: 'Impressions, saves, clicks, Pin-clicks, video views.', status: 'available', endpoints: ['GET /v5/ad_accounts/{id}/campaigns/analytics'] },
        ],
      },
    ],
  },
];

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function microsToDollars(micros: number) {
  return (micros / 1_000_000).toFixed(2);
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPercent(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function formatStatus(s: string) {
  const map: Record<string, string> = {
    '2': 'Enabled',
    '3': 'Paused',
    '4': 'Removed',
    ENABLED: 'Enabled',
    PAUSED: 'Paused',
    REMOVED: 'Removed',
  };
  return map[s] ?? s;
}

function formatChannelType(s: string) {
  const map: Record<string, string> = {
    '2': 'Search',
    '3': 'Display',
    '4': 'Shopping',
    '6': 'Video',
    '8': 'App',
    '9': 'Smart',
    '10': 'Hotel',
    '11': 'Discovery',
    '12': 'Local Services',
    '13': 'Performance Max',
    SEARCH: 'Search',
    DISPLAY: 'Display',
    SHOPPING: 'Shopping',
    VIDEO: 'Video',
    PERFORMANCE_MAX: 'PMax',
  };
  return map[s] ?? s;
}

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<PlatformConnectionStatus, { label: string; badgeVariant: 'ok' | 'warn' | 'danger' | 'default'; dot: string }> = {
  connected: { label: 'Connected', badgeVariant: 'ok', dot: 'bg-brand-success' },
  partial: { label: 'Partial', badgeVariant: 'warn', dot: 'bg-brand-warning' },
  disconnected: { label: 'Not Connected', badgeVariant: 'danger', dot: 'bg-brand-danger' },
};

const capabilityStatusConfig: Record<CapabilityStatus, { label: string; color: string }> = {
  available: { label: 'Available', color: 'text-brand-success' },
  beta: { label: 'Beta', color: 'text-brand-warning' },
  planned: { label: 'Planned', color: 'text-brand-text-muted' },
  unavailable: { label: 'N/A', color: 'text-brand-danger' },
};

const capabilityStatusIcon: Record<CapabilityStatus, React.ElementType> = {
  available: CheckCircle2,
  beta: AlertCircle,
  planned: Circle,
  unavailable: Circle,
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function PlatformLogo({ platform }: { platform: Platform }) {
  const bgMap: Record<string, string> = {
    'google-ads': 'bg-blue-600',
    'meta-ads': 'bg-indigo-600',
    'tiktok-ads': 'bg-zinc-900 border border-white/20',
    'linkedin-ads': 'bg-blue-700',
    'microsoft-ads': 'bg-sky-600',
    'amazon-ads': 'bg-orange-600',
    'snapchat-ads': 'bg-yellow-400',
    'pinterest-ads': 'bg-red-600',
  };
  return (
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white ${bgMap[platform.id] ?? 'bg-brand-card'} shrink-0`}>
      {platform.logo}
    </div>
  );
}

function CapabilityRow({ cap }: { cap: Capability }) {
  const [open, setOpen] = useState(false);
  const Icon = capabilityStatusIcon[cap.status];
  const cfg = capabilityStatusConfig[cap.status];
  return (
    <div className="rounded-lg border border-brand-border bg-brand-bg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-sidebar-hover transition-colors"
      >
        <Icon size={15} className={cfg.color} strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <span className="text-[13px] text-brand-text font-medium">{cap.name}</span>
        </div>
        <span className={`text-[11px] font-medium ${cfg.color} mr-2`}>{cfg.label}</span>
        {cap.endpoints && cap.endpoints.length > 0 && (
          open ? <ChevronDown size={14} className="text-brand-text-muted shrink-0" /> : <ChevronRight size={14} className="text-brand-text-muted shrink-0" />
        )}
      </button>
      {open && cap.endpoints && (
        <div className="px-4 pb-4 pt-1 border-t border-brand-border">
          <p className="text-[12px] text-brand-text-muted mb-3">{cap.description}</p>
          <div className="flex flex-wrap gap-2">
            {cap.endpoints.map(ep => (
              <code key={ep} className="text-[11px] bg-brand-card border border-brand-border rounded px-2 py-1 text-blue-400 font-mono">
                {ep}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CapabilityGroupSection({ group }: { group: CapabilityGroup }) {
  const [open, setOpen] = useState(true);
  const Icon = group.icon;
  const availableCount = group.capabilities.filter(c => c.status === 'available').length;
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 py-2 text-left group"
      >
        <Icon size={14} className="text-brand-text-muted" />
        <span className="text-[12px] font-semibold uppercase tracking-wider text-brand-text-muted flex-1">{group.group}</span>
        <span className="text-[11px] text-brand-text-dim mr-2">{availableCount}/{group.capabilities.length}</span>
        {open ? <ChevronDown size={13} className="text-brand-text-dim" /> : <ChevronRight size={13} className="text-brand-text-dim" />}
      </button>
      {open && (
        <div className="flex flex-col gap-2 mt-1 mb-4">
          {group.capabilities.map(cap => <CapabilityRow key={cap.name} cap={cap} />)}
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform, isActive, onClick }: { platform: Platform; isActive: boolean; onClick: () => void }) {
  const sc = statusConfig[platform.status];
  const totalCaps = platform.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
  const availableCaps = platform.capabilityGroups.reduce((a, g) => a + g.capabilities.filter(c => c.status === 'available').length, 0);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
        isActive ? 'border-blue-500/60 bg-blue-500/5' : 'border-brand-border bg-brand-card hover:border-brand-border-hover hover:bg-brand-sidebar-hover'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <PlatformLogo platform={platform} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-white truncate">{platform.name}</div>
          <div className="text-[11px] text-brand-text-muted">{platform.authType}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={sc.badgeVariant}>{sc.label}</Badge>
        <span className="text-[11px] text-brand-text-dim">{availableCaps}/{totalCaps} endpoints</span>
      </div>
    </button>
  );
}

// ─── Campaign List Component ──────────────────────────────────────────────────

function CampaignTable({ campaigns, loading }: { campaigns: CampaignData[]; loading: boolean }) {
  const [sortField, setSortField] = useState<'name' | 'impressions' | 'clicks' | 'cost' | 'conversions'>('impressions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...campaigns].sort((a, b) => {
    let av: number | string, bv: number | string;
    switch (sortField) {
      case 'name': av = a.name; bv = b.name; break;
      case 'impressions': av = a.metrics.impressions; bv = b.metrics.impressions; break;
      case 'clicks': av = a.metrics.clicks; bv = b.metrics.clicks; break;
      case 'cost': av = a.metrics.costMicros; bv = b.metrics.costMicros; break;
      case 'conversions': av = a.metrics.conversions; bv = b.metrics.conversions; break;
      default: av = 0; bv = 0;
    }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-blue-400" />
        <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from Google Ads...</span>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
        <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
        <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected account.</p>
      </div>
    );
  }

  const SortHeader = ({ field, children }: { field: typeof sortField; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-brand-text transition-colors">
      {children}
      <ArrowUpDown size={11} className={sortField === field ? 'text-blue-400' : 'opacity-30'} />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
            <th className="pb-3 pr-4 font-medium"><SortHeader field="name">Campaign</SortHeader></th>
            <th className="pb-3 px-3 font-medium">Status</th>
            <th className="pb-3 px-3 font-medium">Type</th>
            <th className="pb-3 px-3 font-medium text-right"><SortHeader field="impressions">Impressions</SortHeader></th>
            <th className="pb-3 px-3 font-medium text-right"><SortHeader field="clicks">Clicks</SortHeader></th>
            <th className="pb-3 px-3 font-medium text-right">CTR</th>
            <th className="pb-3 px-3 font-medium text-right"><SortHeader field="cost">Spend</SortHeader></th>
            <th className="pb-3 px-3 font-medium text-right"><SortHeader field="conversions">Conv.</SortHeader></th>
            <th className="pb-3 pl-3 font-medium text-right">Budget/day</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => {
            const statusColor = formatStatus(c.status) === 'Enabled' ? 'text-emerald-400' : formatStatus(c.status) === 'Paused' ? 'text-amber-400' : 'text-brand-text-dim';
            return (
              <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="text-[13px] font-medium text-white max-w-[260px] truncate">{c.name}</div>
                  <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[12px] font-medium ${statusColor}`}>{formatStatus(c.status)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] text-brand-text-muted">{formatChannelType(c.channelType)}</span>
                </td>
                <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.impressions)}</td>
                <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.clicks)}</td>
                <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">{formatPercent(c.metrics.ctr)}</td>
                <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${microsToDollars(c.metrics.costMicros)}</td>
                <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{c.metrics.conversions.toFixed(1)}</td>
                <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                  {c.budgetAmountMicros ? `$${microsToDollars(c.budgetAmountMicros)}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Create Campaign Form ─────────────────────────────────────────────────────

function CreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateCampaignInput>({
    name: '',
    channelType: 'SEARCH',
    budgetAmountMicros: 10_000_000,
    biddingStrategy: 'MAXIMIZE_CONVERSIONS',
    startDate: new Date().toISOString().split('T')[0],
    status: 'PAUSED',
  });

  function updateField<K extends keyof CreateCampaignInput>(key: K, value: CreateCampaignInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/integrations/google-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setSuccess(true);
      setForm(prev => ({ ...prev, name: '' }));
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-brand-border px-4 py-3 text-[13px] text-brand-text-muted hover:border-blue-500/40 hover:text-blue-400 transition-colors w-full"
      >
        <Plus size={16} /> Create a new campaign via API
      </button>
    );
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-blue-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Create Campaign</h3>
        <button onClick={() => setOpen(false)} className="text-[12px] text-brand-text-muted hover:text-white transition-colors">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Spring Sale – Search" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>

        <div>
          <label className={labelClass}>Channel Type</label>
          <select className={inputClass} value={form.channelType} onChange={e => updateField('channelType', e.target.value as any)}>
            <option value="SEARCH">Search</option>
            <option value="DISPLAY">Display</option>
            <option value="SHOPPING">Shopping</option>
            <option value="VIDEO">Video</option>
            <option value="PERFORMANCE_MAX">Performance Max</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Bidding Strategy</label>
          <select className={inputClass} value={form.biddingStrategy} onChange={e => updateField('biddingStrategy', e.target.value as any)}>
            <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
            <option value="MAXIMIZE_CONVERSION_VALUE">Maximize Conv. Value</option>
            <option value="TARGET_CPA">Target CPA</option>
            <option value="TARGET_ROAS">Target ROAS</option>
            <option value="MANUAL_CPC">Manual CPC</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Daily Budget (USD)</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            step="0.01"
            value={form.budgetAmountMicros / 1_000_000}
            onChange={e => updateField('budgetAmountMicros', Math.round(parseFloat(e.target.value || '0') * 1_000_000))}
          />
        </div>

        <div>
          <label className={labelClass}>Initial Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateField('status', e.target.value as any)}>
            <option value="PAUSED">Paused (recommended)</option>
            <option value="ENABLED">Enabled</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Start Date</label>
          <input className={inputClass} type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} required />
        </div>

        <div>
          <label className={labelClass}>End Date (optional)</label>
          <input className={inputClass} type="date" value={form.endDate || ''} onChange={e => updateField('endDate', e.target.value || undefined)} />
        </div>

        {form.biddingStrategy === 'TARGET_CPA' && (
          <div>
            <label className={labelClass}>Target CPA (USD)</label>
            <input className={inputClass} type="number" min="0.01" step="0.01" value={(form.targetCpaMicros || 0) / 1_000_000} onChange={e => updateField('targetCpaMicros', Math.round(parseFloat(e.target.value || '0') * 1_000_000))} />
          </div>
        )}

        {form.biddingStrategy === 'TARGET_ROAS' && (
          <div>
            <label className={labelClass}>Target ROAS</label>
            <input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 4.0" value={form.targetRoas || ''} onChange={e => updateField('targetRoas', parseFloat(e.target.value || '0'))} />
          </div>
        )}

        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'platform' | 'google-ads' | 'linkedin-ads' | 'snapchat-ads' | 'microsoft-ads' | 'amazon-ads' | 'pinterest-ads';

function IntegrationsContent() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>('overview');
  const [activePlatformId, setActivePlatformId] = useState<string>('google-ads');

  // Google Ads live state
  const [gadsStatus, setGadsStatus] = useState<GadsStatus>({ connected: false, step: 'disconnected' });
  const [gadsLoading, setGadsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  // Account selection
  const [accessibleAccounts, setAccessibleAccounts] = useState<GoogleAdsAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectingAccount, setSelectingAccount] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch('/api/integrations/google-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      setAccessibleAccounts(data.accounts ?? []);
    } catch {
      setAccessibleAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/google-ads/status');
      const data: GadsStatus = await res.json();
      setGadsStatus(data);
      if (data.step === 'connected') fetchCampaigns();
      if (data.step === 'authenticated') fetchAccounts();
    } catch {
      setGadsStatus({ connected: false, step: 'disconnected' });
    } finally {
      setGadsLoading(false);
    }
  }, [fetchAccounts]);

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/google-ads/campaigns');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch {
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'select_account') {
      setTab('google-ads');
      checkConnection();
    }
    const connected = searchParams.get('connected');
    if (connected === 'google-ads') {
      setTab('google-ads');
      checkConnection();
    }
    const error = searchParams.get('error');
    if (error) {
      console.error('OAuth error:', error);
    }
  }, [searchParams, checkConnection]);

  async function handleGoogleConnect() {
    setConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/google-ads/auth');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setConnectingOAuth(false);
    }
  }

  async function handleSelectAccount(account: GoogleAdsAccount) {
    setSelectingAccount(account.customerId);
    try {
      const res = await fetch('/api/integrations/google-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: account.customerId, accountName: account.descriptiveName }),
      });
      if (!res.ok) throw new Error('Failed to select account');
      await checkConnection();
    } catch (err) {
      console.error('Account selection error:', err);
    } finally {
      setSelectingAccount(null);
    }
  }

  async function handleGoogleDisconnect() {
    await fetch('/api/integrations/google-ads/disconnect', { method: 'POST' });
    setGadsStatus({ connected: false, step: 'disconnected' });
    setCampaigns([]);
    setAccessibleAccounts([]);
  }

  // ── LinkedIn Ads state ───────────────────────────────────────────────────
  const [liStatus, setLiStatus] = useState<LiStatus>({ connected: false, step: 'disconnected' });
  const [liLoading, setLiLoading] = useState(true);
  const [liCampaigns, setLiCampaigns] = useState<LinkedInCampaign[]>([]);
  const [liCampaignsLoading, setLiCampaignsLoading] = useState(false);
  const [liConnectingOAuth, setLiConnectingOAuth] = useState(false);
  const [liAccounts, setLiAccounts] = useState<LinkedInAdAccount[]>([]);
  const [liAccountsLoading, setLiAccountsLoading] = useState(false);
  const [liSelectingAccount, setLiSelectingAccount] = useState<string | null>(null);

  const fetchLiAccounts = useCallback(async () => {
    setLiAccountsLoading(true);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLiAccounts(data.accounts ?? []);
    } catch { setLiAccounts([]); }
    finally { setLiAccountsLoading(false); }
  }, []);

  const checkLiConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/linkedin-ads/status');
      const data: LiStatus = await res.json();
      setLiStatus(data);
      if (data.step === 'connected') fetchLiCampaigns();
      if (data.step === 'authenticated') fetchLiAccounts();
    } catch { setLiStatus({ connected: false, step: 'disconnected' }); }
    finally { setLiLoading(false); }
  }, [fetchLiAccounts]);

  const fetchLiCampaigns = useCallback(async () => {
    setLiCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/campaigns');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLiCampaigns(data.campaigns ?? []);
    } catch { setLiCampaigns([]); }
    finally { setLiCampaignsLoading(false); }
  }, []);

  useEffect(() => { checkLiConnection(); }, [checkLiConnection]);

  useEffect(() => {
    if (searchParams.get('li_step') === 'select_account') { setTab('linkedin-ads'); checkLiConnection(); }
    if (searchParams.get('li_error')) console.error('LinkedIn OAuth error:', searchParams.get('li_error'));
  }, [searchParams, checkLiConnection]);

  async function handleLinkedInConnect() {
    setLiConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/auth');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setLiConnectingOAuth(false); }
  }

  async function handleLiSelectAccount(account: LinkedInAdAccount) {
    setLiSelectingAccount(account.id);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, accountName: account.name }),
      });
      if (!res.ok) throw new Error('Failed');
      await checkLiConnection();
    } catch (err) { console.error('LinkedIn account selection error:', err); }
    finally { setLiSelectingAccount(null); }
  }

  async function handleLinkedInDisconnect() {
    await fetch('/api/integrations/linkedin-ads/disconnect', { method: 'POST' });
    setLiStatus({ connected: false, step: 'disconnected' });
    setLiCampaigns([]);
    setLiAccounts([]);
  }

  // ── Snapchat Ads state ───────────────────────────────────────────────────
  const [snapStatus, setSnapStatus] = useState<SnapStatus>({ connected: false, step: 'disconnected' });
  const [snapLoading, setSnapLoading] = useState(true);
  const [snapCampaigns, setSnapCampaigns] = useState<SnapchatCampaign[]>([]);
  const [snapCampaignsLoading, setSnapCampaignsLoading] = useState(false);
  const [snapConnectingOAuth, setSnapConnectingOAuth] = useState(false);
  const [snapAccounts, setSnapAccounts] = useState<SnapAdAccount[]>([]);
  const [snapAccountsLoading, setSnapAccountsLoading] = useState(false);
  const [snapSelectingAccount, setSnapSelectingAccount] = useState<string | null>(null);

  const fetchSnapAccounts = useCallback(async () => {
    setSnapAccountsLoading(true);
    try {
      const res = await fetch('/api/integrations/snapchat-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSnapAccounts(data.accounts ?? []);
    } catch { setSnapAccounts([]); }
    finally { setSnapAccountsLoading(false); }
  }, []);

  const checkSnapConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/snapchat-ads/status');
      const data: SnapStatus = await res.json();
      setSnapStatus(data);
      if (data.step === 'connected') fetchSnapCampaigns();
      if (data.step === 'authenticated') fetchSnapAccounts();
    } catch { setSnapStatus({ connected: false, step: 'disconnected' }); }
    finally { setSnapLoading(false); }
  }, [fetchSnapAccounts]);

  const fetchSnapCampaigns = useCallback(async () => {
    setSnapCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/snapchat-ads/campaigns');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSnapCampaigns(data.campaigns ?? []);
    } catch { setSnapCampaigns([]); }
    finally { setSnapCampaignsLoading(false); }
  }, []);

  useEffect(() => { checkSnapConnection(); }, [checkSnapConnection]);

  useEffect(() => {
    if (searchParams.get('snap_step') === 'select_account') { setTab('snapchat-ads'); checkSnapConnection(); }
    if (searchParams.get('snap_error')) console.error('Snapchat OAuth error:', searchParams.get('snap_error'));
  }, [searchParams, checkSnapConnection]);

  async function handleSnapchatConnect() {
    setSnapConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/snapchat-ads/auth');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setSnapConnectingOAuth(false); }
  }

  async function handleSnapSelectAccount(account: SnapAdAccount) {
    setSnapSelectingAccount(account.id);
    try {
      const res = await fetch('/api/integrations/snapchat-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adAccountId: account.id, adAccountName: account.name }),
      });
      if (!res.ok) throw new Error('Failed');
      await checkSnapConnection();
    } catch (err) { console.error('Snapchat account selection error:', err); }
    finally { setSnapSelectingAccount(null); }
  }

  async function handleSnapchatDisconnect() {
    await fetch('/api/integrations/snapchat-ads/disconnect', { method: 'POST' });
    setSnapStatus({ connected: false, step: 'disconnected' });
    setSnapCampaigns([]);
    setSnapAccounts([]);
  }

  // ── Microsoft Ads state ──────────────────────────────────────────────────
  const [msStatus, setMsStatus] = useState<MsStatus>({ connected: false, step: 'disconnected' });
  const [msLoading, setMsLoading] = useState(true);
  const [msCampaigns, setMsCampaigns] = useState<MsCampaign[]>([]);
  const [msCampaignsLoading, setMsCampaignsLoading] = useState(false);
  const [msConnectingOAuth, setMsConnectingOAuth] = useState(false);
  const [msAccounts, setMsAccounts] = useState<MsAdAccount[]>([]);
  const [msAccountsLoading, setMsAccountsLoading] = useState(false);
  const [msSelectingAccount, setMsSelectingAccount] = useState<string | null>(null);

  const fetchMsAccounts = useCallback(async () => {
    setMsAccountsLoading(true);
    try {
      const res = await fetch('/api/integrations/microsoft-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMsAccounts(data.accounts ?? []);
    } catch { setMsAccounts([]); }
    finally { setMsAccountsLoading(false); }
  }, []);

  const checkMsConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/microsoft-ads/status');
      const data: MsStatus = await res.json();
      setMsStatus(data);
      if (data.step === 'connected') fetchMsCampaigns();
      if (data.step === 'authenticated') fetchMsAccounts();
    } catch { setMsStatus({ connected: false, step: 'disconnected' }); }
    finally { setMsLoading(false); }
  }, [fetchMsAccounts]);

  const fetchMsCampaigns = useCallback(async () => {
    setMsCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/microsoft-ads/campaigns');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMsCampaigns(data.campaigns ?? []);
    } catch { setMsCampaigns([]); }
    finally { setMsCampaignsLoading(false); }
  }, []);

  useEffect(() => { checkMsConnection(); }, [checkMsConnection]);

  useEffect(() => {
    if (searchParams.get('ms_step') === 'select_account') { setTab('microsoft-ads'); checkMsConnection(); }
    if (searchParams.get('ms_error')) console.error('Microsoft Ads OAuth error:', searchParams.get('ms_error'));
  }, [searchParams, checkMsConnection]);

  async function handleMicrosoftConnect() {
    setMsConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/microsoft-ads/auth');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setMsConnectingOAuth(false); }
  }

  async function handleMsSelectAccount(account: MsAdAccount) {
    setMsSelectingAccount(account.id);
    try {
      const res = await fetch('/api/integrations/microsoft-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, accountName: account.name, customerId: account.customer_id }),
      });
      if (!res.ok) throw new Error('Failed');
      await checkMsConnection();
    } catch (err) { console.error('Microsoft Ads account selection error:', err); }
    finally { setMsSelectingAccount(null); }
  }

  async function handleMicrosoftDisconnect() {
    await fetch('/api/integrations/microsoft-ads/disconnect', { method: 'POST' });
    setMsStatus({ connected: false, step: 'disconnected' });
    setMsCampaigns([]);
    setMsAccounts([]);
  }

  // ── Amazon Ads state ─────────────────────────────────────────────────────
  const [amzStatus, setAmzStatus] = useState<AmzStatus>({ connected: false, step: 'disconnected' });
  const [amzLoading, setAmzLoading] = useState(true);
  const [amzCampaigns, setAmzCampaigns] = useState<AmzCampaign[]>([]);
  const [amzCampaignsLoading, setAmzCampaignsLoading] = useState(false);
  const [amzConnectingOAuth, setAmzConnectingOAuth] = useState(false);
  const [amzProfiles, setAmzProfiles] = useState<AmzProfile[]>([]);
  const [amzProfilesLoading, setAmzProfilesLoading] = useState(false);
  const [amzSelectingProfile, setAmzSelectingProfile] = useState<string | null>(null);

  const fetchAmzProfiles = useCallback(async () => {
    setAmzProfilesLoading(true);
    try {
      const res = await fetch('/api/integrations/amazon-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAmzProfiles(data.accounts ?? []);
    } catch { setAmzProfiles([]); }
    finally { setAmzProfilesLoading(false); }
  }, []);

  const checkAmzConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/amazon-ads/status');
      const data: AmzStatus = await res.json();
      setAmzStatus(data);
      if (data.step === 'connected') fetchAmzCampaigns();
      if (data.step === 'authenticated') fetchAmzProfiles();
    } catch { setAmzStatus({ connected: false, step: 'disconnected' }); }
    finally { setAmzLoading(false); }
  }, [fetchAmzProfiles]);

  const fetchAmzCampaigns = useCallback(async () => {
    setAmzCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/amazon-ads/campaigns');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAmzCampaigns(data.campaigns ?? []);
    } catch { setAmzCampaigns([]); }
    finally { setAmzCampaignsLoading(false); }
  }, []);

  useEffect(() => { checkAmzConnection(); }, [checkAmzConnection]);

  useEffect(() => {
    if (searchParams.get('amz_step') === 'select_account') { setTab('amazon-ads'); checkAmzConnection(); }
    if (searchParams.get('amz_error')) console.error('Amazon Ads OAuth error:', searchParams.get('amz_error'));
  }, [searchParams, checkAmzConnection]);

  async function handleAmazonConnect() {
    setAmzConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/amazon-ads/auth');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setAmzConnectingOAuth(false); }
  }

  async function handleAmzSelectProfile(profile: AmzProfile) {
    setAmzSelectingProfile(profile.profileId);
    try {
      const res = await fetch('/api/integrations/amazon-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileName: profile.name,
          countryCode: profile.countryCode,
          currencyCode: profile.currencyCode,
          accountType: profile.type,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      await checkAmzConnection();
    } catch (err) { console.error('Amazon Ads profile selection error:', err); }
    finally { setAmzSelectingProfile(null); }
  }

  async function handleAmazonDisconnect() {
    await fetch('/api/integrations/amazon-ads/disconnect', { method: 'POST' });
    setAmzStatus({ connected: false, step: 'disconnected' });
    setAmzCampaigns([]);
    setAmzProfiles([]);
  }

  // ── Pinterest Ads state ──────────────────────────────────────────────────
  const [pinStatus, setPinStatus] = useState<PinStatus>({ connected: false, step: 'disconnected' });
  const [pinLoading, setPinLoading] = useState(true);
  const [pinCampaigns, setPinCampaigns] = useState<PinCampaign[]>([]);
  const [pinCampaignsLoading, setPinCampaignsLoading] = useState(false);
  const [pinConnectingOAuth, setPinConnectingOAuth] = useState(false);
  const [pinAccounts, setPinAccounts] = useState<PinAdAccount[]>([]);
  const [pinAccountsLoading, setPinAccountsLoading] = useState(false);
  const [pinSelectingAccount, setPinSelectingAccount] = useState<string | null>(null);

  const fetchPinAccounts = useCallback(async () => {
    setPinAccountsLoading(true);
    try {
      const res = await fetch('/api/integrations/pinterest-ads/accessible-accounts');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPinAccounts(data.accounts ?? []);
    } catch { setPinAccounts([]); }
    finally { setPinAccountsLoading(false); }
  }, []);

  const checkPinConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/pinterest-ads/status');
      const data: PinStatus = await res.json();
      setPinStatus(data);
      if (data.step === 'connected') fetchPinCampaigns();
      if (data.step === 'authenticated') fetchPinAccounts();
    } catch { setPinStatus({ connected: false, step: 'disconnected' }); }
    finally { setPinLoading(false); }
  }, [fetchPinAccounts]);

  const fetchPinCampaigns = useCallback(async () => {
    setPinCampaignsLoading(true);
    try {
      const res = await fetch('/api/integrations/pinterest-ads/campaigns');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPinCampaigns(data.campaigns ?? []);
    } catch { setPinCampaigns([]); }
    finally { setPinCampaignsLoading(false); }
  }, []);

  useEffect(() => { checkPinConnection(); }, [checkPinConnection]);

  useEffect(() => {
    if (searchParams.get('pin_step') === 'select_account') { setTab('pinterest-ads'); checkPinConnection(); }
    if (searchParams.get('pin_error')) console.error('Pinterest Ads OAuth error:', searchParams.get('pin_error'));
  }, [searchParams, checkPinConnection]);

  async function handlePinterestConnect() {
    setPinConnectingOAuth(true);
    try {
      const res = await fetch('/api/integrations/pinterest-ads/auth');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setPinConnectingOAuth(false); }
  }

  async function handlePinSelectAccount(account: PinAdAccount) {
    setPinSelectingAccount(account.id);
    try {
      const res = await fetch('/api/integrations/pinterest-ads/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adAccountId: account.id, adAccountName: account.name }),
      });
      if (!res.ok) throw new Error('Failed');
      await checkPinConnection();
    } catch (err) { console.error('Pinterest Ads account selection error:', err); }
    finally { setPinSelectingAccount(null); }
  }

  async function handlePinterestDisconnect() {
    await fetch('/api/integrations/pinterest-ads/disconnect', { method: 'POST' });
    setPinStatus({ connected: false, step: 'disconnected' });
    setPinCampaigns([]);
    setPinAccounts([]);
  }

  // Build live platform list with real connection statuses
  const platforms = basePlatforms.map(p => {
    if (p.id === 'google-ads' && gadsStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: gadsStatus.customerId, lastSync: gadsStatus.connectedAt };
    }
    if (p.id === 'linkedin-ads' && liStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: liStatus.accountId, lastSync: liStatus.connectedAt };
    }
    if (p.id === 'snapchat-ads' && snapStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: snapStatus.adAccountId, lastSync: snapStatus.connectedAt };
    }
    if (p.id === 'microsoft-ads' && msStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: msStatus.accountId, lastSync: msStatus.connectedAt };
    }
    if (p.id === 'amazon-ads' && amzStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: amzStatus.profileId, lastSync: amzStatus.connectedAt };
    }
    if (p.id === 'pinterest-ads' && pinStatus.connected) {
      return { ...p, status: 'connected' as PlatformConnectionStatus, accountId: pinStatus.adAccountId, lastSync: pinStatus.connectedAt };
    }
    return p;
  });

  const activePlatform = platforms.find(p => p.id === activePlatformId)!;
  const totalCaps = platforms.reduce((a, p) => a + p.capabilityGroups.reduce((b, g) => b + g.capabilities.length, 0), 0);
  const totalAvailable = platforms.reduce((a, p) => a + p.capabilityGroups.reduce((b, g) => b + g.capabilities.filter(c => c.status === 'available').length, 0), 0);

  const activePlatformTotalCaps = activePlatform.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
  const activePlatformAvailableCaps = activePlatform.capabilityGroups.reduce((a, g) => a + g.capabilities.filter(c => c.status === 'available').length, 0);

  // Google Ads KPIs
  const totalImpressions = campaigns.reduce((a, c) => a + c.metrics.impressions, 0);
  const totalClicks = campaigns.reduce((a, c) => a + c.metrics.clicks, 0);
  const totalSpend = campaigns.reduce((a, c) => a + c.metrics.costMicros, 0);
  const totalConversions = campaigns.reduce((a, c) => a + c.metrics.conversions, 0);

  // LinkedIn KPIs
  const liTotalImpressions = liCampaigns.reduce((a, c) => a + c.metrics.impressions, 0);
  const liTotalClicks = liCampaigns.reduce((a, c) => a + c.metrics.clicks, 0);
  const liTotalSpend = liCampaigns.reduce((a, c) => a + c.metrics.spend, 0);
  const liTotalConversions = liCampaigns.reduce((a, c) => a + c.metrics.conversions, 0);

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Ad Platforms', value: platforms.length.toString(), sub: '8 major networks', icon: Plug },
          { label: 'API Endpoints', value: totalAvailable.toString(), sub: `of ${totalCaps} mapped`, icon: Zap },
          { label: 'Campaign Types', value: '30+', sub: 'across all platforms', icon: Megaphone },
          { label: 'Connected', value: platforms.filter(p => p.status === 'connected').length.toString(), sub: 'platforms live', icon: CheckCircle2 },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-brand-text-muted" />
              <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
            </div>
            <div className="text-[24px] font-bold text-white leading-none">{value}</div>
            <div className="text-[11px] text-brand-text-dim mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1 w-fit">
        {([
          { id: 'overview', label: 'Platform Overview' },
          { id: 'platform', label: 'Endpoint Explorer' },
          { id: 'google-ads', label: 'Google Ads', badge: gadsStatus.step !== 'disconnected' },
          { id: 'linkedin-ads', label: 'LinkedIn Ads', badge: liStatus.step !== 'disconnected' },
          { id: 'snapchat-ads', label: 'Snapchat Ads', badge: snapStatus.step !== 'disconnected' },
          { id: 'microsoft-ads', label: 'Microsoft Ads', badge: msStatus.step !== 'disconnected' },
          { id: 'amazon-ads', label: 'Amazon Ads', badge: amzStatus.step !== 'disconnected' },
          { id: 'pinterest-ads', label: 'Pinterest Ads', badge: pinStatus.step !== 'disconnected' },
        ] as { id: Tab; label: string; badge?: boolean }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all flex items-center gap-2 ${
              tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'
            }`}
          >
            {t.label}
            {t.badge && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Supported Ad Platforms</h2>
            <Button variant="default" className="flex items-center gap-1.5 text-[12px] h-8">
              <Plus size={13} /> Request Platform
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {platforms.map(p => {
              const sc = statusConfig[p.status];
              const groupCount = p.capabilityGroups.length;
              const caps = p.capabilityGroups.reduce((a, g) => a + g.capabilities.filter(c => c.status === 'available').length, 0);
              const totalC = p.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
              const isGoogle = p.id === 'google-ads';
              return (
                <div key={p.id} className="rounded-xl border border-brand-border bg-brand-card p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformLogo platform={p} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-white">{p.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        <span className="text-[11px] text-brand-text-muted">{sc.label}</span>
                        {isGoogle && p.accountId && (
                          <span className="text-[10px] text-brand-text-dim ml-1">ID: {p.accountId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Groups', value: groupCount },
                      { label: 'Available', value: caps },
                      { label: 'Total', value: totalC },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-brand-bg border border-brand-border px-2 py-1.5 text-center">
                        <div className="text-[16px] font-bold text-white">{value}</div>
                        <div className="text-[10px] text-brand-text-dim">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-brand-text-dim">{p.authType}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActivePlatformId(p.id);
                          if (isGoogle && p.status === 'connected') setTab('google-ads');
                          else if (p.id === 'linkedin-ads' && p.status === 'connected') setTab('linkedin-ads');
                          else if (p.id === 'snapchat-ads' && p.status === 'connected') setTab('snapchat-ads');
                          else if (p.id === 'microsoft-ads' && p.status === 'connected') setTab('microsoft-ads');
                          else if (p.id === 'amazon-ads' && p.status === 'connected') setTab('amazon-ads');
                          else if (p.id === 'pinterest-ads' && p.status === 'connected') setTab('pinterest-ads');
                          else setTab('platform');
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Info size={12} /> Explore
                      </button>
                      <a href={p.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-text-muted hover:text-brand-text flex items-center gap-1">
                        <ExternalLink size={12} /> Docs
                      </a>
                    </div>
                  </div>

                  {isGoogle ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('google-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handleGoogleDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handleGoogleConnect} disabled={connectingOAuth || gadsLoading}>
                        {connectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : p.id === 'linkedin-ads' ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('linkedin-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handleLinkedInDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handleLinkedInConnect} disabled={liConnectingOAuth || liLoading}>
                        {liConnectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : p.id === 'snapchat-ads' ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('snapchat-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handleSnapchatDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handleSnapchatConnect} disabled={snapConnectingOAuth || snapLoading}>
                        {snapConnectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : p.id === 'microsoft-ads' ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('microsoft-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handleMicrosoftDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handleMicrosoftConnect} disabled={msConnectingOAuth || msLoading}>
                        {msConnectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : p.id === 'amazon-ads' ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('amazon-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handleAmazonDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handleAmazonConnect} disabled={amzConnectingOAuth || amzLoading}>
                        {amzConnectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : p.id === 'pinterest-ads' ? (
                    p.status === 'connected' ? (
                      <div className="flex gap-2 mt-1">
                        <Button variant="default" className="flex-1 text-[12px] h-8" onClick={() => setTab('pinterest-ads')}>
                          <BarChart2 size={12} className="mr-1.5" /> View Campaigns
                        </Button>
                        <Button variant="default" className="text-[12px] h-8 px-3" onClick={handlePinterestDisconnect}>
                          <Unplug size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" className="w-full text-[12px] h-8 mt-1" onClick={handlePinterestConnect} disabled={pinConnectingOAuth || pinLoading}>
                        {pinConnectingOAuth ? <><Loader2 size={12} className="animate-spin mr-1.5" /> Connecting...</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                      </Button>
                    )
                  ) : (
                    <Button variant="default" className="w-full text-[12px] h-8 mt-1" disabled={p.status === 'connected'}>
                      {p.status === 'connected' ? <><RefreshCw size={12} className="mr-1.5" /> Re-sync</> : <><Plus size={12} className="mr-1.5" /> Connect</>}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 mt-2">
            <div className="flex gap-3">
              <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-white mb-1">Integration Architecture</div>
                <p className="text-[12px] text-brand-text-muted leading-relaxed">
                  All integrations use OAuth 2.0 authorization flows. After connecting, AINM stores encrypted refresh tokens
                  and exchanges them for short-lived access tokens per API call. Data is fetched via server-side Next.js API routes
                  (<code className="text-blue-400 text-[11px]">/api/integrations/[platform]/...</code>) to keep credentials
                  server-side only. Webhooks and background jobs handle real-time sync and scheduled report pulls.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Endpoint Explorer ── */}
      {tab === 'platform' && (
        <div className="flex gap-5">
          <div className="w-[200px] shrink-0 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-wider text-brand-text-dim font-medium mb-1 px-1">Select Platform</div>
            {platforms.map(p => (
              <PlatformCard key={p.id} platform={p} isActive={p.id === activePlatformId} onClick={() => setActivePlatformId(p.id)} />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-brand-border bg-brand-card p-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <PlatformLogo platform={activePlatform} />
                  <div>
                    <div className="text-[16px] font-bold text-white">{activePlatform.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusConfig[activePlatform.status].badgeVariant}>{statusConfig[activePlatform.status].label}</Badge>
                      <span className="text-[11px] text-brand-text-muted">{activePlatform.authType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[20px] font-bold text-white">{activePlatformAvailableCaps}</div>
                    <div className="text-[10px] text-brand-text-dim">of {activePlatformTotalCaps} available</div>
                  </div>
                  <a href={activePlatform.docsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-[11px] text-brand-text-muted hover:text-brand-text hover:border-brand-border-hover transition-colors">
                    <ExternalLink size={12} /> API Docs
                  </a>
                  {activePlatformId === 'google-ads' ? (
                    gadsStatus.connected ? (
                      <Button variant="default" className="text-[12px] h-8" onClick={() => setTab('google-ads')}>
                        <BarChart2 size={12} className="mr-1.5" /> Campaigns
                      </Button>
                    ) : (
                      <Button variant="default" className="text-[12px] h-8" onClick={handleGoogleConnect} disabled={connectingOAuth}>
                        {connectingOAuth ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Plus size={12} className="mr-1.5" />}
                        Connect
                      </Button>
                    )
                  ) : (
                    <Button variant="default" className="text-[12px] h-8">
                      <Plus size={12} className="mr-1.5" /> Connect
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-brand-border">
                {([
                  { status: 'available', label: 'Available' },
                  { status: 'beta', label: 'Beta' },
                  { status: 'planned', label: 'Planned' },
                ] as { status: CapabilityStatus; label: string }[]).map(({ status, label }) => {
                  const Icon = capabilityStatusIcon[status];
                  const cfg = capabilityStatusConfig[status];
                  return (
                    <div key={status} className="flex items-center gap-1.5">
                      <Icon size={13} className={cfg.color} />
                      <span className="text-[11px] text-brand-text-muted">{label}</span>
                    </div>
                  );
                })}
                <span className="text-[11px] text-brand-text-dim ml-auto">Click any capability to see API endpoints</span>
              </div>

              <div className="flex flex-col gap-1">
                {activePlatform.capabilityGroups.map(group => (
                  <CapabilityGroupSection key={group.group} group={group} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Google Ads ── */}
      {tab === 'google-ads' && (
        <div className="flex flex-col gap-5">

          {/* ── STEP INDICATOR ── */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: gadsStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Account', done: gadsStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: gadsStatus.step === 'connected' && campaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && gadsStatus.step === 'disconnected') ||
                (step === 2 && gadsStatus.step === 'authenticated') ||
                (step === 3 && gadsStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Disconnected — Authorize ── */}
          {gadsStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-[22px] font-bold text-white mb-5">G</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your Google Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with Google to give AINM read and write access to your campaigns.
                  You&apos;ll pick which account to connect in the next step.
                </p>

                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all your campaigns, ad groups, and performance metrics' },
                    { icon: Megaphone, text: 'Create and manage campaigns directly from AINM' },
                    { icon: BarChart2, text: 'Pull real-time reporting data via GAQL queries' },
                    { icon: Lock, text: 'Your credentials stay server-side — never exposed to the browser' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-blue-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>

                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handleGoogleConnect} disabled={connectingOAuth || gadsLoading}>
                  {connectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to Google...</>
                    : gadsLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with Google</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses OAuth 2.0 — you can revoke access anytime</p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Authenticated — Select Account ── */}
          {gadsStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">G</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select a Google Ads account</h3>
                    <p className="text-[12px] text-brand-text-muted">Your Google account has access to the accounts below. Pick one to connect.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleGoogleDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {accountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your Google Ads accounts...</span>
                  </div>
                ) : accessibleAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No Google Ads accounts found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">
                      The Google account you signed in with doesn&apos;t have access to any Google Ads accounts.
                      Make sure you&apos;re using the right Google account.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchAccounts}>
                        <RefreshCw size={12} className="mr-1.5" /> Retry
                      </Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handleGoogleDisconnect}>
                        Try another account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {accessibleAccounts.map(account => (
                      <button
                        key={account.customerId}
                        onClick={() => handleSelectAccount(account)}
                        disabled={selectingAccount !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group disabled:opacity-60"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                            {account.manager
                              ? <Users size={16} className="text-blue-400" />
                              : <Megaphone size={16} className="text-blue-400" />
                            }
                          </div>
                          {selectingAccount === account.customerId ? (
                            <Loader2 size={16} className="animate-spin text-blue-400" />
                          ) : (
                            <ChevronRight size={16} className="text-brand-text-dim group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">
                          {account.descriptiveName || `Account ${account.customerId}`}
                        </div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">
                          {account.customerId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                        </div>
                        <div className="flex items-center gap-3">
                          {account.currencyCode && (
                            <span className="text-[11px] text-brand-text-dim">{account.currencyCode}</span>
                          )}
                          {account.timeZone && (
                            <span className="text-[11px] text-brand-text-dim">{account.timeZone}</span>
                          )}
                          {account.manager && (
                            <Badge variant="info">Manager</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Connected — Campaign Dashboard ── */}
          {gadsStatus.step === 'connected' && (
            <>
              {/* Connected header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">G</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">
                        {gadsStatus.accountName || 'Google Ads'}
                      </h2>
                      <Badge variant="ok">Connected</Badge>
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      ID: {gadsStatus.customerId?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                      {gadsStatus.connectedAt && <> &middot; Connected {new Date(gadsStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchCampaigns} disabled={campaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${campaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleGoogleDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {/* KPI cards */}
              {campaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Campaigns', value: campaigns.length.toString(), icon: Megaphone, color: 'text-blue-400' },
                    { label: 'Impressions', value: formatNumber(totalImpressions), icon: Eye, color: 'text-purple-400' },
                    { label: 'Clicks', value: formatNumber(totalClicks), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${microsToDollars(totalSpend)}`, icon: DollarSign, color: 'text-amber-400' },
                    { label: 'Conversions', value: totalConversions.toFixed(1), icon: TrendingUp, color: 'text-rose-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Campaign table */}
              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Campaigns (Last 30 Days)</h3>
                  <span className="text-[11px] text-brand-text-dim">{campaigns.length} campaigns fetched via GAQL</span>
                </div>
                <CampaignTable campaigns={campaigns} loading={campaignsLoading} />
              </div>

              {/* Create campaign */}
              <CreateCampaignForm onCreated={fetchCampaigns} />

              {/* API info */}
              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">Fetch:</strong> <code className="text-blue-400">GET /api/integrations/google-ads/campaigns</code> — GAQL query against Google Ads API v18</p>
                  <p><strong className="text-brand-text-muted">Create:</strong> <code className="text-blue-400">POST /api/integrations/google-ads/campaigns</code> — CampaignBudget + Campaign via MutateCampaigns</p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> OAuth 2.0 with refresh token — credentials stored server-side only</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: LinkedIn Ads ── */}
      {tab === 'linkedin-ads' && (
        <div className="flex flex-col gap-5">

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: liStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Account', done: liStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: liStatus.step === 'connected' && liCampaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && liStatus.step === 'disconnected') ||
                (step === 2 && liStatus.step === 'authenticated') ||
                (step === 3 && liStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Authorize */}
          {liStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-blue-700 flex items-center justify-center text-[20px] font-bold text-white mb-5">Li</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your LinkedIn Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with LinkedIn to give AINM access to your advertising campaigns.
                  You&apos;ll pick which ad account to connect in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all your Sponsored Content, Text Ads, and InMail campaigns' },
                    { icon: Megaphone, text: 'Create and manage campaigns targeting professional audiences' },
                    { icon: BarChart2, text: 'Pull impressions, clicks, spend, and conversion data' },
                    { icon: Users, text: 'Target by job title, company size, industry, and seniority' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-blue-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handleLinkedInConnect} disabled={liConnectingOAuth || liLoading}>
                  {liConnectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to LinkedIn...</>
                    : liLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with LinkedIn</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses OAuth 2.0 — you can revoke access anytime from LinkedIn settings</p>
              </div>
            </div>
          )}

          {/* Step 2: Select Account */}
          {liStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-[11px] font-bold text-white">Li</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select a LinkedIn Ad Account</h3>
                    <p className="text-[12px] text-brand-text-muted">Your LinkedIn profile has access to the ad accounts below.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleLinkedInDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {liAccountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your LinkedIn Ad accounts...</span>
                  </div>
                ) : liAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No LinkedIn Ad accounts found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">Your LinkedIn account doesn&apos;t have access to any ad accounts.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchLiAccounts}><RefreshCw size={12} className="mr-1.5" /> Retry</Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handleLinkedInDisconnect}>Try another account</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {liAccounts.map(account => (
                      <button key={account.id} onClick={() => handleLiSelectAccount(account)} disabled={liSelectingAccount !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group disabled:opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-700/10 border border-blue-500/20 flex items-center justify-center">
                            <Megaphone size={16} className="text-blue-400" />
                          </div>
                          {liSelectingAccount === account.id
                            ? <Loader2 size={16} className="animate-spin text-blue-400" />
                            : <ChevronRight size={16} className="text-brand-text-dim group-hover:text-blue-400 transition-colors" />
                          }
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">{account.name}</div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">ID: {account.id}</div>
                        <div className="flex items-center gap-3">
                          {account.currency && <span className="text-[11px] text-brand-text-dim">{account.currency}</span>}
                          <Badge variant={account.status === 'ACTIVE' ? 'ok' : 'warn'}>{account.status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Dashboard */}
          {liStatus.step === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-[11px] font-bold text-white">Li</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">{liStatus.accountName || 'LinkedIn Ads'}</h2>
                      <Badge variant="ok">Connected</Badge>
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      Account ID: {liStatus.accountId}
                      {liStatus.connectedAt && <> &middot; Connected {new Date(liStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchLiCampaigns} disabled={liCampaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${liCampaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleLinkedInDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {liCampaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Campaigns', value: liCampaigns.length.toString(), icon: Megaphone, color: 'text-blue-400' },
                    { label: 'Impressions', value: formatNumber(liTotalImpressions), icon: Eye, color: 'text-purple-400' },
                    { label: 'Clicks', value: formatNumber(liTotalClicks), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${liTotalSpend.toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
                    { label: 'Conversions', value: liTotalConversions.toFixed(1), icon: TrendingUp, color: 'text-rose-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">LinkedIn Campaigns (Last 30 Days)</h3>
                  <span className="text-[11px] text-brand-text-dim">{liCampaigns.length} campaigns</span>
                </div>
                {liCampaignsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from LinkedIn...</span>
                  </div>
                ) : liCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
                    <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
                    <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                          <th className="pb-3 pr-4 font-medium">Campaign</th>
                          <th className="pb-3 px-3 font-medium">Status</th>
                          <th className="pb-3 px-3 font-medium">Type</th>
                          <th className="pb-3 px-3 font-medium">Objective</th>
                          <th className="pb-3 px-3 font-medium text-right">Impressions</th>
                          <th className="pb-3 px-3 font-medium text-right">Clicks</th>
                          <th className="pb-3 px-3 font-medium text-right">CTR</th>
                          <th className="pb-3 px-3 font-medium text-right">Spend</th>
                          <th className="pb-3 pl-3 font-medium text-right">Budget/day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liCampaigns.map(c => {
                          const sc = c.status === 'ACTIVE' ? 'text-emerald-400' : c.status === 'PAUSED' ? 'text-amber-400' : 'text-brand-text-dim';
                          return (
                            <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="text-[13px] font-medium text-white max-w-[260px] truncate">{c.name}</div>
                                <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                              </td>
                              <td className="py-3 px-3"><span className={`text-[12px] font-medium ${sc}`}>{c.status}</span></td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.type.replace(/_/g, ' ')}</td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.objectiveType.replace(/_/g, ' ')}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.impressions)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.clicks)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">{formatPercent(c.metrics.ctr)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.spend.toFixed(2)}</td>
                              <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">{c.dailyBudget ? `$${c.dailyBudget.toFixed(2)}` : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <LinkedInCreateCampaignForm onCreated={fetchLiCampaigns} />

              <LinkedInCampaignGroupsSection />
              <LinkedInCreativesSection campaigns={liCampaigns} />

              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">Campaigns:</strong> <code className="text-blue-400">GET|POST /api/integrations/linkedin-ads/campaigns</code> — REST /adAccounts/&#123;id&#125;/adCampaigns (v202603)</p>
                  <p><strong className="text-brand-text-muted">Groups:</strong> <code className="text-blue-400">GET|POST /api/integrations/linkedin-ads/campaign-groups</code> — /adAccounts/&#123;id&#125;/adCampaignGroups</p>
                  <p><strong className="text-brand-text-muted">Creatives:</strong> <code className="text-blue-400">GET|POST /api/integrations/linkedin-ads/creatives</code> — /adAccounts/&#123;id&#125;/creatives</p>
                  <p><strong className="text-brand-text-muted">Targeting:</strong> <code className="text-blue-400">GET /api/integrations/linkedin-ads/targeting/facets|entities</code></p>
                  <p><strong className="text-brand-text-muted">Audience:</strong> <code className="text-blue-400">POST /api/integrations/linkedin-ads/audience-counts</code></p>
                  <p><strong className="text-brand-text-muted">Pricing:</strong> <code className="text-blue-400">POST /api/integrations/linkedin-ads/budget-pricing</code></p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> OAuth 2.0 — 60-day access token with auto-refresh</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Pinterest Ads ── */}
      {tab === 'pinterest-ads' && (
        <div className="flex flex-col gap-5">

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: pinStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Account', done: pinStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: pinStatus.step === 'connected' && pinCampaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && pinStatus.step === 'disconnected') ||
                (step === 2 && pinStatus.step === 'authenticated') ||
                (step === 3 && pinStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Authorize */}
          {pinStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-red-600 flex items-center justify-center text-[22px] font-bold text-white mb-5">P</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your Pinterest Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with Pinterest to give AINM access to your ad campaigns.
                  You&apos;ll pick which ad account to connect in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all your Standard, Shopping, Video, and Carousel campaigns' },
                    { icon: Megaphone, text: 'Create and manage campaigns targeting Pinterest audiences' },
                    { icon: BarChart2, text: 'Pull impressions, saves, clicks, Pin-clicks, and spend data' },
                    { icon: Lock, text: 'Your credentials stay server-side — never exposed to the browser' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-red-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handlePinterestConnect} disabled={pinConnectingOAuth || pinLoading}>
                  {pinConnectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to Pinterest...</>
                    : pinLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with Pinterest</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses OAuth 2.0 — you can revoke access anytime from Pinterest settings</p>
              </div>
            </div>
          )}

          {/* Step 2: Select Account */}
          {pinStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-[11px] font-bold text-white">P</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select a Pinterest Ad Account</h3>
                    <p className="text-[12px] text-brand-text-muted">Your Pinterest profile has access to the ad accounts below.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handlePinterestDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {pinAccountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-red-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your Pinterest Ad accounts...</span>
                  </div>
                ) : pinAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No Pinterest Ad accounts found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">Your Pinterest account does not have access to any ad accounts.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchPinAccounts}><RefreshCw size={12} className="mr-1.5" /> Retry</Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handlePinterestDisconnect}>Try another account</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pinAccounts.map(account => (
                      <button key={account.id} onClick={() => handlePinSelectAccount(account)} disabled={pinSelectingAccount !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-red-500/40 hover:bg-red-500/5 transition-all group disabled:opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                            <Megaphone size={16} className="text-red-400" />
                          </div>
                          {pinSelectingAccount === account.id
                            ? <Loader2 size={16} className="animate-spin text-red-400" />
                            : <ChevronRight size={16} className="text-brand-text-dim group-hover:text-red-400 transition-colors" />
                          }
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">{account.name}</div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">ID: {account.id}</div>
                        <div className="flex items-center gap-3">
                          {account.currency && <span className="text-[11px] text-brand-text-dim">{account.currency}</span>}
                          <Badge variant={account.status === 'ACTIVE' ? 'ok' : 'warn'}>{account.status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Dashboard */}
          {pinStatus.step === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-[11px] font-bold text-white">P</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">{pinStatus.adAccountName || 'Pinterest Ads'}</h2>
                      <Badge variant="ok">Connected</Badge>
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      Account ID: {pinStatus.adAccountId}
                      {pinStatus.connectedAt && <> &middot; Connected {new Date(pinStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchPinCampaigns} disabled={pinCampaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${pinCampaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handlePinterestDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {pinCampaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Campaigns', value: pinCampaigns.length.toString(), icon: Megaphone, color: 'text-red-400' },
                    { label: 'Impressions', value: formatNumber(pinCampaigns.reduce((a, c) => a + c.metrics.impressions, 0)), icon: Eye, color: 'text-purple-400' },
                    { label: 'Clicks', value: formatNumber(pinCampaigns.reduce((a, c) => a + c.metrics.clicks, 0)), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${pinCampaigns.reduce((a, c) => a + c.metrics.spend, 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Pinterest Campaigns (Last 30 Days)</h3>
                  <span className="text-[11px] text-brand-text-dim">{pinCampaigns.length} campaigns</span>
                </div>
                {pinCampaignsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-red-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from Pinterest...</span>
                  </div>
                ) : pinCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
                    <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
                    <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                          <th className="pb-3 pr-4 font-medium">Campaign</th>
                          <th className="pb-3 px-3 font-medium">Status</th>
                          <th className="pb-3 px-3 font-medium">Objective</th>
                          <th className="pb-3 px-3 font-medium text-right">Impressions</th>
                          <th className="pb-3 px-3 font-medium text-right">Clicks</th>
                          <th className="pb-3 px-3 font-medium text-right">Saves</th>
                          <th className="pb-3 px-3 font-medium text-right">CTR</th>
                          <th className="pb-3 px-3 font-medium text-right">Spend</th>
                          <th className="pb-3 pl-3 font-medium text-right">Daily Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pinCampaigns.map(c => {
                          const sc = c.status === 'ACTIVE' ? 'text-emerald-400' : c.status === 'PAUSED' ? 'text-amber-400' : 'text-brand-text-dim';
                          return (
                            <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="text-[13px] font-medium text-white max-w-[240px] truncate">{c.name}</div>
                                <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                              </td>
                              <td className="py-3 px-3"><span className={`text-[12px] font-medium ${sc}`}>{c.status}</span></td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.objective_type.replace(/_/g, ' ')}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.impressions)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.clicks)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.saves)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">{formatPercent(c.metrics.ctr)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.spend.toFixed(2)}</td>
                              <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                                {c.daily_spend_cap ? `$${c.daily_spend_cap.toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <PinterestCreateCampaignForm onCreated={fetchPinCampaigns} />

              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">Campaigns:</strong> <code className="text-red-400">GET|POST /api/integrations/pinterest-ads/campaigns</code> — /v5/ad_accounts/&#123;id&#125;/campaigns</p>
                  <p><strong className="text-brand-text-muted">Analytics:</strong> <code className="text-red-400">GET /v5/ad_accounts/&#123;id&#125;/campaigns/analytics</code> — impressions, clicks, saves, spend (last 30 days)</p>
                  <p><strong className="text-brand-text-muted">Accounts:</strong> <code className="text-red-400">GET /api/integrations/pinterest-ads/accessible-accounts</code> — /v5/ad_accounts</p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> OAuth 2.0 — Basic auth token exchange via api.pinterest.com/v5/oauth/token</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Amazon Ads ── */}
      {tab === 'amazon-ads' && (
        <div className="flex flex-col gap-5">

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: amzStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Profile', done: amzStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: amzStatus.step === 'connected' && amzCampaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && amzStatus.step === 'disconnected') ||
                (step === 2 && amzStatus.step === 'authenticated') ||
                (step === 3 && amzStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Authorize */}
          {amzStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-orange-600 flex items-center justify-center text-[22px] font-bold text-white mb-5">A</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your Amazon Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with Amazon to give AINM access to your Sponsored Products, Sponsored Brands, and Sponsored Display campaigns.
                  You&apos;ll pick which advertising profile to connect in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all Sponsored Products, Brands, and Display campaigns' },
                    { icon: Megaphone, text: "Create and manage campaigns across Amazon's ad network" },
                    { icon: BarChart2, text: 'Pull impressions, clicks, spend, sales, ACOS, and ROAS data' },
                    { icon: Lock, text: 'Your credentials stay server-side — never exposed to the browser' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-orange-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handleAmazonConnect} disabled={amzConnectingOAuth || amzLoading}>
                  {amzConnectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to Amazon...</>
                    : amzLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with Amazon</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses Login with Amazon (LWA) — you can revoke access anytime</p>
              </div>
            </div>
          )}

          {/* Step 2: Select Profile */}
          {amzStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-[11px] font-bold text-white">A</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select an Amazon Advertising Profile</h3>
                    <p className="text-[12px] text-brand-text-muted">Each profile represents a seller, vendor, or agency account in a specific marketplace.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleAmazonDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {amzProfilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-orange-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your Amazon Advertising profiles...</span>
                  </div>
                ) : amzProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No advertising profiles found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">
                      Your Amazon account doesn&apos;t have any advertising profiles yet. You may need to set up Amazon Ads first.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchAmzProfiles}><RefreshCw size={12} className="mr-1.5" /> Retry</Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handleAmazonDisconnect}>Try another account</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {amzProfiles.map(profile => (
                      <button key={profile.profileId} onClick={() => handleAmzSelectProfile(profile)} disabled={amzSelectingProfile !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group disabled:opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                            <ShoppingCart size={16} className="text-orange-400" />
                          </div>
                          {amzSelectingProfile === profile.profileId
                            ? <Loader2 size={16} className="animate-spin text-orange-400" />
                            : <ChevronRight size={16} className="text-brand-text-dim group-hover:text-orange-400 transition-colors" />
                          }
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">{profile.name}</div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">ID: {profile.profileId}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-brand-text-dim">{profile.countryCode}</span>
                          <span className="text-[11px] text-brand-text-dim">{profile.currencyCode}</span>
                          <Badge variant="info">{profile.type}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Dashboard */}
          {amzStatus.step === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-[11px] font-bold text-white">A</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">{amzStatus.profileName || 'Amazon Ads'}</h2>
                      <Badge variant="ok">Connected</Badge>
                      {amzStatus.countryCode && <Badge variant="info">{amzStatus.countryCode}</Badge>}
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      Profile ID: {amzStatus.profileId}
                      {amzStatus.connectedAt && <> &middot; Connected {new Date(amzStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchAmzCampaigns} disabled={amzCampaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${amzCampaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleAmazonDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {amzCampaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Campaigns', value: amzCampaigns.length.toString(), icon: Megaphone, color: 'text-orange-400' },
                    { label: 'Clicks', value: formatNumber(amzCampaigns.reduce((a, c) => a + c.metrics.clicks, 0)), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${amzCampaigns.reduce((a, c) => a + c.metrics.spend, 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
                    { label: 'Sales', value: `$${amzCampaigns.reduce((a, c) => a + c.metrics.sales, 0).toFixed(2)}`, icon: TrendingUp, color: 'text-rose-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Amazon Ads Campaigns</h3>
                  <span className="text-[11px] text-brand-text-dim">{amzCampaigns.length} campaigns</span>
                </div>
                {amzCampaignsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-orange-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from Amazon Ads...</span>
                  </div>
                ) : amzCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
                    <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
                    <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected profile.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                          <th className="pb-3 pr-4 font-medium">Campaign</th>
                          <th className="pb-3 px-3 font-medium">State</th>
                          <th className="pb-3 px-3 font-medium">Type</th>
                          <th className="pb-3 px-3 font-medium">Targeting</th>
                          <th className="pb-3 px-3 font-medium text-right">Clicks</th>
                          <th className="pb-3 px-3 font-medium text-right">Spend</th>
                          <th className="pb-3 px-3 font-medium text-right">Sales</th>
                          <th className="pb-3 px-3 font-medium text-right">ACOS</th>
                          <th className="pb-3 pl-3 font-medium text-right">Daily Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amzCampaigns.map(c => {
                          const sc = c.state === 'enabled' ? 'text-emerald-400' : c.state === 'paused' ? 'text-amber-400' : 'text-brand-text-dim';
                          const typeLabel: Record<string, string> = {
                            sponsoredProducts: 'SP',
                            sponsoredBrands: 'SB',
                            sponsoredDisplay: 'SD',
                          };
                          return (
                            <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="text-[13px] font-medium text-white max-w-[240px] truncate">{c.name}</div>
                                <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                              </td>
                              <td className="py-3 px-3"><span className={`text-[12px] font-medium ${sc}`}>{c.state}</span></td>
                              <td className="py-3 px-3">
                                <Badge variant="info">{typeLabel[c.campaignType] ?? c.campaignType}</Badge>
                              </td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.targetingType}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.clicks)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.spend.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.sales.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                                {c.metrics.acos > 0 ? `${(c.metrics.acos * 100).toFixed(1)}%` : '—'}
                              </td>
                              <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                                ${c.daily_budget.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <AmazonAdsCreateCampaignForm onCreated={fetchAmzCampaigns} />

              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">SP Campaigns:</strong> <code className="text-orange-400">GET|POST /api/integrations/amazon-ads/campaigns</code> — /v2/sp/campaigns</p>
                  <p><strong className="text-brand-text-muted">SB Campaigns:</strong> <code className="text-orange-400">GET /api/integrations/amazon-ads/campaigns</code> — /v4/campaigns?campaignType=sponsoredBrands</p>
                  <p><strong className="text-brand-text-muted">Profiles:</strong> <code className="text-orange-400">GET /api/integrations/amazon-ads/accessible-accounts</code> — /v2/profiles</p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> Login with Amazon (LWA) — access + refresh token via api.amazon.com/auth/o2/token</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Microsoft Ads ── */}
      {tab === 'microsoft-ads' && (
        <div className="flex flex-col gap-5">

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: msStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Account', done: msStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: msStatus.step === 'connected' && msCampaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && msStatus.step === 'disconnected') ||
                (step === 2 && msStatus.step === 'authenticated') ||
                (step === 3 && msStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Authorize */}
          {msStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-sky-600 flex items-center justify-center text-[22px] font-bold text-white mb-5">Ms</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your Microsoft Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with Microsoft to give AINM access to your Bing Ads campaigns.
                  You&apos;ll pick which ad account to connect in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all your Search, Shopping, and Audience campaigns on Bing, Yahoo & DuckDuckGo' },
                    { icon: Megaphone, text: 'Create and manage campaigns targeting Microsoft\'s search network' },
                    { icon: BarChart2, text: 'Pull impressions, clicks, spend, and conversion data' },
                    { icon: Lock, text: 'Your credentials stay server-side — never exposed to the browser' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-sky-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handleMicrosoftConnect} disabled={msConnectingOAuth || msLoading}>
                  {msConnectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to Microsoft...</>
                    : msLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with Microsoft</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses OAuth 2.0 — you can revoke access anytime from Microsoft account settings</p>
              </div>
            </div>
          )}

          {/* Step 2: Select Account */}
          {msStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center text-[11px] font-bold text-white">Ms</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select a Microsoft Ads Account</h3>
                    <p className="text-[12px] text-brand-text-muted">Your Microsoft account has access to the ad accounts below.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleMicrosoftDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {msAccountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your Microsoft Ads accounts...</span>
                  </div>
                ) : msAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No Microsoft Ads accounts found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">Your Microsoft account doesn&apos;t have access to any ad accounts.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchMsAccounts}><RefreshCw size={12} className="mr-1.5" /> Retry</Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handleMicrosoftDisconnect}>Try another account</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {msAccounts.map(account => (
                      <button key={account.id} onClick={() => handleMsSelectAccount(account)} disabled={msSelectingAccount !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group disabled:opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-sky-600/10 border border-sky-500/20 flex items-center justify-center">
                            <Megaphone size={16} className="text-sky-400" />
                          </div>
                          {msSelectingAccount === account.id
                            ? <Loader2 size={16} className="animate-spin text-sky-400" />
                            : <ChevronRight size={16} className="text-brand-text-dim group-hover:text-sky-400 transition-colors" />
                          }
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">{account.name}</div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">ID: {account.id}</div>
                        <div className="flex items-center gap-3">
                          {account.number && <span className="text-[11px] text-brand-text-dim">{account.number}</span>}
                          <Badge variant={account.status === 'Active' ? 'ok' : 'warn'}>{account.status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Dashboard */}
          {msStatus.step === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center text-[11px] font-bold text-white">Ms</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">{msStatus.accountName || 'Microsoft Ads'}</h2>
                      <Badge variant="ok">Connected</Badge>
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      Account ID: {msStatus.accountId}
                      {msStatus.connectedAt && <> &middot; Connected {new Date(msStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchMsCampaigns} disabled={msCampaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${msCampaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleMicrosoftDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {msCampaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Campaigns', value: msCampaigns.length.toString(), icon: Megaphone, color: 'text-sky-400' },
                    { label: 'Impressions', value: formatNumber(msCampaigns.reduce((a, c) => a + c.metrics.impressions, 0)), icon: Eye, color: 'text-purple-400' },
                    { label: 'Clicks', value: formatNumber(msCampaigns.reduce((a, c) => a + c.metrics.clicks, 0)), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${msCampaigns.reduce((a, c) => a + c.metrics.spend, 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Microsoft Ads Campaigns</h3>
                  <span className="text-[11px] text-brand-text-dim">{msCampaigns.length} campaigns</span>
                </div>
                {msCampaignsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from Microsoft Ads...</span>
                  </div>
                ) : msCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
                    <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
                    <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                          <th className="pb-3 pr-4 font-medium">Campaign</th>
                          <th className="pb-3 px-3 font-medium">Status</th>
                          <th className="pb-3 px-3 font-medium">Type</th>
                          <th className="pb-3 px-3 font-medium text-right">Impressions</th>
                          <th className="pb-3 px-3 font-medium text-right">Clicks</th>
                          <th className="pb-3 px-3 font-medium text-right">CTR</th>
                          <th className="pb-3 px-3 font-medium text-right">Spend</th>
                          <th className="pb-3 pl-3 font-medium text-right">Daily Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {msCampaigns.map(c => {
                          const sc = c.status === 'Active' ? 'text-emerald-400' : c.status === 'Paused' ? 'text-amber-400' : 'text-brand-text-dim';
                          return (
                            <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="text-[13px] font-medium text-white max-w-[260px] truncate">{c.name}</div>
                                <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                              </td>
                              <td className="py-3 px-3"><span className={`text-[12px] font-medium ${sc}`}>{c.status}</span></td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.type}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.impressions)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.clicks)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">{formatPercent(c.metrics.ctr)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.spend.toFixed(2)}</td>
                              <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                                {c.daily_budget ? `$${c.daily_budget.toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <MicrosoftAdsCreateCampaignForm onCreated={fetchMsCampaigns} />

              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">Campaigns:</strong> <code className="text-sky-400">GET|POST /api/integrations/microsoft-ads/campaigns</code> — CampaignManagementService v13</p>
                  <p><strong className="text-brand-text-muted">Accounts:</strong> <code className="text-sky-400">GET /api/integrations/microsoft-ads/accessible-accounts</code> — CustomerManagementService.GetAccountsInfo</p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> OAuth 2.0 via login.microsoftonline.com — access + refresh token with auto-refresh</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Snapchat Ads ── */}
      {tab === 'snapchat-ads' && (
        <div className="flex flex-col gap-5">

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {[
              { step: 1, label: 'Authorize', done: snapStatus.step !== 'disconnected' },
              { step: 2, label: 'Select Account', done: snapStatus.step === 'connected' },
              { step: 3, label: 'View Campaigns', done: snapStatus.step === 'connected' && snapCampaigns.length > 0 },
            ].map(({ step, label, done }, i) => {
              const isCurrent =
                (step === 1 && snapStatus.step === 'disconnected') ||
                (step === 2 && snapStatus.step === 'authenticated') ||
                (step === 3 && snapStatus.step === 'connected');
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${done ? 'bg-emerald-500' : 'bg-brand-border'} mx-1`} />}
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCurrent ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-brand-card text-brand-text-dim border border-brand-border'
                    }`}>
                      {done ? <CheckCircle2 size={14} /> : step}
                    </div>
                    <span className={`text-[12px] font-medium ${isCurrent ? 'text-white' : done ? 'text-emerald-400' : 'text-brand-text-dim'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Authorize */}
          {snapStatus.step === 'disconnected' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-[22px] font-bold text-black mb-5" style={{ background: 'linear-gradient(135deg, #FFFC00 0%, #FFA600 100%)' }}>Sn</div>
                <h3 className="text-[18px] font-bold text-white mb-2">Connect your Snapchat Ads account</h3>
                <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
                  Sign in with Snapchat to give AINM access to your advertising campaigns.
                  You&apos;ll pick which ad account to connect in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { icon: Eye, text: 'View all your Snap Ads, Story Ads, and Collection Ads campaigns' },
                    { icon: Megaphone, text: 'Create and manage campaigns targeting Snapchat\'s young audience' },
                    { icon: BarChart2, text: 'Pull swipe-ups, impressions, spend, and conversion data' },
                    { icon: Lock, text: 'Your credentials stay server-side — never exposed to the browser' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-left rounded-lg bg-brand-bg border border-brand-border px-4 py-3">
                      <Icon size={16} className="text-yellow-400 shrink-0" />
                      <span className="text-[12px] text-brand-text-muted">{text}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="text-[13px] h-11 px-8" onClick={handleSnapchatConnect} disabled={snapConnectingOAuth || snapLoading}>
                  {snapConnectingOAuth
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Redirecting to Snapchat...</>
                    : snapLoading
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Checking connection...</>
                    : <>Sign in with Snapchat</>
                  }
                </Button>
                <p className="text-[11px] text-brand-text-dim mt-3">Uses OAuth 2.0 — you can revoke access anytime from Snapchat settings</p>
              </div>
            </div>
          )}

          {/* Step 2: Select Account */}
          {snapStatus.step === 'authenticated' && (
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="border-b border-brand-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-black" style={{ background: 'linear-gradient(135deg, #FFFC00 0%, #FFA600 100%)' }}>Sn</div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-white">Select a Snapchat Ad Account</h3>
                    <p className="text-[12px] text-brand-text-muted">Your Snapchat profile has access to the ad accounts below.</p>
                  </div>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleSnapchatDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {snapAccountsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-yellow-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Fetching your Snapchat Ad accounts...</span>
                  </div>
                ) : snapAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-[14px] text-white mb-1">No Snapchat Ad accounts found</p>
                    <p className="text-[12px] text-brand-text-muted mb-4">Your Snapchat account doesn&apos;t have access to any ad accounts.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="default" className="text-[12px] h-8" onClick={fetchSnapAccounts}><RefreshCw size={12} className="mr-1.5" /> Retry</Button>
                      <Button variant="default" className="text-[12px] h-8" onClick={handleSnapchatDisconnect}>Try another account</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {snapAccounts.map(account => (
                      <button key={account.id} onClick={() => handleSnapSelectAccount(account)} disabled={snapSelectingAccount !== null}
                        className="text-left rounded-xl border border-brand-border bg-brand-bg p-4 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all group disabled:opacity-60">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Megaphone size={16} className="text-yellow-400" />
                          </div>
                          {snapSelectingAccount === account.id
                            ? <Loader2 size={16} className="animate-spin text-yellow-400" />
                            : <ChevronRight size={16} className="text-brand-text-dim group-hover:text-yellow-400 transition-colors" />
                          }
                        </div>
                        <div className="text-[14px] font-semibold text-white mb-1 truncate">{account.name}</div>
                        <div className="text-[12px] text-brand-text-muted mb-2 font-mono">ID: {account.id}</div>
                        <div className="flex items-center gap-3">
                          {account.currency && <span className="text-[11px] text-brand-text-dim">{account.currency}</span>}
                          {account.timezone && <span className="text-[11px] text-brand-text-dim">{account.timezone}</span>}
                          <Badge variant={account.status === 'ACTIVE' ? 'ok' : 'warn'}>{account.status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Dashboard */}
          {snapStatus.step === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-black" style={{ background: 'linear-gradient(135deg, #FFFC00 0%, #FFA600 100%)' }}>Sn</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-bold text-white">{snapStatus.adAccountName || 'Snapchat Ads'}</h2>
                      <Badge variant="ok">Connected</Badge>
                    </div>
                    <div className="text-[12px] text-brand-text-muted mt-0.5">
                      Account ID: {snapStatus.adAccountId}
                      {snapStatus.connectedAt && <> &middot; Connected {new Date(snapStatus.connectedAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="text-[12px] h-8" onClick={fetchSnapCampaigns} disabled={snapCampaignsLoading}>
                    <RefreshCw size={12} className={`mr-1.5 ${snapCampaignsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button variant="default" className="text-[12px] h-8" onClick={handleSnapchatDisconnect}>
                    <Unplug size={12} className="mr-1.5" /> Disconnect
                  </Button>
                </div>
              </div>

              {snapCampaigns.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Campaigns', value: snapCampaigns.length.toString(), icon: Megaphone, color: 'text-yellow-400' },
                    { label: 'Impressions', value: formatNumber(snapCampaigns.reduce((a, c) => a + c.metrics.impressions, 0)), icon: Eye, color: 'text-purple-400' },
                    { label: 'Swipe-Ups', value: formatNumber(snapCampaigns.reduce((a, c) => a + c.metrics.swipes, 0)), icon: MousePointerClick, color: 'text-emerald-400' },
                    { label: 'Spend', value: `$${snapCampaigns.reduce((a, c) => a + c.metrics.spend, 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
                    { label: 'Conversions', value: snapCampaigns.reduce((a, c) => a + c.metrics.conversions, 0).toFixed(0), icon: TrendingUp, color: 'text-rose-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-brand-border bg-brand-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className={color} />
                        <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">{label}</span>
                      </div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-white">Snapchat Campaigns (Last 30 Days)</h3>
                  <span className="text-[11px] text-brand-text-dim">{snapCampaigns.length} campaigns</span>
                </div>
                {snapCampaignsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-yellow-400" />
                    <span className="ml-3 text-[13px] text-brand-text-muted">Loading campaigns from Snapchat...</span>
                  </div>
                ) : snapCampaigns.length === 0 ? (
                  <div className="text-center py-16">
                    <Megaphone size={32} className="mx-auto text-brand-text-dim mb-3" />
                    <p className="text-[14px] text-brand-text-muted mb-1">No campaigns found</p>
                    <p className="text-[12px] text-brand-text-dim">Create your first campaign or check the connected account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                          <th className="pb-3 pr-4 font-medium">Campaign</th>
                          <th className="pb-3 px-3 font-medium">Status</th>
                          <th className="pb-3 px-3 font-medium">Objective</th>
                          <th className="pb-3 px-3 font-medium text-right">Impressions</th>
                          <th className="pb-3 px-3 font-medium text-right">Swipe-Ups</th>
                          <th className="pb-3 px-3 font-medium text-right">SUR</th>
                          <th className="pb-3 px-3 font-medium text-right">Spend</th>
                          <th className="pb-3 pl-3 font-medium text-right">Daily Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snapCampaigns.map(c => {
                          const sc = c.status === 'ACTIVE' ? 'text-emerald-400' : c.status === 'PAUSED' ? 'text-amber-400' : 'text-brand-text-dim';
                          return (
                            <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-sidebar-hover/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="text-[13px] font-medium text-white max-w-[260px] truncate">{c.name}</div>
                                <div className="text-[11px] text-brand-text-dim">ID: {c.id}</div>
                              </td>
                              <td className="py-3 px-3"><span className={`text-[12px] font-medium ${sc}`}>{c.status}</span></td>
                              <td className="py-3 px-3 text-[12px] text-brand-text-muted">{c.objective.replace(/_/g, ' ')}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.impressions)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">{formatNumber(c.metrics.swipes)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-brand-text-muted tabular-nums">{formatPercent(c.metrics.swipe_up_rate)}</td>
                              <td className="py-3 px-3 text-right text-[13px] text-white tabular-nums">${c.metrics.spend.toFixed(2)}</td>
                              <td className="py-3 pl-3 text-right text-[13px] text-brand-text-muted tabular-nums">
                                {c.daily_budget_micro ? `$${(c.daily_budget_micro / 1_000_000).toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <SnapchatCreateCampaignForm onCreated={fetchSnapCampaigns} />

              <div className="rounded-xl border border-brand-border/50 bg-brand-card/50 p-4">
                <div className="text-[11px] text-brand-text-dim space-y-1">
                  <p><strong className="text-brand-text-muted">Campaigns:</strong> <code className="text-yellow-400">GET|POST /api/integrations/snapchat-ads/campaigns</code> — /v1/adaccounts/&#123;id&#125;/campaigns</p>
                  <p><strong className="text-brand-text-muted">Accounts:</strong> <code className="text-yellow-400">GET /api/integrations/snapchat-ads/accessible-accounts</code> — /v1/organizations/&#123;id&#125;/adaccounts</p>
                  <p><strong className="text-brand-text-muted">Stats:</strong> <code className="text-yellow-400">GET /v1/campaigns/&#123;id&#125;/stats</code> — granularity=TOTAL, last 30 days</p>
                  <p><strong className="text-brand-text-muted">Auth:</strong> OAuth 2.0 — access + refresh token via accounts.snapchat.com</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-brand-text-muted text-[13px]">Loading...</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}

// ─── Amazon Ads Create Campaign Form ─────────────────────────────────────────

function AmazonAdsCreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateAmazonAdsCampaignInput>({
    name: '',
    campaignType: 'sponsoredProducts',
    targetingType: 'manual',
    daily_budget: 10,
    start_date: new Date().toISOString().split('T')[0],
    state: 'paused',
  });

  function updateField<K extends keyof CreateAmazonAdsCampaignInput>(key: K, value: CreateAmazonAdsCampaignInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null); setSuccess(false);
    try {
      const res = await fetch('/api/integrations/amazon-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setSuccess(true);
      setForm(prev => ({ ...prev, name: '' }));
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-brand-border px-4 py-3 text-[13px] text-brand-text-muted hover:border-orange-500/40 hover:text-orange-400 transition-colors w-full">
        <Plus size={16} /> Create a new Amazon Ads campaign via API
      </button>
    );
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-orange-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Create Amazon Ads Campaign</h3>
        <button onClick={() => setOpen(false)} className="text-[12px] text-brand-text-muted hover:text-white transition-colors">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Summer SP – Exact Match Keywords" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Campaign Type</label>
          <select className={inputClass} value={form.campaignType} onChange={e => updateField('campaignType', e.target.value as any)}>
            <option value="sponsoredProducts">Sponsored Products</option>
            <option value="sponsoredBrands">Sponsored Brands</option>
            <option value="sponsoredDisplay">Sponsored Display</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Targeting Type</label>
          <select className={inputClass} value={form.targetingType} onChange={e => updateField('targetingType', e.target.value as any)}>
            <option value="manual">Manual</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Daily Budget (USD)</label>
          <input className={inputClass} type="number" min="1" step="0.01" value={form.daily_budget} onChange={e => updateField('daily_budget', parseFloat(e.target.value || '0'))} />
        </div>
        <div>
          <label className={labelClass}>Initial State</label>
          <select className={inputClass} value={form.state} onChange={e => updateField('state', e.target.value as any)}>
            <option value="paused">Paused (recommended)</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input className={inputClass} type="date" value={form.start_date} onChange={e => updateField('start_date', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>End Date (optional)</label>
          <input className={inputClass} type="date" value={form.end_date || ''} onChange={e => updateField('end_date', e.target.value || undefined)} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── Microsoft Ads Create Campaign Form ──────────────────────────────────────

function MicrosoftAdsCreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateMicrosoftAdsCampaignInput>({
    name: '',
    type: 'Search',
    daily_budget: 10,
    status: 'Paused',
    time_zone: 'PacificTimeUSCanadaTijuana',
  });

  function updateField<K extends keyof CreateMicrosoftAdsCampaignInput>(key: K, value: CreateMicrosoftAdsCampaignInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null); setSuccess(false);
    try {
      const res = await fetch('/api/integrations/microsoft-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setSuccess(true);
      setForm(prev => ({ ...prev, name: '' }));
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-brand-border px-4 py-3 text-[13px] text-brand-text-muted hover:border-sky-500/40 hover:text-sky-400 transition-colors w-full">
        <Plus size={16} /> Create a new Microsoft Ads campaign via API
      </button>
    );
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-sky-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Create Microsoft Ads Campaign</h3>
        <button onClick={() => setOpen(false)} className="text-[12px] text-brand-text-muted hover:text-white transition-colors">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Spring Sale – Bing Search" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Campaign Type</label>
          <select className={inputClass} value={form.type} onChange={e => updateField('type', e.target.value as any)}>
            <option value="Search">Search</option>
            <option value="Shopping">Shopping</option>
            <option value="DynamicSearchAds">Dynamic Search Ads</option>
            <option value="Audience">Audience</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Initial Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateField('status', e.target.value as any)}>
            <option value="Paused">Paused (recommended)</option>
            <option value="Active">Active</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Daily Budget (USD)</label>
          <input className={inputClass} type="number" min="1" step="0.01" value={form.daily_budget} onChange={e => updateField('daily_budget', parseFloat(e.target.value || '0'))} />
        </div>
        <div>
          <label className={labelClass}>Time Zone</label>
          <select className={inputClass} value={form.time_zone} onChange={e => updateField('time_zone', e.target.value)}>
            <option value="PacificTimeUSCanadaTijuana">Pacific (US)</option>
            <option value="MountainTimeUSCanada">Mountain (US)</option>
            <option value="CentralTimeUSCanada">Central (US)</option>
            <option value="EasternTimeUSCanada">Eastern (US)</option>
            <option value="GMTDublinEdinburghLisbonLondon">London (GMT)</option>
            <option value="BrusselsCopenhagenMadridParis">Central Europe</option>
            <option value="Chennai">Chennai/Mumbai/New Delhi</option>
            <option value="Singapore">Singapore/Kuala Lumpur</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── LinkedIn Create Campaign Form ────────────────────────────────────────────

function LinkedInCreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTargeting, setShowTargeting] = useState(false);

  const [form, setForm] = useState<CreateLinkedInCampaignInput>({
    name: '',
    objectiveType: 'WEBSITE_VISITS',
    type: 'SPONSORED_UPDATES',
    costType: 'CPC',
    dailyBudget: 50,
    status: 'PAUSED',
    audienceExpansionEnabled: false,
  });

  const [locationUrns, setLocationUrns] = useState('');
  const [excludeSeniority, setExcludeSeniority] = useState('');

  function updateField<K extends keyof CreateLinkedInCampaignInput>(key: K, value: CreateLinkedInCampaignInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null); setSuccess(false);
    try {
      const payload = { ...form };

      if (locationUrns.trim()) {
        const locUrns = locationUrns.split(',').map(s => s.trim()).filter(Boolean);
        const targeting: TargetingCriteria = {
          include: { and: [{ or: { 'urn:li:adTargetingFacet:locations': locUrns } }] },
        };
        if (excludeSeniority.trim()) {
          const exUrns = excludeSeniority.split(',').map(s => s.trim()).filter(Boolean);
          targeting.exclude = { or: { 'urn:li:adTargetingFacet:seniorities': exUrns } };
        }
        payload.targetingCriteria = targeting;
      }

      const res = await fetch('/api/integrations/linkedin-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setSuccess(true);
      setForm(prev => ({ ...prev, name: '' }));
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-brand-border px-4 py-3 text-[13px] text-brand-text-muted hover:border-blue-500/40 hover:text-blue-400 transition-colors w-full">
        <Plus size={16} /> Create a new LinkedIn campaign via API
      </button>
    );
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-blue-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Create LinkedIn Campaign</h3>
        <button onClick={() => setOpen(false)} className="text-[12px] text-brand-text-muted hover:text-white transition-colors">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Q2 Brand Awareness – Decision Makers" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Objective</label>
          <select className={inputClass} value={form.objectiveType} onChange={e => updateField('objectiveType', e.target.value as any)}>
            <option value="BRAND_AWARENESS">Brand Awareness</option>
            <option value="WEBSITE_VISITS">Website Visits</option>
            <option value="ENGAGEMENT">Engagement</option>
            <option value="VIDEO_VIEWS">Video Views</option>
            <option value="LEAD_GENERATION">Lead Generation</option>
            <option value="WEBSITE_CONVERSIONS">Website Conversions</option>
            <option value="JOB_APPLICANTS">Job Applicants</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Campaign Type</label>
          <select className={inputClass} value={form.type} onChange={e => updateField('type', e.target.value as any)}>
            <option value="SPONSORED_UPDATES">Sponsored Content</option>
            <option value="TEXT_AD">Text Ads</option>
            <option value="SPONSORED_INMAILS">Message Ads (InMail)</option>
            <option value="DYNAMIC">Dynamic Ads</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Cost Type</label>
          <select className={inputClass} value={form.costType} onChange={e => updateField('costType', e.target.value as any)}>
            <option value="CPC">CPC (Cost per Click)</option>
            <option value="CPM">CPM (Cost per 1K Impressions)</option>
            <option value="CPV">CPV (Cost per View)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Unit Cost / Bid ({form.currencyCode || 'USD'})</label>
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 2.00" value={form.unitCost || ''} onChange={e => updateField('unitCost', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Daily Budget ({form.currencyCode || 'USD'})</label>
          <input className={inputClass} type="number" min="10" step="1" value={form.dailyBudget} onChange={e => updateField('dailyBudget', parseFloat(e.target.value || '0'))} />
        </div>
        <div>
          <label className={labelClass}>Total Budget (optional)</label>
          <input className={inputClass} type="number" min="0" step="1" placeholder="No limit" value={form.totalBudget || ''} onChange={e => updateField('totalBudget', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Campaign Group ID (optional)</label>
          <input className={inputClass} placeholder="e.g. 612345678" value={form.campaignGroupId || ''} onChange={e => updateField('campaignGroupId', e.target.value || undefined)} />
        </div>
        <div>
          <label className={labelClass}>Initial Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateField('status', e.target.value as any)}>
            <option value="PAUSED">Paused (recommended)</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-[12px] text-brand-text-muted cursor-pointer">
            <input type="checkbox" checked={form.audienceExpansionEnabled ?? false} onChange={e => updateField('audienceExpansionEnabled', e.target.checked)} className="rounded border-brand-border" />
            Enable Audience Expansion
          </label>
          <button type="button" onClick={() => setShowTargeting(!showTargeting)} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            <Target size={12} /> {showTargeting ? 'Hide' : 'Show'} Targeting Options
          </button>
        </div>

        {showTargeting && (
          <>
            <div className="sm:col-span-2 rounded-lg border border-brand-border/60 bg-brand-bg/50 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-blue-400" />
                <span className="text-[12px] font-semibold text-white">Targeting Criteria</span>
                <span className="text-[11px] text-brand-text-dim">(min. 300 audience members required)</span>
              </div>
              <div>
                <label className={labelClass}>Include Locations (comma-separated URNs)</label>
                <input className={inputClass} placeholder="urn:li:geo:103644278, urn:li:geo:101174742" value={locationUrns} onChange={e => setLocationUrns(e.target.value)} />
                <p className="text-[10px] text-brand-text-dim mt-1">Use targeting entities API to discover URNs. US=urn:li:geo:103644278, Canada=urn:li:geo:101174742</p>
              </div>
              <div>
                <label className={labelClass}>Exclude Seniorities (comma-separated URNs, optional)</label>
                <input className={inputClass} placeholder="urn:li:seniority:3" value={excludeSeniority} onChange={e => setExcludeSeniority(e.target.value)} />
                <p className="text-[10px] text-brand-text-dim mt-1">Entry=urn:li:seniority:3, Senior=urn:li:seniority:4, Manager=urn:li:seniority:5</p>
              </div>
            </div>
          </>
        )}

        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── LinkedIn Campaign Groups Section ─────────────────────────────────────────

function LinkedInCampaignGroupsSection() {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<LinkedInCampaignGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupBudget, setGroupBudget] = useState('');

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/campaign-groups');
      const data = await res.json();
      if (res.ok) setGroups(data.groups ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (open && groups.length === 0) fetchGroups(); }, [open, fetchGroups, groups.length]);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null);
    try {
      const payload: CreateCampaignGroupInput = { name: groupName, status: 'ACTIVE' };
      if (groupBudget) payload.totalBudget = { amount: groupBudget, currencyCode: 'USD' };
      const res = await fetch('/api/integrations/linkedin-ads/campaign-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      setGroupName(''); setGroupBudget(''); setShowCreate(false);
      fetchGroups();
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-blue-500/50 focus:outline-none transition-colors';

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-sidebar-hover/50 transition-colors">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <span className="text-[13px] font-semibold text-white">Campaign Groups</span>
          {groups.length > 0 && <Badge variant="info">{groups.length}</Badge>}
        </div>
        {open ? <ChevronDown size={16} className="text-brand-text-dim" /> : <ChevronRight size={16} className="text-brand-text-dim" />}
      </button>

      {open && (
        <div className="border-t border-brand-border p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-blue-400" />
              <span className="ml-2 text-[13px] text-brand-text-muted">Loading campaign groups...</span>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-[13px] text-brand-text-muted text-center py-6">No campaign groups found. Groups let you manage budget and status across multiple campaigns.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 px-3 font-medium">Status</th>
                    <th className="pb-2 px-3 font-medium text-right">Total Budget</th>
                    <th className="pb-2 pl-3 font-medium">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id} className="border-b border-brand-border/50">
                      <td className="py-2.5 pr-4 text-[13px] text-white font-medium">{g.name}</td>
                      <td className="py-2.5 px-3"><Badge variant={g.status === 'ACTIVE' ? 'ok' : 'warn'}>{g.status}</Badge></td>
                      <td className="py-2.5 px-3 text-right text-[13px] text-brand-text-muted">{g.totalBudget ? `${g.totalBudget.currencyCode} ${g.totalBudget.amount}` : '—'}</td>
                      <td className="py-2.5 pl-3 text-[11px] text-brand-text-dim font-mono">{g.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showCreate ? (
            <form onSubmit={handleCreateGroup} className="rounded-lg border border-brand-border/60 bg-brand-bg/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">New Campaign Group</span>
                <button type="button" onClick={() => setShowCreate(false)} className="text-[11px] text-brand-text-muted hover:text-white">Cancel</button>
              </div>
              <input className={inputClass} placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} required />
              <input className={inputClass} placeholder="Total budget (USD, optional)" type="number" min="0" step="1" value={groupBudget} onChange={e => setGroupBudget(e.target.value)} />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <Button type="submit" variant="default" className="text-[12px] h-8" disabled={creating || !groupName}>
                {creating ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Plus size={12} className="mr-1.5" />} Create Group
              </Button>
            </form>
          ) : (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
              <Plus size={14} /> Create Campaign Group
            </button>
          )}

          <button onClick={fetchGroups} disabled={loading} className="flex items-center gap-1.5 text-[11px] text-brand-text-dim hover:text-white transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LinkedIn Creatives Section ───────────────────────────────────────────────

function LinkedInCreativesSection({ campaigns }: { campaigns: LinkedInCampaign[] }) {
  const [open, setOpen] = useState(false);
  const [creatives, setCreatives] = useState<LinkedInCreative[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creativeForm, setCreativeForm] = useState<CreateCreativeInput>({
    campaignId: '',
    type: 'TEXT_AD',
    clickUri: '',
    title: '',
    text: '',
    status: 'ACTIVE',
  });

  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCampaign
        ? `/api/integrations/linkedin-ads/creatives?campaignId=${selectedCampaign}`
        : '/api/integrations/linkedin-ads/creatives';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setCreatives(data.creatives ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [selectedCampaign]);

  useEffect(() => { if (open) fetchCreatives(); }, [open, fetchCreatives]);

  async function handleCreateCreative(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null);
    try {
      const res = await fetch('/api/integrations/linkedin-ads/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creativeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create creative');
      setShowCreate(false);
      setCreativeForm(prev => ({ ...prev, title: '', text: '', clickUri: '' }));
      fetchCreatives();
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-blue-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-brand-sidebar-hover/50 transition-colors">
        <div className="flex items-center gap-2">
          <FileSearch size={16} className="text-purple-400" />
          <span className="text-[13px] font-semibold text-white">Ad Creatives</span>
          {creatives.length > 0 && <Badge variant="info">{creatives.length}</Badge>}
        </div>
        {open ? <ChevronDown size={16} className="text-brand-text-dim" /> : <ChevronRight size={16} className="text-brand-text-dim" />}
      </button>

      {open && (
        <div className="border-t border-brand-border p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select className={`${inputClass} max-w-[260px]`} value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
              <option value="">All campaigns</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
            </select>
            <button onClick={fetchCreatives} disabled={loading} className="flex items-center gap-1.5 text-[12px] text-brand-text-dim hover:text-white transition-colors">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-purple-400" />
              <span className="ml-2 text-[13px] text-brand-text-muted">Loading creatives...</span>
            </div>
          ) : creatives.length === 0 ? (
            <p className="text-[13px] text-brand-text-muted text-center py-6">No ad creatives found. Create one to define how your ad appears on LinkedIn.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-text-muted">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 px-3 font-medium">Type</th>
                    <th className="pb-2 px-3 font-medium">Status</th>
                    <th className="pb-2 px-3 font-medium">Campaign ID</th>
                    <th className="pb-2 pl-3 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {creatives.map(cr => (
                    <tr key={cr.id} className="border-b border-brand-border/50">
                      <td className="py-2.5 pr-4 text-[13px] text-white font-medium max-w-[200px] truncate">{cr.title || cr.id}</td>
                      <td className="py-2.5 px-3 text-[12px] text-brand-text-muted">{cr.type.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3"><Badge variant={cr.status === 'ACTIVE' ? 'ok' : 'warn'}>{cr.status}</Badge></td>
                      <td className="py-2.5 px-3 text-[11px] text-brand-text-dim font-mono">{cr.campaignId}</td>
                      <td className="py-2.5 pl-3 text-[11px] text-blue-400 max-w-[160px] truncate">{cr.clickUri || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showCreate ? (
            <form onSubmit={handleCreateCreative} className="rounded-lg border border-brand-border/60 bg-brand-bg/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">New Ad Creative</span>
                <button type="button" onClick={() => setShowCreate(false)} className="text-[11px] text-brand-text-muted hover:text-white">Cancel</button>
              </div>
              <div>
                <label className={labelClass}>Campaign</label>
                <select className={inputClass} value={creativeForm.campaignId} onChange={e => setCreativeForm(p => ({ ...p, campaignId: e.target.value }))} required>
                  <option value="">Select campaign...</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Creative Type</label>
                <select className={inputClass} value={creativeForm.type} onChange={e => setCreativeForm(p => ({ ...p, type: e.target.value as any }))}>
                  <option value="TEXT_AD">Text Ad</option>
                  <option value="SPONSORED_UPDATES">Sponsored Content</option>
                  <option value="SPONSORED_INMAILS">Sponsored InMail</option>
                  <option value="SPONSORED_VIDEO">Sponsored Video</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Click URL</label>
                <input className={inputClass} placeholder="https://example.com/landing" value={creativeForm.clickUri} onChange={e => setCreativeForm(p => ({ ...p, clickUri: e.target.value }))} required />
              </div>
              {creativeForm.type === 'TEXT_AD' && (
                <>
                  <div>
                    <label className={labelClass}>Ad Title (max 25 chars)</label>
                    <input className={inputClass} placeholder="Your Ad Title" maxLength={25} value={creativeForm.title} onChange={e => setCreativeForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Ad Description (max 75 chars)</label>
                    <input className={inputClass} placeholder="Short description of your ad" maxLength={75} value={creativeForm.text} onChange={e => setCreativeForm(p => ({ ...p, text: e.target.value }))} />
                  </div>
                </>
              )}
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <Button type="submit" variant="default" className="text-[12px] h-8" disabled={creating || !creativeForm.campaignId || !creativeForm.clickUri}>
                {creating ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Plus size={12} className="mr-1.5" />} Create Creative
              </Button>
            </form>
          ) : (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-[12px] text-purple-400 hover:text-purple-300 transition-colors">
              <Plus size={14} /> Create Ad Creative
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Snapchat Create Campaign Form ────────────────────────────────────────────

function SnapchatCreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateSnapchatCampaignInput>({
    name: '',
    objective: 'DRIVE_WEBSITE_TRAFFIC',
    status: 'PAUSED',
  });

  const [dailyBudgetDollars, setDailyBudgetDollars] = useState('');

  function updateField<K extends keyof CreateSnapchatCampaignInput>(key: K, value: CreateSnapchatCampaignInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null); setSuccess(false);
    try {
      const payload: CreateSnapchatCampaignInput = { ...form };
      if (dailyBudgetDollars) {
        payload.daily_budget_micro = Math.round(parseFloat(dailyBudgetDollars) * 1_000_000);
      }

      const res = await fetch('/api/integrations/snapchat-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setSuccess(true);
      setForm(prev => ({ ...prev, name: '' }));
      setDailyBudgetDollars('');
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-brand-border px-4 py-3 text-[13px] text-brand-text-muted hover:border-yellow-500/40 hover:text-yellow-400 transition-colors w-full">
        <Plus size={16} /> Create a new Snapchat campaign via API
      </button>
    );
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-yellow-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Create Snapchat Campaign</h3>
        <button onClick={() => setOpen(false)} className="text-[12px] text-brand-text-muted hover:text-white transition-colors">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Summer Sale – Snap Audience" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Objective</label>
          <select className={inputClass} value={form.objective} onChange={e => updateField('objective', e.target.value as any)}>
            <option value="BRAND_AWARENESS">Brand Awareness</option>
            <option value="DRIVE_WEBSITE_TRAFFIC">Drive Website Traffic</option>
            <option value="APP_INSTALL">App Install</option>
            <option value="APP_ENGAGEMENT">App Engagement</option>
            <option value="ENGAGE_CONSUMER">Engage Consumer</option>
            <option value="LEAD_GENERATION">Lead Generation</option>
            <option value="CATALOG_SALES">Catalog Sales</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Initial Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateField('status', e.target.value as any)}>
            <option value="PAUSED">Paused (recommended)</option>
            <option value="ACTIVE">Active</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Daily Budget (USD, optional)</label>
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 50.00" value={dailyBudgetDollars} onChange={e => setDailyBudgetDollars(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Start Time (optional)</label>
          <input className={inputClass} type="datetime-local" value={form.start_time ? form.start_time.slice(0, 16) : ''} onChange={e => updateField('start_time', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── Pinterest Create Campaign Form ───────────────────────────────────────────

function PinterestCreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<{
    name: string;
    objective_type: 'AWARENESS' | 'CONSIDERATION' | 'VIDEO_VIEW' | 'WEB_CONVERSION' | 'CATALOG_SALES' | 'WEB_SESSIONS';
    status: 'ACTIVE' | 'PAUSED';
  }>({
    name: '',
    objective_type: 'AWARENESS',
    status: 'PAUSED',
  });
  const [dailyBudgetDollars, setDailyBudgetDollars] = useState('');
  const [lifetimeBudgetDollars, setLifetimeBudgetDollars] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess(false);
    try {
      const payload: any = { ...form };
      if (dailyBudgetDollars) payload.daily_spend_cap = Math.round(parseFloat(dailyBudgetDollars) * 1_000_000);
      if (lifetimeBudgetDollars) payload.lifetime_spend_cap = Math.round(parseFloat(lifetimeBudgetDollars) * 1_000_000);
      const res = await fetch('/api/integrations/pinterest-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create campaign');
      }
      setSuccess(true);
      setForm({ name: '', objective_type: 'AWARENESS', status: 'PAUSED' });
      setDailyBudgetDollars('');
      setLifetimeBudgetDollars('');
      onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const inputClass = 'w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-[13px] text-white placeholder-brand-text-dim focus:border-red-500/50 focus:outline-none transition-colors';
  const labelClass = 'text-[11px] uppercase tracking-wider text-brand-text-muted font-medium mb-1.5 block';

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
      <h3 className="text-[14px] font-semibold text-white mb-4">Create Pinterest Campaign</h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Campaign Name</label>
          <input className={inputClass} placeholder="e.g. Spring Awareness – Pinterest" value={form.name} onChange={e => updateField('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Objective</label>
          <select className={inputClass} value={form.objective_type} onChange={e => updateField('objective_type', e.target.value as any)}>
            <option value="AWARENESS">Awareness</option>
            <option value="CONSIDERATION">Consideration</option>
            <option value="VIDEO_VIEW">Video View</option>
            <option value="WEB_CONVERSION">Web Conversion</option>
            <option value="CATALOG_SALES">Catalog Sales</option>
            <option value="WEB_SESSIONS">Web Sessions</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Initial Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateField('status', e.target.value as any)}>
            <option value="PAUSED">Paused (recommended)</option>
            <option value="ACTIVE">Active</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Daily Budget (USD, optional)</label>
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 20.00" value={dailyBudgetDollars} onChange={e => setDailyBudgetDollars(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Lifetime Budget (USD, optional)</label>
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="e.g. 500.00" value={lifetimeBudgetDollars} onChange={e => setLifetimeBudgetDollars(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <Button type="submit" variant="default" className="text-[12px] h-9 px-5" disabled={creating || !form.name}>
            {creating ? <><Loader2 size={14} className="animate-spin mr-2" /> Creating...</> : <><Plus size={14} className="mr-1.5" /> Create Campaign</>}
          </Button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
          {success && <span className="text-[12px] text-emerald-400">Campaign created successfully!</span>}
        </div>
      </form>
    </div>
  );
}
