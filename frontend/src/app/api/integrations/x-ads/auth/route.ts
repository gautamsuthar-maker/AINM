import { NextResponse } from 'next/server';
import { getAuthUrl, generateCodeVerifier } from '@/lib/x-ads/oauth';
import { setPendingCodeVerifier } from '@/lib/x-ads/token-store';

export async function GET() {
  try {
    if (!process.env.X_ADS_CLIENT_ID || !process.env.X_ADS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing X_ADS_CLIENT_ID or X_ADS_CLIENT_SECRET' },
        { status: 500 }
      );
    }
    const codeVerifier = generateCodeVerifier();
    setPendingCodeVerifier(codeVerifier);
    const url = getAuthUrl('x_oauth', codeVerifier);
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
