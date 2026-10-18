import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import type { CoreSession } from '../features/management/contracts';

export function isCoreSession(value: unknown): value is CoreSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Object.keys(v).length === 3 && typeof v.access_token === 'string' && /^[A-Za-z0-9_.-]{12,8192}$/.test(v.access_token) &&
    typeof v.refresh_token === 'string' && /^[\x21-\x7e]{12,2048}$/.test(v.refresh_token) &&
    typeof v.expires_at === 'number' && Number.isSafeInteger(v.expires_at) && v.expires_at > 0;
}

function encryption() {
  const environment = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT;
  const secret = process.env.AGORAWEAVE_ADMIN_SESSION_KEY;
  if (!['dev', 'test', 'production'].includes(environment ?? '') || !secret || !/^[a-f0-9]{64}$/i.test(secret)) throw new Error('SERVICE_UNAVAILABLE');
  return { key: Buffer.from(secret, 'hex'), aad: Buffer.from(`agoraweave:admin-session:v1:${environment}`) };
}

export function sealManagementSession(session: CoreSession): string {
  if (!isCoreSession(session)) throw new Error('SESSION_INVALID');
  const { key, aad } = encryption();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(session)), cipher.final()]);
  const value = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
  if (value.length > 3800) throw new Error('SERVICE_UNAVAILABLE');
  return value;
}

export function openManagementSession(value: string | undefined): CoreSession | null {
  if (!value || value.length > 3800 || !/^[\w-]+$/.test(value)) return null;
  const { key, aad } = encryption();
  try {
    const data = Buffer.from(value, 'base64url');
    if (data.length < 29 || data.toString('base64url') !== value) return null;
    const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12));
    decipher.setAAD(aad);
    decipher.setAuthTag(data.subarray(12, 28));
    const parsed: unknown = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8'));
    return isCoreSession(parsed) ? parsed : null;
  } catch { return null; }
}

export function managementCookie() {
  const secure = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT === 'production';
  return { name: secure ? '__Host-agora-admin' : 'agora-admin', options: { httpOnly: true, secure,
    sameSite: 'strict' as const, path: '/' } };
}

// Coordination only: the core checks current identity and grants on every access.
const locks = new Map<string, Promise<void>>();
export async function serializeManagementSession<T>(cookie: string | undefined, action: () => Promise<T>): Promise<T> {
  if (!cookie) return action();
  const key = createHash('sha256').update(cookie).digest('hex');
  const previous = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>(resolve => { release = resolve; });
  locks.set(key, current);
  await previous;
  try { return await action(); } finally { release(); if (locks.get(key) === current) locks.delete(key); }
}
