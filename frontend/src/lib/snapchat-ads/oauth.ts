const AUTH_URL = 'https://accounts.snapchat.com/login/oauth2/authorize';
const TOKEN_URL = 'https://accounts.snapchat.com/login/oauth2/access_token';

const SCOPES = ['snapchat-marketing-api'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/snapchat-ads/callback`;
}

export function getAuthUrl(state = 'snapchat_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.SNAPCHAT_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: process.env.SNAPCHAT_CLIENT_ID!,
    client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Snapchat token exchange failed: ${err}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SNAPCHAT_CLIENT_ID!,
    client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Failed to refresh Snapchat access token');
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}
