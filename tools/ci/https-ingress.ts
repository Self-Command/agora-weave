import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

export type IngressIdentity = { run_id: string; attempt: number; target_sha: string; environment: 'dev' | 'test' };
export type IngressOptions = { seed: string; identity: IngressIdentity; upstream: string; expires_at: number; now?: () => number };
export function deriveIngressToken(seed: string, identity: IngressIdentity): string {
  if (typeof seed !== 'string' || seed.length < 32 || !/^[1-9]\d*$/.test(identity.run_id) ||
      !Number.isSafeInteger(identity.attempt) || identity.attempt < 1 || !/^[a-f0-9]{40}$/.test(identity.target_sha) ||
      !['dev', 'test'].includes(identity.environment)) throw new Error('Invalid nonproduction ingress identity');
  return createHmac('sha256', seed).update(JSON.stringify(['agoraweave-ci-https-v1', identity.run_id,
    identity.attempt, identity.target_sha, identity.environment])).digest('hex');
}
export function createIngress(options: IngressOptions) {
  const token = Buffer.from('Bearer ' + deriveIngressToken(options.seed, options.identity));
  const upstream = new URL(options.upstream);
  if (upstream.protocol !== 'http:' || upstream.username || upstream.password || upstream.search || upstream.hash ||
      upstream.pathname !== '/' || !Number.isFinite(options.expires_at)) throw new Error('Invalid isolated upstream');
  const now = options.now || Date.now;
  return createServer(async (request, response) => {
    response.setHeader('cache-control', 'no-store');
    response.setHeader('x-content-type-options', 'nosniff');
    const finish = (status: number) => { response.writeHead(status); response.end(); };
    const supplied = Buffer.from(request.headers.authorization || '');
    if (now() >= options.expires_at || supplied.length !== token.length || !timingSafeEqual(supplied, token)) { finish(401); return; }
    if (request.url !== '/auth/v1/health') { finish(404); return; }
    if (request.method !== 'GET') { finish(405); return; }
    try {
      const original = await fetch(new URL('/health', upstream), { redirect: 'error', signal: AbortSignal.timeout(10000) });
      const bytes = Buffer.from(await original.arrayBuffer());
      if (bytes.length > 65536) { finish(502); return; }
      response.setHeader('content-type', original.headers.get('content-type') || 'application/octet-stream');
      response.writeHead(original.status);
      response.end(bytes);
    } catch { finish(502); }
  });
}
