import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, createCampaign } from '@/lib/google-ads/client';
import type { CreateCampaignInput } from '@/lib/google-ads/types';

export async function GET(request: NextRequest) {
  try {
    const dateRange =
      request.nextUrl.searchParams.get('dateRange') || 'LAST_30_DAYS';
    const campaigns = await listCampaigns(dateRange);
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to fetch campaigns:', error);
    const isNotEnabled = error?.errors?.[0]?.message?.includes('not yet enabled') ||
      error?.errors?.[0]?.message?.includes('deactivated');
    if (isNotEnabled) {
      return NextResponse.json(
        { error: 'This Google Ads account is not yet enabled or has been deactivated. Please disconnect and connect a different account.' },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCampaignInput = await request.json();

    if (!body.name || !body.channelType || !body.budgetAmountMicros || !body.startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, channelType, budgetAmountMicros, startDate' },
        { status: 400 }
      );
    }

    const result = await createCampaign(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
