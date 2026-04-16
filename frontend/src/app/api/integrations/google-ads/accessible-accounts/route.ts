import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/google-ads/token-store';
import { getOAuth2Client } from '@/lib/google-ads/oauth';
import { getGoogleAdsApi } from '@/lib/google-ads/client';
import type { GoogleAdsAccount } from '@/lib/google-ads/types';

const ADS_API_VERSION = 'v20';

export async function GET() {
  try {
    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) {
      return NextResponse.json({ error: 'Not authenticated. Complete OAuth first.' }, { status: 401 });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
    const { token: accessToken } = await oauth2Client.getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 });
    }

    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      return NextResponse.json({ error: 'Missing GOOGLE_ADS_DEVELOPER_TOKEN' }, { status: 500 });
    }

    const listRes = await fetch(
      `https://googleads.googleapis.com/${ADS_API_VERSION}/customers:listAccessibleCustomers`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );

    if (!listRes.ok) {
      const errBody = await listRes.text();
      console.error('ListAccessibleCustomers failed:', listRes.status, errBody);
      return NextResponse.json({ error: `Google API error: ${listRes.status}` }, { status: 502 });
    }

    const listData = await listRes.json();
    const customerResourceNames: string[] = listData.resourceNames ?? [];
    const customerIds = customerResourceNames.map((rn: string) => rn.replace('customers/', ''));

    const api = getGoogleAdsApi();
    const accounts: GoogleAdsAccount[] = [];

    for (const customerId of customerIds.slice(0, 20)) {
      try {
        const customer = api.Customer({
          customer_id: customerId,
          refresh_token: tokens.refresh_token,
          login_customer_id: tokens.login_customer_id,
        });

        const rows = await customer.query(`
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.manager
          FROM customer
          LIMIT 1
        `);

        if (rows.length > 0) {
          const row: Record<string, any> = rows[0];
          accounts.push({
            customerId: String(row.customer?.id ?? customerId),
            descriptiveName: String(row.customer?.descriptive_name ?? `Account ${customerId}`),
            currencyCode: String(row.customer?.currency_code ?? ''),
            timeZone: String(row.customer?.time_zone ?? ''),
            manager: Boolean(row.customer?.manager),
          });
        }
      } catch {
        // Skip accounts that are inaccessible (disabled, deactivated, or not yet enabled)
      }
    }

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to list accessible accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list accessible accounts' },
      { status: 500 }
    );
  }
}
