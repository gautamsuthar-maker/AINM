import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/amazon-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { profileId, profileName, countryCode, currencyCode, accountType } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      profile_id: String(profileId),
      profile_name: profileName || undefined,
      country_code: countryCode || undefined,
      currency_code: currencyCode || undefined,
      account_type: accountType || undefined,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, profileId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
