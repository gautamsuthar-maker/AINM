import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/reddit-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { adAccountId, adAccountName } = await request.json();

    if (!adAccountId) {
      return NextResponse.json({ error: 'adAccountId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      ad_account_id: String(adAccountId),
      ad_account_name: adAccountName || undefined,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, adAccountId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
