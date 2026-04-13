const AUTH_URL = 'https://business-api.tiktok.com/portal/auth';
const TOKEN_URL = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/tiktok-ads/callback`;
}

export function getAuthUrl(state = 'tiktok_oauth') {
  const params = new URLSearchParams({
    app_id: process.env.TIKTOK_ADS_APP_ID!,
    state,
    redirect_uri: getRedirectUri(),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(authCode: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.TIKTOK_ADS_APP_ID!,
      secret: process.env.TIKTOK_ADS_SECRET!,
      auth_code: authCode,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TikTok token exchange failed: ${err}`);
  }

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`TikTok token exchange error: ${json.message}`);
  }

  return json.data as {
    access_token: string;
    advertiser_ids: string[];
    scope: string;
  };
}
