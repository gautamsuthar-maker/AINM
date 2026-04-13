import fs from 'fs';
import path from 'path';
import type { MetaAdsTokens } from './types';

const TOKEN_FILE = path.join(process.cwd(), '.meta-ads-tokens.json');

export function getStoredTokens(): MetaAdsTokens | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as MetaAdsTokens;
    }
  } catch {
    // corrupted file
  }
  return null;
}

export function storeTokens(tokens: MetaAdsTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch {
    // ignore
  }
}

export function isTokenExpired(tokens: MetaAdsTokens): boolean {
  if (!tokens.expires_in) return false; // no expiry = doesn't expire
  const expiresAt = tokens.token_acquired_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 60_000 * 60; // refresh 1 hour before expiry
}
