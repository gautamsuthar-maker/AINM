import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, createCampaign } from '@/lib/linkedin-ads/client';
import type { CreateLinkedInCampaignInput } from '@/lib/linkedin-ads/types';

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkedInCampaignInput = await request.json();

    if (!body.name || !body.type || !body.costType || !body.dailyBudget || !body.objectiveType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, costType, dailyBudget, objectiveType' },
        { status: 400 }
      );
    }

    const result = await createCampaign(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create LinkedIn campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
