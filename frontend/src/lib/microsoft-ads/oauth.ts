const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

const SCOPES = ['https://ads.microsoft.com/msads.manage', 'offline_access'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/microsoft-ads/callback`;
}

export function getAuthUrl(state = 'microsoft_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_ADS_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    response_mode: 'query',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: process.env.MICROSOFT_ADS_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET!,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft token exchange failed: ${err}`);
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
    client_id: process.env.MICROSOFT_ADS_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_ADS_CLIENT_SECRET!,
    scope: SCOPES.join(' '),
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Failed to refresh Microsoft Ads access token');
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}
