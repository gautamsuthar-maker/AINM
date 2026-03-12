'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'partial' | 'disconnected';
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
  status: ConnectionStatus;
  lastSync?: string;
  accountId?: string;
  capabilityGroups: CapabilityGroup[];
  docsUrl: string;
  authType: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const platforms: Platform[] = [
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
          {
            name: 'Create & manage campaigns',
            description: 'Full CRUD on Search, Display, Shopping, Video, App, Demand Gen, and Performance Max campaigns.',
            status: 'available',
            endpoints: ['CampaignService.MutateCampaigns', 'CampaignService.GetCampaign'],
          },
          {
            name: 'Ad group management',
            description: 'Create, pause, or remove ad groups within campaigns.',
            status: 'available',
            endpoints: ['AdGroupService.MutateAdGroups'],
          },
          {
            name: 'Ad creation & variants',
            description: 'Responsive search ads, display ads, shopping ads, video ads, and dynamic search ads.',
            status: 'available',
            endpoints: ['AdGroupAdService.MutateAdGroupAds'],
          },
          {
            name: 'Performance Max campaigns',
            description: 'Cross-channel campaigns across Search, Display, YouTube, Gmail, Maps.',
            status: 'available',
            endpoints: ['CampaignService', 'AssetGroupService', 'AssetGroupAssetService'],
          },
          {
            name: 'Campaign Drafts & Experiments',
            description: 'A/B test campaign settings or targeting with experiment arms.',
            status: 'available',
            endpoints: ['ExperimentService', 'ExperimentArmService'],
          },
        ],
      },
      {
        group: 'Bidding & Budget',
        icon: DollarSign,
        capabilities: [
          {
            name: 'Smart Bidding strategies',
            description: 'Maximize Conversions, Target CPA, Target ROAS, Enhanced CPC, Maximize Conversion Value.',
            status: 'available',
            endpoints: ['BiddingStrategyService.MutateBiddingStrategies'],
          },
          {
            name: 'Portfolio bidding',
            description: 'Cross-campaign shared bidding strategies.',
            status: 'available',
            endpoints: ['BiddingStrategyService'],
          },
          {
            name: 'Manual bid management',
            description: 'Keyword-level, ad group-level, and placement-level bid adjustments.',
            status: 'available',
            endpoints: ['AdGroupCriterionService', 'CampaignBidModifierService'],
          },
          {
            name: 'Budget creation & sharing',
            description: 'Create, assign, share budgets across campaigns.',
            status: 'available',
            endpoints: ['CampaignBudgetService.MutateCampaignBudgets'],
          },
          {
            name: 'Seasonality adjustments',
            description: 'Temporary conversion rate adjustments for known high/low traffic events.',
            status: 'available',
            endpoints: ['BiddingSeasonalityAdjustmentService'],
          },
          {
            name: 'Bid simulations',
            description: 'Forecast performance impact of different bid values.',
            status: 'available',
            endpoints: ['AdGroupBidSimulationService', 'KeywordPlanService'],
          },
        ],
      },
      {
        group: 'Reporting & Analytics',
        icon: BarChart2,
        capabilities: [
          {
            name: 'GAQL custom reporting',
            description: 'SQL-like query language to fetch any metric/dimension combination across all resources.',
            status: 'available',
            endpoints: ['GoogleAdsService.Search', 'GoogleAdsService.SearchStream'],
          },
          {
            name: 'Performance metrics',
            description: 'Impressions, clicks, CTR, CPC, conversions, ROAS, quality score, view-through conversions.',
            status: 'available',
            endpoints: ['GoogleAdsService.Search'],
          },
          {
            name: 'Segmented reporting',
            description: 'Segment by device, network, date, ad schedule, click type, conversion action, and more.',
            status: 'available',
            endpoints: ['GoogleAdsService.Search'],
          },
          {
            name: 'Reach forecasting',
            description: 'Forecast impressions, views, CPM for video/display campaigns.',
            status: 'available',
            endpoints: ['ReachPlanService.GenerateReachForecast'],
          },
          {
            name: 'Keyword forecast metrics',
            description: 'Historical and forecast performance data for keyword planning.',
            status: 'available',
            endpoints: ['KeywordPlanService.GenerateForecastMetrics'],
          },
        ],
      },
      {
        group: 'Audience Management',
        icon: Users,
        capabilities: [
          {
            name: 'Customer Match',
            description: 'Upload hashed email/phone lists to target existing customers.',
            status: 'available',
            endpoints: ['UserListService.MutateUserLists', 'OfflineUserDataJobService'],
          },
          {
            name: 'Remarketing lists (RLSA)',
            description: 'Create and manage website visitor remarketing audiences.',
            status: 'available',
            endpoints: ['UserListService'],
          },
          {
            name: 'Lookalike segments',
            description: 'Automatically generated audiences similar to your customer lists.',
            status: 'available',
            endpoints: ['UserListService'],
          },
          {
            name: 'Custom audiences',
            description: 'Audiences based on interests, search behavior, app usage.',
            status: 'available',
            endpoints: ['CustomAudienceService'],
          },
          {
            name: 'Audience insights',
            description: 'Demographic and interest breakdown of your audiences.',
            status: 'available',
            endpoints: ['AudienceInsightsService'],
          },
        ],
      },
      {
        group: 'Conversion Tracking',
        icon: Target,
        capabilities: [
          {
            name: 'Conversion action management',
            description: 'Create and configure online conversion actions (web, app, calls).',
            status: 'available',
            endpoints: ['ConversionActionService.MutateConversionActions'],
          },
          {
            name: 'Offline conversion import',
            description: 'Upload CRM-matched conversions with click IDs (GCLID).',
            status: 'available',
            endpoints: ['OfflineUserDataJobService', 'ConversionUploadService'],
          },
          {
            name: 'Enhanced conversions (web)',
            description: 'Improve conversion measurement by sending hashed first-party customer data.',
            status: 'available',
            endpoints: ['ConversionUploadService.UploadClickConversions'],
          },
          {
            name: 'Enhanced conversions (leads)',
            description: 'Match form leads to conversions using email/phone hashes.',
            status: 'available',
            endpoints: ['ConversionUploadService'],
          },
          {
            name: 'Store sales conversions',
            description: 'Measure in-store purchases driven by ads.',
            status: 'available',
            endpoints: ['OfflineUserDataJobService'],
          },
          {
            name: 'Conversion value rules',
            description: 'Adjust conversion values based on audience, location, or device.',
            status: 'available',
            endpoints: ['ConversionValueRuleService', 'ConversionValueRuleSetService'],
          },
        ],
      },
      {
        group: 'Assets & Creative',
        icon: FileSearch,
        capabilities: [
          {
            name: 'Asset library management',
            description: 'Upload, link, and manage image, text, video, call, and location assets.',
            status: 'available',
            endpoints: ['AssetService.MutateAssets'],
          },
          {
            name: 'Video upload',
            description: 'Upload video assets directly via the API.',
            status: 'available',
            endpoints: ['AssetService'],
          },
          {
            name: 'Asset group setup (PMax)',
            description: 'Manage asset groups and listing groups for Performance Max.',
            status: 'available',
            endpoints: ['AssetGroupService', 'AssetGroupAssetService', 'AssetGroupListingGroupFilterService'],
          },
          {
            name: 'Asset performance reporting',
            description: 'Performance metrics per asset across all campaigns.',
            status: 'available',
            endpoints: ['GoogleAdsService.Search (asset_field_type_view)'],
          },
          {
            name: 'AI asset generation',
            description: 'Generate ad creatives using Google AI (closed beta).',
            status: 'beta',
            endpoints: ['AssetGenerationService'],
          },
        ],
      },
      {
        group: 'Keyword & SEO',
        icon: BrainCircuit,
        capabilities: [
          {
            name: 'Keyword planning',
            description: 'Generate keyword ideas from seed keywords or URLs.',
            status: 'available',
            endpoints: ['KeywordPlanIdeaService.GenerateKeywordIdeas'],
          },
          {
            name: 'Ad group theme generation',
            description: 'AI-suggested ad group themes from a set of seed keywords.',
            status: 'available',
            endpoints: ['KeywordPlanIdeaService.GenerateAdGroupThemes'],
          },
          {
            name: 'Keyword criteria management',
            description: 'Add, pause, remove keywords; set match types and bids.',
            status: 'available',
            endpoints: ['AdGroupCriterionService.MutateAdGroupCriteria'],
          },
          {
            name: 'Search term reports',
            description: 'Actual search queries that triggered your ads.',
            status: 'available',
            endpoints: ['GoogleAdsService.Search (search_term_view)'],
          },
        ],
      },
      {
        group: 'Account & Access',
        icon: Lock,
        capabilities: [
          {
            name: 'Multi-account (MCC) management',
            description: 'Manage hundreds of accounts from a single manager account.',
            status: 'available',
            endpoints: ['CustomerService.ListAccessibleCustomers', 'GoogleAdsService'],
          },
          {
            name: 'Account creation',
            description: 'Programmatically create new sub-accounts under a manager.',
            status: 'available',
            endpoints: ['CustomerService.CreateCustomerClient'],
          },
          {
            name: 'User access management',
            description: 'Invite users and manage access levels per account.',
            status: 'available',
            endpoints: ['CustomerUserAccessService', 'CustomerUserAccessInvitationService'],
          },
          {
            name: 'Change history',
            description: 'Full audit log of all changes made to campaigns, ads, bids.',
            status: 'available',
            endpoints: ['ChangeStatusService', 'ChangeEventService'],
          },
          {
            name: 'Billing & invoices',
            description: 'Manage billing setups, account budgets, and retrieve invoices.',
            status: 'available',
            endpoints: ['BillingSetupService', 'AccountBudgetService', 'InvoiceService'],
          },
        ],
      },
      {
        group: 'Shopping & Retail',
        icon: ShoppingCart,
        capabilities: [
          {
            name: 'Shopping campaigns',
            description: 'Create and manage Shopping campaigns linked to Merchant Center.',
            status: 'available',
            endpoints: ['CampaignService', 'ProductGroupViewService'],
          },
          {
            name: 'Listing group filters',
            description: 'Segment product inventory for bid control within Shopping/PMax.',
            status: 'available',
            endpoints: ['AssetGroupListingGroupFilterService'],
          },
          {
            name: 'Merchant Center link',
            description: 'Link Merchant Center accounts for product feed access.',
            status: 'available',
            endpoints: ['MerchantCenterLinkService'],
          },
          {
            name: 'Retail Performance Max',
            description: 'Shopping-feed-driven Performance Max campaigns.',
            status: 'available',
            endpoints: ['CampaignService', 'ShoppingProductService'],
          },
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

// ─── Helper Components ────────────────────────────────────────────────────────

const statusConfig: Record<ConnectionStatus, { label: string; badgeVariant: 'ok' | 'warn' | 'danger' | 'default'; dot: string }> = {
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

function PlatformCard({
  platform,
  isActive,
  onClick,
}: {
  platform: Platform;
  isActive: boolean;
  onClick: () => void;
}) {
  const sc = statusConfig[platform.status];
  const totalCaps = platform.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
  const availableCaps = platform.capabilityGroups.reduce(
    (a, g) => a + g.capabilities.filter(c => c.status === 'available').length,
    0
  );
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
        isActive
          ? 'border-blue-500/60 bg-blue-500/5'
          : 'border-brand-border bg-brand-card hover:border-brand-border-hover hover:bg-brand-sidebar-hover'
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'platform';

export default function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [activePlatformId, setActivePlatformId] = useState<string>('google-ads');

  const activePlatform = platforms.find(p => p.id === activePlatformId)!;
  const totalCaps = platforms.reduce((a, p) => a + p.capabilityGroups.reduce((b, g) => b + g.capabilities.length, 0), 0);
  const totalAvailable = platforms.reduce(
    (a, p) => a + p.capabilityGroups.reduce((b, g) => b + g.capabilities.filter(c => c.status === 'available').length, 0),
    0
  );

  const activePlatformTotalCaps = activePlatform.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
  const activePlatformAvailableCaps = activePlatform.capabilityGroups.reduce(
    (a, g) => a + g.capabilities.filter(c => c.status === 'available').length,
    0
  );

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
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${
              tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Supported Ad Platforms</h2>
            <Button variant="default" className="flex items-center gap-1.5 text-[12px] h-8">
              <Plus size={13} />
              Request Platform
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {platforms.map(p => {
              const sc = statusConfig[p.status];
              const groupCount = p.capabilityGroups.length;
              const caps = p.capabilityGroups.reduce((a, g) => a + g.capabilities.filter(c => c.status === 'available').length, 0);
              const totalC = p.capabilityGroups.reduce((a, g) => a + g.capabilities.length, 0);
              return (
                <div key={p.id} className="rounded-xl border border-brand-border bg-brand-card p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformLogo platform={p} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-white">{p.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        <span className="text-[11px] text-brand-text-muted">{sc.label}</span>
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
                        onClick={() => { setActivePlatformId(p.id); setTab('platform'); }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Info size={12} /> Explore
                      </button>
                      <a
                        href={p.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-brand-text-muted hover:text-brand-text flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Docs
                      </a>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="w-full text-[12px] h-8 mt-1"
                    disabled={p.status === 'connected'}
                  >
                    {p.status === 'connected' ? (
                      <><RefreshCw size={12} className="mr-1.5" /> Re-sync</>
                    ) : (
                      <><Plus size={12} className="mr-1.5" /> Connect</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Integration architecture note */}
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
          {/* Platform Selector */}
          <div className="w-[200px] shrink-0 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-wider text-brand-text-dim font-medium mb-1 px-1">Select Platform</div>
            {platforms.map(p => (
              <PlatformCard
                key={p.id}
                platform={p}
                isActive={p.id === activePlatformId}
                onClick={() => setActivePlatformId(p.id)}
              />
            ))}
          </div>

          {/* Capability Detail Panel */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-brand-border bg-brand-card p-5">
              {/* Platform Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <PlatformLogo platform={activePlatform} />
                  <div>
                    <div className="text-[16px] font-bold text-white">{activePlatform.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusConfig[activePlatform.status].badgeVariant}>
                        {statusConfig[activePlatform.status].label}
                      </Badge>
                      <span className="text-[11px] text-brand-text-muted">{activePlatform.authType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[20px] font-bold text-white">{activePlatformAvailableCaps}</div>
                    <div className="text-[10px] text-brand-text-dim">of {activePlatformTotalCaps} available</div>
                  </div>
                  <a
                    href={activePlatform.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-[11px] text-brand-text-muted hover:text-brand-text hover:border-brand-border-hover transition-colors"
                  >
                    <ExternalLink size={12} />
                    API Docs
                  </a>
                  <Button variant="default" className="text-[12px] h-8">
                    <Plus size={12} className="mr-1.5" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Legend */}
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

              {/* Capability Groups */}
              <div className="flex flex-col gap-1">
                {activePlatform.capabilityGroups.map(group => (
                  <CapabilityGroupSection key={group.group} group={group} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
