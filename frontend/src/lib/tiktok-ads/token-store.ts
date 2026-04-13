import fs from 'fs';
import path from 'path';
import type { TikTokTokens } from './types';

const TOKEN_FILE = path.join(process.cwd(), '.tiktok-ads-tokens.json');

export function getStoredTokens(): TikTokTokens | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as TikTokTokens;
    }
  } catch {
    // corrupted file
  }
  return null;
}

export function storeTokens(tokens: TikTokTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch {
    // ignore
  }
}

// TikTok access tokens are long-lived (1 year) — check with 60s buffer
export function isTokenExpired(tokens: TikTokTokens): boolean {
  const expiresAt = tokens.token_acquired_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 60_000;
}
