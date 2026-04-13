import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/amazon-ads/oauth';
import { storeTokens } from '@/lib/amazon-ads/token-store';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const errorDescription = request.nextUrl.searchParams.get('error_description');

  if (error) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('amz_error', errorDescription || error);
    return NextResponse.redirect(url);
  }

  if (!code) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('amz_error', 'no_auth_code');
    return NextResponse.redirect(url);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_acquired_at: Date.now(),
      profile_id: '',
      connected_at: new Date().toISOString(),
    });

    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('amz_step', 'select_account');
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error('Amazon Ads OAuth callback error:', err);
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('amz_error', 'oauth_exchange_failed');
    return NextResponse.redirect(url);
  }
}
