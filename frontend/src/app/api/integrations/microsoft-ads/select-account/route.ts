import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/microsoft-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { accountId, accountName, customerId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      account_id: String(accountId),
      account_name: accountName || undefined,
      customer_id: customerId ? String(customerId) : tokens.customer_id,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, accountId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
