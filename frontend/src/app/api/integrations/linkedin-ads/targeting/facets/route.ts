import { NextResponse } from 'next/server';
import { listTargetingFacets } from '@/lib/linkedin-ads/client';

export async function GET() {
  try {
    const facets = await listTargetingFacets();
    return NextResponse.json({ facets });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn targeting facets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch targeting facets' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
