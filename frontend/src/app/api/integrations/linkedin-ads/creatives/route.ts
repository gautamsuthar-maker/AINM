import { NextRequest, NextResponse } from 'next/server';
import { listCreatives, createCreative } from '@/lib/linkedin-ads/client';
import type { CreateCreativeInput } from '@/lib/linkedin-ads/types';

export async function GET(request: NextRequest) {
  try {
    const campaignId = request.nextUrl.searchParams.get('campaignId') ?? undefined;
    const creatives = await listCreatives(campaignId);
    return NextResponse.json({ creatives });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn creatives:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch creatives' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCreativeInput = await request.json();

    if (!body.campaignId || !body.type || !body.clickUri) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, type, clickUri' },
        { status: 400 }
      );
    }

    const result = await createCreative(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create LinkedIn creative:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create creative' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
