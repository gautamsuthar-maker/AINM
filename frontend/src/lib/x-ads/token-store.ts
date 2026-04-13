import fs from 'fs';
import path from 'path';
import type { XAdsTokens } from './types';

const TOKEN_FILE = path.join(process.cwd(), '.x-ads-tokens.json');

// Temporary PKCE verifier storage (in-memory for simplicity)
let pendingCodeVerifier: string | null = null;

export function setPendingCodeVerifier(verifier: string): void {
  pendingCodeVerifier = verifier;
}

export function getPendingCodeVerifier(): string | null {
  return pendingCodeVerifier;
}

export function clearPendingCodeVerifier(): void {
  pendingCodeVerifier = null;
}

export function getStoredTokens(): XAdsTokens | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as XAdsTokens;
    }
  } catch {
    // corrupted file
  }
  return null;
}

export function storeTokens(tokens: XAdsTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch {
    // ignore
  }
}

export function isTokenExpired(tokens: XAdsTokens): boolean {
  const expiresAt = tokens.token_acquired_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 60_000;
}
