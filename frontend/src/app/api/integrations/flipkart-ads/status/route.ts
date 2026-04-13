import { NextResponse } from 'next/server';
import { getStoredTokens, isTokenExpired } from '@/lib/flipkart-ads/token-store';
import type { FlipkartAdsConnectionStatus } from '@/lib/flipkart-ads/types';

export async function GET() {
  const tokens = getStoredTokens();

  if (!tokens?.access_token) {
    return NextResponse.json<FlipkartAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (isTokenExpired(tokens) && !tokens.refresh_token) {
    return NextResponse.json<FlipkartAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (!tokens.advertiser_id) {
    return NextResponse.json<FlipkartAdsConnectionStatus>({ connected: false, step: 'authenticated' });
  }

  return NextResponse.json<FlipkartAdsConnectionStatus>({
    connected: true,
    step: 'connected',
    advertiserId: tokens.advertiser_id,
    advertiserName: tokens.advertiser_name,
    connectedAt: tokens.connected_at,
  });
}
