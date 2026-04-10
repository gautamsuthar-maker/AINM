import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-ads/oauth';
import { storeTokens } from '@/lib/google-ads/token-store';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    const redirectUrl = new URL('/integrations', APP_URL);
    redirectUrl.searchParams.set('error', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL('/integrations', APP_URL);
    redirectUrl.searchParams.set('error', 'no_auth_code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      const redirectUrl = new URL('/integrations', APP_URL);
      redirectUrl.searchParams.set('error', 'no_refresh_token');
      return NextResponse.redirect(redirectUrl);
    }

    storeTokens({
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      customer_id: '',
      connected_at: new Date().toISOString(),
    });

    const redirectUrl = new URL('/integrations', APP_URL);
    redirectUrl.searchParams.set('step', 'select_account');
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error('Google Ads OAuth callback error:', err);
    const redirectUrl = new URL('/integrations', APP_URL);
    redirectUrl.searchParams.set('error', 'oauth_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
