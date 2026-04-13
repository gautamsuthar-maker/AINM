import { getStoredTokens, storeTokens, isTokenExpired } from './token-store';
import { refreshAccessToken } from './oauth';
import type { MicrosoftAdsAccount, MicrosoftAdsCampaign, CreateMicrosoftAdsCampaignInput } from './types';

const CUSTOMER_MGMT_BASE =
  'https://clientcenter.api.bingads.microsoft.com/Api/CustomerManagement/v13/CustomerManagementService.svc/json';
const CAMPAIGN_MGMT_BASE =
  'https://campaign.api.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/CampaignManagementService.svc/json';

// ─── Core HTTP ────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) throw new Error('Not connected to Microsoft Ads. Complete OAuth first.');

  if (isTokenExpired(tokens) && tokens.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    storeTokens({
      ...tokens,
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
      expires_in: refreshed.expires_in,
      token_acquired_at: Date.now(),
    });
    return refreshed.access_token;
  }

  return tokens.access_token;
}

async function msAdsPost(
  baseUrl: string,
  operation: string,
  body: object,
  extraHeaders: Record<string, string> = {}
): Promise<any> {
  const token = await getAccessToken();
  const devToken = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
  if (!devToken) throw new Error('Missing MICROSOFT_ADS_DEVELOPER_TOKEN');

  const res = await fetch(`${baseUrl}/${operation}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
      DeveloperToken: devToken,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Microsoft Ads API ${res.status} [${operation}]: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function getAccountId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.account_id) throw new Error('No Microsoft Ads account selected.');
  return tokens.account_id;
}

function getCustomerId(): string {
  const tokens = getStoredTokens();
  if (!tokens?.customer_id) throw new Error('No Microsoft Ads customer ID stored.');
  return tokens.customer_id;
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function listAdAccounts(): Promise<MicrosoftAdsAccount[]> {
  // Get current user to retrieve their customer ID
  const userResp = await msAdsPost(CUSTOMER_MGMT_BASE, 'GetUser', { UserId: null });
  const user = userResp.User;
  if (!user) return [];

  const customerId = String(user.CustomerId ?? '');
  if (!customerId) return [];

  // Get all accounts under that customer
  const accountsResp = await msAdsPost(
    CUSTOMER_MGMT_BASE,
    'GetAccountsInfo',
    { CustomerId: Number(customerId) },
    { CustomerId: customerId }
  );

  const accountsInfo: any[] = accountsResp.AccountsInfo ?? [];
  return accountsInfo.map((a: any) => ({
    id: String(a.Id),
    name: a.Name ?? `Account ${a.Id}`,
    number: a.Number ?? '',
    status: a.AccountLifeCycleStatus ?? 'Unknown',
    customer_id: customerId,
  }));
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<MicrosoftAdsCampaign[]> {
  const accountId = getAccountId();
  const customerId = getCustomerId();

  const data = await msAdsPost(
    CAMPAIGN_MGMT_BASE,
    'GetCampaignsByAccountId',
    {
      AccountId: Number(accountId),
      CampaignType: 'Search Shopping DynamicSearchAds Audience',
    },
    {
      CustomerId: customerId,
      CustomerAccountId: accountId,
    }
  );

  const campaigns: any[] = data.Campaigns ?? [];
  return campaigns.map((c: any) => ({
    id: String(c.Id),
    name: c.Name ?? `Campaign ${c.Id}`,
    status: c.Status ?? 'Unknown',
    type: c.CampaignType ?? 'Search',
    daily_budget: c.DailyBudget ?? undefined,
    budget_type: c.BudgetType ?? undefined,
    metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 },
  }));
}

export async function createCampaign(input: CreateMicrosoftAdsCampaignInput) {
  const accountId = getAccountId();
  const customerId = getCustomerId();

  const result = await msAdsPost(
    CAMPAIGN_MGMT_BASE,
    'AddCampaigns',
    {
      AccountId: Number(accountId),
      Campaigns: [
        {
          BudgetType: 'DailyBudgetStandard',
          DailyBudget: input.daily_budget,
          Languages: ['All'],
          Name: input.name,
          Status: input.status ?? 'Paused',
          TimeZone: input.time_zone ?? 'PacificTimeUSCanadaTijuana',
          CampaignType: input.type,
        },
      ],
    },
    {
      CustomerId: customerId,
      CustomerAccountId: accountId,
    }
  );

  const campaignId = result.CampaignIds?.[0];
  return { success: true, campaignId: campaignId ? String(campaignId) : null };
}
