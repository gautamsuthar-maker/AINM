const AUTH_URL = 'https://www.pinterest.com/oauth/';
const TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';

const SCOPES = ['ads:read', 'ads:write'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/pinterest-ads/callback`;
}

export function getAuthUrl(state = 'pinterest_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.PINTEREST_ADS_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(','),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const credentials = Buffer.from(
    `${process.env.PINTEREST_ADS_CLIENT_ID}:${process.env.PINTEREST_ADS_CLIENT_SECRET}`
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
    throw new Error(`Pinterest token exchange failed: ${err}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const credentials = Buffer.from(
    `${process.env.PINTEREST_ADS_CLIENT_ID}:${process.env.PINTEREST_ADS_CLIENT_SECRET}`
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

  if (!res.ok) throw new Error('Failed to refresh Pinterest Ads access token');
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}
