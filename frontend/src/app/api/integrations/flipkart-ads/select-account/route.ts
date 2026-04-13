import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/flipkart-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { advertiserId, advertiserName } = await request.json();

    if (!advertiserId) {
      return NextResponse.json({ error: 'advertiserId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      advertiser_id: String(advertiserId),
      advertiser_name: advertiserName || undefined,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, advertiserId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
