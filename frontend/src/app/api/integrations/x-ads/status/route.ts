import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/x-ads/token-store';
import type { XAdsConnectionStatus } from '@/lib/x-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.access_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies XAdsConnectionStatus);
    }

    if (!tokens.ad_account_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies XAdsConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      adAccountId: tokens.ad_account_id,
      adAccountName: tokens.ad_account_name,
      connectedAt: tokens.connected_at,
    } satisfies XAdsConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies XAdsConnectionStatus,
      { status: 500 }
    );
  }
}
