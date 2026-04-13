import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/x-ads/oauth';
import { storeTokens, getPendingCodeVerifier, clearPendingCodeVerifier } from '@/lib/x-ads/token-store';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('x_error', error);
    return NextResponse.redirect(url);
  }

  if (!code) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('x_error', 'no_auth_code');
    return NextResponse.redirect(url);
  }

  const codeVerifier = getPendingCodeVerifier();
  if (!codeVerifier) {
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('x_error', 'missing_code_verifier');
    return NextResponse.redirect(url);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    clearPendingCodeVerifier();

    storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_acquired_at: Date.now(),
      ad_account_id: '',
      connected_at: new Date().toISOString(),
    });

    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('x_step', 'select_account');
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error('X Ads OAuth callback error:', err);
    clearPendingCodeVerifier();
    const url = new URL('/integrations', APP_URL);
    url.searchParams.set('x_error', 'oauth_exchange_failed');
    return NextResponse.redirect(url);
  }
}
