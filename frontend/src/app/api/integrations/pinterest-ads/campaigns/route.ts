import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, createCampaign } from '@/lib/pinterest-ads/client';
import type { CreatePinterestCampaignInput } from '@/lib/pinterest-ads/types';

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to fetch Pinterest Ads campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePinterestCampaignInput = await request.json();

    if (!body.name || !body.objective_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, objective_type' },
        { status: 400 }
      );
    }

    const result = await createCampaign(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create Pinterest Ads campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
