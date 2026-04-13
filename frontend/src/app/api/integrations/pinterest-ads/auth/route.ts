import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/pinterest-ads/oauth';

export async function GET() {
  try {
    if (!process.env.PINTEREST_ADS_CLIENT_ID || !process.env.PINTEREST_ADS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing PINTEREST_ADS_CLIENT_ID or PINTEREST_ADS_CLIENT_SECRET' },
        { status: 500 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
