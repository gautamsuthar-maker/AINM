import { NextResponse } from 'next/server';
import { listOrganizations } from '@/lib/apple-search-ads/client';

export async function GET() {
  try {
    const organizations = await listOrganizations();
    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Failed to fetch Apple Search Ads organizations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch organizations' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
