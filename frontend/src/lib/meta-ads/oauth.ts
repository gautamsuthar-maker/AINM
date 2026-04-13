const AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';

const SCOPES = ['ads_management', 'ads_read', 'business_management'];

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/api/integrations/meta-ads/callback`;
}

export function getAuthUrl(state = 'meta_oauth') {
  const params = new URLSearchParams({
    client_id: process.env.META_ADS_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    scope: SCOPES.join(','),
    response_type: 'code',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_ADS_CLIENT_ID!,
    client_secret: process.env.META_ADS_CLIENT_SECRET!,
    redirect_uri: getRedirectUri(),
    code,
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta Ads token exchange failed: ${err}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(`Meta OAuth error: ${json.error.message || json.error}`);

  // Short-lived token — exchange for a long-lived one (60 days)
  return exchangeForLongLivedToken(json.access_token);
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_ADS_CLIENT_ID!,
    client_secret: process.env.META_ADS_CLIENT_SECRET!,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta Ads long-lived token exchange failed: ${err}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(`Meta token exchange error: ${json.error.message || json.error}`);

  return json as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export async function refreshLongLivedToken(existingToken: string) {
  // Meta refreshes long-lived tokens by re-exchanging them
  return exchangeForLongLivedToken(existingToken);
}
