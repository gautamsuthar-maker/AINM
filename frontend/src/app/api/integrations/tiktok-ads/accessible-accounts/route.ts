import { NextResponse } from 'next/server';
import { listAdvertisers } from '@/lib/tiktok-ads/client';

export async function GET() {
  try {
    const accounts = await listAdvertisers();
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to list TikTok advertisers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list advertiser accounts' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
