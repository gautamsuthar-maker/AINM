import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/tiktok-ads/oauth';

export async function GET() {
  try {
    if (!process.env.TIKTOK_ADS_APP_ID || !process.env.TIKTOK_ADS_SECRET) {
      return NextResponse.json(
        { error: 'Missing TIKTOK_ADS_APP_ID or TIKTOK_ADS_SECRET' },
        { status: 500 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
