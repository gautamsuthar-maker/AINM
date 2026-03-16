import { NextRequest, NextResponse } from 'next/server';
import { getBudgetPricing } from '@/lib/linkedin-ads/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.bidType || !body.campaignType || !body.dailyBudgetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: bidType, campaignType, dailyBudgetAmount' },
        { status: 400 }
      );
    }

    const pricing = await getBudgetPricing({
      bidType: body.bidType,
      campaignType: body.campaignType,
      dailyBudgetAmount: body.dailyBudgetAmount,
      currencyCode: body.currencyCode,
      includedFacets: body.includedFacets,
      excludedFacets: body.excludedFacets,
    });

    return NextResponse.json({ pricing });
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn budget pricing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budget pricing' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
