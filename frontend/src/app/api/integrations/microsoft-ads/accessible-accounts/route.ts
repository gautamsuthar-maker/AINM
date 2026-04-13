import { NextResponse } from 'next/server';
import { listAdAccounts } from '@/lib/microsoft-ads/client';

export async function GET() {
  try {
    const accounts = await listAdAccounts();
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to list Microsoft Ads accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list ad accounts' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
