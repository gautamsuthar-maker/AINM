import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/snapchat-ads/oauth';

export async function GET() {
  try {
    if (!process.env.SNAPCHAT_CLIENT_ID || !process.env.SNAPCHAT_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing SNAPCHAT_CLIENT_ID or SNAPCHAT_CLIENT_SECRET' },
        { status: 500 }
      );
    }
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
