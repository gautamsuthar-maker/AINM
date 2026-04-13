import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/tiktok-ads/oauth';
import { storeTokens } from '@/lib/tiktok-ads/token-store';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const authCode = request.nextUrl.searchParams.get('auth_code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('tiktok_error', error);
    return NextResponse.redirect(url);
  }

  if (!authCode) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('tiktok_error', 'no_auth_code');
    return NextResponse.redirect(url);
  }

  try {
    const tokens = await exchangeCodeForTokens(authCode);

    storeTokens({
      access_token: tokens.access_token,
      expires_in: 31536000, // TikTok tokens are valid for 1 year
      token_acquired_at: Date.now(),
      advertiser_id: '',
      connected_at: new Date().toISOString(),
    });

    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('tiktok_step', 'select_account');
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error('TikTok OAuth callback error:', err);
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('tiktok_error', 'oauth_exchange_failed');
    return NextResponse.redirect(url);
  }
}
