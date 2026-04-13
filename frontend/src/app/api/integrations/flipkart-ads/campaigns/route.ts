import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, createCampaign } from '@/lib/flipkart-ads/client';
import type { CreateFlipkartAdsCampaignInput } from '@/lib/flipkart-ads/types';

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to fetch Flipkart Ads campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFlipkartAdsCampaignInput = await request.json();

    if (!body.name || !body.type || body.budget === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, budget' },
        { status: 400 }
      );
    }

    const result = await createCampaign(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create Flipkart Ads campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
