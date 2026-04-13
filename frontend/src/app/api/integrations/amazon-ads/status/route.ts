import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/amazon-ads/token-store';
import type { AmazonAdsConnectionStatus } from '@/lib/amazon-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.access_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies AmazonAdsConnectionStatus);
    }

    if (!tokens.profile_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies AmazonAdsConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      profileId: tokens.profile_id,
      profileName: tokens.profile_name,
      countryCode: tokens.country_code,
      connectedAt: tokens.connected_at,
    } satisfies AmazonAdsConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies AmazonAdsConnectionStatus,
      { status: 500 }
    );
  }
}
