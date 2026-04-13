import { NextResponse } from 'next/server';
import { getStoredTokens, isTokenExpired } from '@/lib/apple-search-ads/token-store';
import type { AppleSearchAdsConnectionStatus } from '@/lib/apple-search-ads/types';

export async function GET() {
  const tokens = getStoredTokens();

  if (!tokens?.access_token) {
    return NextResponse.json<AppleSearchAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (isTokenExpired(tokens)) {
    return NextResponse.json<AppleSearchAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (!tokens.org_id) {
    return NextResponse.json<AppleSearchAdsConnectionStatus>({ connected: false, step: 'authenticated' });
  }

  return NextResponse.json<AppleSearchAdsConnectionStatus>({
    connected: true,
    step: 'connected',
    orgId: tokens.org_id,
    orgName: tokens.org_name,
    connectedAt: tokens.connected_at,
  });
}
