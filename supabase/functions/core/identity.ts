import { jwtVerify } from 'jsr:@panva/jose@6';

export type Principal = { account: string; session: string; audience: 'authenticated' | 'share-read' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Only signature-verified claims create the principal passed to the private database adapter. */
export async function principal(request: Request): Promise<Principal | null> {
  const header = request.headers.get('Authorization');
  if (!header) return null;
  if (!/^Bearer [A-Za-z0-9_.-]+$/i.test(header) || header.length > 8192) throw new Error('SESSION_INVALID');
  const issuer = Deno.env.get('CORE_JWT_ISSUER'), secret = Deno.env.get('JWT_SECRET');
  if (!issuer || !secret) throw new Error('SERVICE_UNAVAILABLE');
  const { payload } = await jwtVerify(header.slice(7), new TextEncoder().encode(secret), {
    issuer, audience: ['authenticated', 'share-read'], algorithms: ['HS256'],
    requiredClaims: ['sub', 'session_id', 'aud', 'iss', 'exp', 'iat'],
  });
  if (typeof payload.sub !== 'string' || !uuid.test(payload.sub) ||
      typeof payload.session_id !== 'string' || !uuid.test(payload.session_id) ||
      !['authenticated', 'share-read'].includes(payload.aud as string) || typeof payload.exp !== 'number') {
    throw new Error('SESSION_INVALID');
  }
  return { account: payload.sub, session: payload.session_id, audience: payload.aud as Principal['audience'] };
}
