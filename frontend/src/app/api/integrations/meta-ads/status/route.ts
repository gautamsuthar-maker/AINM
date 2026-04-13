import { NextResponse } from 'next/server';
import { getStoredTokens, isTokenExpired } from '@/lib/meta-ads/token-store';
import type { MetaAdsConnectionStatus } from '@/lib/meta-ads/types';

export async function GET() {
  const tokens = getStoredTokens();

  if (!tokens?.access_token) {
    return NextResponse.json<MetaAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (isTokenExpired(tokens)) {
    return NextResponse.json<MetaAdsConnectionStatus>({ connected: false, step: 'disconnected' });
  }

  if (!tokens.ad_account_id) {
    return NextResponse.json<MetaAdsConnectionStatus>({ connected: false, step: 'authenticated' });
  }

  return NextResponse.json<MetaAdsConnectionStatus>({
    connected: true,
    step: 'connected',
    adAccountId: tokens.ad_account_id,
    adAccountName: tokens.ad_account_name,
    connectedAt: tokens.connected_at,
  });
}
