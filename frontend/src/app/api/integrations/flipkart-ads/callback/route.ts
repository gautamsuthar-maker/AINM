import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/flipkart-ads/oauth';
import { storeTokens } from '@/lib/flipkart-ads/token-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/integrations?flipkart_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/integrations?flipkart_error=no_code`);
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    storeTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_acquired_at: Date.now(),
    });

    return NextResponse.redirect(`${appUrl}/integrations?flipkart_step=select_account`);
  } catch (err: any) {
    console.error('Flipkart Ads OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/integrations?flipkart_error=${encodeURIComponent(err.message)}`);
  }
}
