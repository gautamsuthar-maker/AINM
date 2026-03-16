const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

const SCOPES = ['r_ads', 'r_ads_reporting', 'rw_ads'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/linkedin-ads/callback`;
}

export function getAuthUrl(state = 'linkedin_oauth') {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
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
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Failed to refresh LinkedIn access token');
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}
