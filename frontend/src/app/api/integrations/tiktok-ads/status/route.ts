import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/tiktok-ads/token-store';
import type { TikTokConnectionStatus } from '@/lib/tiktok-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.access_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies TikTokConnectionStatus);
    }

    if (!tokens.advertiser_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies TikTokConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      advertiserId: tokens.advertiser_id,
      advertiserName: tokens.advertiser_name,
      connectedAt: tokens.connected_at,
    } satisfies TikTokConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies TikTokConnectionStatus,
      { status: 500 }
    );
  }
}
