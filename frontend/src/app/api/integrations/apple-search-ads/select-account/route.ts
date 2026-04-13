import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/apple-search-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { orgId, orgName } = await request.json();

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      org_id: String(orgId),
      org_name: orgName || undefined,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, orgId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
