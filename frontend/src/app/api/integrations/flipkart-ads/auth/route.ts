import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/flipkart-ads/oauth';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
