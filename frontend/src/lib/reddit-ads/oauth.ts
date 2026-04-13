const AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

const SCOPES = ['ads:read', 'ads:write', 'identity'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/reddit-ads/callback`;
}

export function getAuthUrl(state = 'reddit_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.REDDIT_ADS_CLIENT_ID!,
    response_type: 'code',
    state,
    redirect_uri: getRedirectUri(),
    duration: 'permanent',
    scope: SCOPES.join(' '),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const credentials = Buffer.from(
    `${process.env.REDDIT_ADS_CLIENT_ID}:${process.env.REDDIT_ADS_CLIENT_SECRET}`
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
      'User-Agent': 'AINM/1.0',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Reddit Ads token exchange failed: ${err}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(`Reddit OAuth error: ${json.error}`);

  return json as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const credentials = Buffer.from(
    `${process.env.REDDIT_ADS_CLIENT_ID}:${process.env.REDDIT_ADS_CLIENT_SECRET}`
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
      'User-Agent': 'AINM/1.0',
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Failed to refresh Reddit Ads access token');
  const json = await res.json();
  if (json.error) throw new Error(`Reddit refresh error: ${json.error}`);
  return json as { access_token: string; refresh_token: string; expires_in: number };
}
