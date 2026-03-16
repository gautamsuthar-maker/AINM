import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCounts } from '@/lib/linkedin-ads/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.includedFacets || Object.keys(body.includedFacets).length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: includedFacets (object mapping facet names to URN arrays)' },
        { status: 400 }
      );
    }

    const counts = await getAudienceCounts(body.includedFacets, body.excludedFacets);
    return NextResponse.json(counts);
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn audience counts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audience counts' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
