import { createServer } from 'node:http';

export type IngressIdentity = { run_id: string; attempt: number; target_sha: string; environment: 'dev' | 'test' };
export type IngressOptions = { seed: string; identity: IngressIdentity; upstream: string; expires_at: number; now?: () => number };
export function deriveIngressToken(_seed: string, _identity: IngressIdentity): string { return 'not_implemented'; }
export function createIngress(_options: IngressOptions) {
  return createServer((_request, response) => { response.writeHead(501); response.end(); });
}
