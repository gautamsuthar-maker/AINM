import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, createCampaign } from '@/lib/amazon-ads/client';
import type { CreateAmazonAdsCampaignInput } from '@/lib/amazon-ads/types';

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to fetch Amazon Ads campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAmazonAdsCampaignInput = await request.json();

    if (!body.name || !body.campaignType || !body.daily_budget || !body.start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, campaignType, daily_budget, start_date' },
        { status: 400 }
      );
    }

    const result = await createCampaign(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create Amazon Ads campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
