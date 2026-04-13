import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/meta-ads/oauth';
import { storeTokens } from '@/lib/meta-ads/token-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/integrations?meta_error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/integrations?meta_error=no_code`);
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    storeTokens({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in ?? 5183944, // ~60 days default
      token_acquired_at: Date.now(),
    });

    return NextResponse.redirect(`${appUrl}/integrations?meta_step=select_account`);
  } catch (err: any) {
    console.error('Meta Ads OAuth callback error:', err);
    return NextResponse.redirect(
      `${appUrl}/integrations?meta_error=${encodeURIComponent(err.message)}`
    );
  }
}
