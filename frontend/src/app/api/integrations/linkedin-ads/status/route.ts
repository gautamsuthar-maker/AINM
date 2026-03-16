import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/linkedin-ads/token-store';
import type { LinkedInConnectionStatus } from '@/lib/linkedin-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.access_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies LinkedInConnectionStatus);
    }

    if (!tokens.account_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies LinkedInConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      accountId: tokens.account_id,
      accountName: tokens.account_name,
      connectedAt: tokens.connected_at,
    } satisfies LinkedInConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies LinkedInConnectionStatus,
      { status: 500 }
    );
  }
}
