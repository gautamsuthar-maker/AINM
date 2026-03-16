import { NextRequest, NextResponse } from 'next/server';
import { listTargetingEntities } from '@/lib/linkedin-ads/client';

export async function GET(request: NextRequest) {
  try {
    const facetUrn = request.nextUrl.searchParams.get('facet');
    if (!facetUrn) {
      return NextResponse.json(
        { error: 'Missing required query param: facet (e.g. urn:li:adTargetingFacet:locations)' },
        { status: 400 }
      );
    }

    const entities = await listTargetingEntities(facetUrn);
    return NextResponse.json({ entities });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn targeting entities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch targeting entities' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
