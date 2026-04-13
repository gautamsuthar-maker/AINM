const AUTH_URL = 'https://flipkart.net/oauth-service/oauth/authorize';
const TOKEN_URL = 'https://flipkart.net/oauth-service/oauth/token';

const SCOPES = ['Seller_Api'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/flipkart-ads/callback`;
}

export function getAuthUrl(state = 'flipkart_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.FLIPKART_ADS_CLIENT_ID!,
    response_type: 'code',
    state,
    redirect_uri: getRedirectUri(),
    scope: SCOPES.join(' '),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const credentials = Buffer.from(
    `${process.env.FLIPKART_ADS_CLIENT_ID}:${process.env.FLIPKART_ADS_CLIENT_SECRET}`
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flipkart Ads token exchange failed: ${err}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(`Flipkart OAuth error: ${json.error_description || json.error}`);

  return json as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const credentials = Buffer.from(
    `${process.env.FLIPKART_ADS_CLIENT_ID}:${process.env.FLIPKART_ADS_CLIENT_SECRET}`
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Failed to refresh Flipkart Ads access token');
  const json = await res.json();
  if (json.error) throw new Error(`Flipkart refresh error: ${json.error_description || json.error}`);
  return json as { access_token: string; refresh_token: string; expires_in: number };
}
