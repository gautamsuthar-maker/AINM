import crypto from 'crypto';

const TOKEN_URL = 'https://appleid.apple.com/auth/oauth2/token';

function generateClientSecret(): string {
  const clientId = process.env.APPLE_SEARCH_ADS_CLIENT_ID;
  const teamId = process.env.APPLE_SEARCH_ADS_TEAM_ID;
  const keyId = process.env.APPLE_SEARCH_ADS_KEY_ID;
  const rawKey = process.env.APPLE_SEARCH_ADS_PRIVATE_KEY || '';
  // Support \\n literals (common when storing PEM in env vars)
  const privateKey = rawKey.replace(/\\n/g, '\n');

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error(
      'Missing Apple Search Ads credentials. Set APPLE_SEARCH_ADS_CLIENT_ID, APPLE_SEARCH_ADS_TEAM_ID, APPLE_SEARCH_ADS_KEY_ID, and APPLE_SEARCH_ADS_PRIVATE_KEY in .env.local'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: clientId,
      iss: teamId,
      iat: now,
      exp: now + 180 * 24 * 60 * 60, // 180 days max
      aud: 'https://appleid.apple.com',
    })
  ).toString('base64url');

  const signingInput = `${header}.${payload}`;

  const sign = crypto.createSign('SHA256');
  sign.update(signingInput);
  // ES256 requires IEEE P1363 encoding (raw R||S), not DER
  const signature = sign.sign(
    { key: privateKey, format: 'pem', type: 'pkcs8', dsaEncoding: 'ieee-p1363' },
    'base64url'
  );

  return `${signingInput}.${signature}`;
}

export async function connectAndGetToken(): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const clientSecret = generateClientSecret();
  const clientId = process.env.APPLE_SEARCH_ADS_CLIENT_ID!;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'searchadsorg',
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Apple Search Ads token exchange failed (${res.status}): ${err}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Apple Search Ads OAuth error: ${json.error_description || json.error}`);
  }

  return json as { access_token: string; token_type: string; expires_in: number };
}
