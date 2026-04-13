import { NextResponse } from 'next/server';
import { listAdvertisers } from '@/lib/flipkart-ads/client';

export async function GET() {
  try {
    const advertisers = await listAdvertisers();
    return NextResponse.json({ advertisers });
  } catch (error: any) {
    console.error('Failed to fetch Flipkart Ads advertisers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch advertisers' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
