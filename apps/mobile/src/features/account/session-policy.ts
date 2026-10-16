import type { SessionTokens } from './api.ts';

export function validTokens(value: unknown): value is SessionTokens {
  const entry = value as SessionTokens | null;
  return !!entry && typeof entry.access_token === 'string' && entry.access_token.length > 0 &&
    typeof entry.refresh_token === 'string' && entry.refresh_token.length > 0 && Number.isSafeInteger(entry.expires_at);
}
export function storedSession(raw: string | null): SessionTokens | null {
  if (!raw) return null;
  try { const value: unknown = JSON.parse(raw); return validTokens(value) ? value : null; }
  catch { return null; }
}
