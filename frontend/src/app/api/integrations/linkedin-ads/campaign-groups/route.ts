import { NextRequest, NextResponse } from 'next/server';
import { listCampaignGroups, createCampaignGroup } from '@/lib/linkedin-ads/client';
import type { CreateCampaignGroupInput } from '@/lib/linkedin-ads/types';

export async function GET() {
  try {
    const groups = await listCampaignGroups();
    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn campaign groups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign groups' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCampaignGroupInput = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const result = await createCampaignGroup(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create LinkedIn campaign group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign group' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
