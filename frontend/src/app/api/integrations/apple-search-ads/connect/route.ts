import { NextResponse } from 'next/server';
import { connectAndGetToken } from '@/lib/apple-search-ads/oauth';
import { storeTokens, getStoredTokens } from '@/lib/apple-search-ads/token-store';

export async function POST() {
  try {
    const tokenData = await connectAndGetToken();

    const existing = getStoredTokens();
    storeTokens({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      token_acquired_at: Date.now(),
      org_id: existing?.org_id,
      org_name: existing?.org_name,
      connected_at: existing?.connected_at,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Apple Search Ads connect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
