import fs from 'fs';
import path from 'path';
import type { GoogleAdsTokens } from './types';

const TOKEN_FILE = path.join(process.cwd(), '.google-ads-tokens.json');

export function getStoredTokens(): GoogleAdsTokens | null {
  if (process.env.GOOGLE_ADS_REFRESH_TOKEN) {
    return {
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
      connected_at: new Date().toISOString(),
    };
  }

  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = fs.readFileSync(TOKEN_FILE, 'utf-8');
      return JSON.parse(data) as GoogleAdsTokens;
    }
  } catch {
    // corrupted file — ignore
  }

  return null;
}

export function storeTokens(tokens: GoogleAdsTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
  } catch {
    // ignore
  }
}
