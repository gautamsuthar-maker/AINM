import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/microsoft-ads/token-store';
import type { MicrosoftAdsConnectionStatus } from '@/lib/microsoft-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.access_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies MicrosoftAdsConnectionStatus);
    }

    if (!tokens.account_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies MicrosoftAdsConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      accountId: tokens.account_id,
      accountName: tokens.account_name,
      customerId: tokens.customer_id,
      connectedAt: tokens.connected_at,
    } satisfies MicrosoftAdsConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies MicrosoftAdsConnectionStatus,
      { status: 500 }
    );
  }
}
