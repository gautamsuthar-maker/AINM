import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/google-ads/token-store';
import type { ConnectionStatus } from '@/lib/google-ads/types';

export async function GET() {
  try {
    const tokens = getStoredTokens();

    if (!tokens?.refresh_token) {
      return NextResponse.json({ connected: false, step: 'disconnected' } satisfies ConnectionStatus);
    }

    if (!tokens.customer_id) {
      return NextResponse.json({
        connected: false,
        step: 'authenticated',
        connectedAt: tokens.connected_at,
      } satisfies ConnectionStatus);
    }

    return NextResponse.json({
      connected: true,
      step: 'connected',
      customerId: tokens.customer_id,
      accountName: tokens.account_name,
      connectedAt: tokens.connected_at,
    } satisfies ConnectionStatus);
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, step: 'disconnected', error: error.message } satisfies ConnectionStatus,
      { status: 500 }
    );
  }
}
