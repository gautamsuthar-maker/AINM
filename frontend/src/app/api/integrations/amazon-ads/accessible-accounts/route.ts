import { NextResponse } from 'next/server';
import { listProfiles } from '@/lib/amazon-ads/client';

export async function GET() {
  try {
    const accounts = await listProfiles();
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to list Amazon Ads profiles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list profiles' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
