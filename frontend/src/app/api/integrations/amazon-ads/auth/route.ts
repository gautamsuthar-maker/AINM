import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/amazon-ads/oauth';

export async function GET() {
  try {
    if (!process.env.AMAZON_ADS_CLIENT_ID || !process.env.AMAZON_ADS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing AMAZON_ADS_CLIENT_ID or AMAZON_ADS_CLIENT_SECRET' },
        { status: 500 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
