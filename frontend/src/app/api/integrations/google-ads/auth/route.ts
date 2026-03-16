import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-ads/oauth';

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ authUrl: url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
