import { NextResponse } from 'next/server';
import { listAdAccounts } from '@/lib/meta-ads/client';

export async function GET() {
  try {
    const accounts = await listAdAccounts();
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to fetch Meta Ads ad accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ad accounts' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
