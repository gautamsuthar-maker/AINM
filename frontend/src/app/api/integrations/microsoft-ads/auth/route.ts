import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/microsoft-ads/oauth';

export async function GET() {
  try {
    if (!process.env.MICROSOFT_ADS_CLIENT_ID || !process.env.MICROSOFT_ADS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing MICROSOFT_ADS_CLIENT_ID or MICROSOFT_ADS_CLIENT_SECRET' },
        { status: 500 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
