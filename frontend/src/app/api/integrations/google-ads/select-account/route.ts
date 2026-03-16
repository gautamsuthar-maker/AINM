import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, storeTokens } from '@/lib/google-ads/token-store';

export async function POST(request: NextRequest) {
  try {
    const { customerId, accountName } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) {
      return NextResponse.json({ error: 'Not authenticated. Complete OAuth first.' }, { status: 401 });
    }

    storeTokens({
      ...tokens,
      customer_id: String(customerId).replace(/-/g, ''),
      account_name: accountName || undefined,
      connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, customerId });
  } catch (error: any) {
    console.error('Failed to select account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to select account' },
      { status: 500 }
    );
  }
}
