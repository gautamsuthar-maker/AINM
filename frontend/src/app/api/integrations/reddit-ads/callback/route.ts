import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/reddit-ads/oauth';
import { storeTokens } from '@/lib/reddit-ads/token-store';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('reddit_error', error);
    return NextResponse.redirect(url);
  }

  if (!code) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('reddit_error', 'no_auth_code');
    return NextResponse.redirect(url);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_acquired_at: Date.now(),
      ad_account_id: '',
      connected_at: new Date().toISOString(),
    });

    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('reddit_step', 'select_account');
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error('Reddit Ads OAuth callback error:', err);
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('reddit_error', 'oauth_exchange_failed');
    return NextResponse.redirect(url);
  }
}
