import fs from 'fs';
import path from 'path';
import type { SnapchatTokens } from './types';

const TOKEN_FILE = path.join(process.cwd(), '.snapchat-ads-tokens.json');

export function getStoredTokens(): SnapchatTokens | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as SnapchatTokens;
    }
  } catch {
    // corrupted file
  }
  return null;
}

export function storeTokens(tokens: SnapchatTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearTokens(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch {
    // ignore
  }
}

export function isTokenExpired(tokens: SnapchatTokens): boolean {
  const expiresAt = tokens.token_acquired_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - 60_000;
}
