import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { compose, sql } from '../../../tools/ci/core-database.ts';

export { sql };
export const account = (number = 1) => `10000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
export const session = (number = 1) => `20000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
export function environment(): Record<string, string> {
  return Object.fromEntries(readFileSync(`${process.env.RUNNER_TEMP}/agoraweave-ci.env`, 'utf8').split(/\r?\n/)
    .filter(line => /^[A-Z][A-Z0-9_]*=/.test(line)).map(line => { const split = line.indexOf('='); return [line.slice(0, split), line.slice(split + 1)]; }));
}
export function token(number = 1, patch: Record<string, unknown> = {}): string {
  const env = environment();
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: 'http://api-gw:8000/auth/v1', aud: 'authenticated',
    sub: account(number), session_id: session(number), role: 'authenticated', aal: 'aal1',
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900, ...patch })}`;
  return input + '.' + createHmac('sha256', env.JWT_SECRET).update(input).digest('base64url');
}
export function request(path: string, options: { method?: string; token?: string; body?: unknown; headers?: Record<string, string>; auth?: boolean } = {}) {
  if (!/^\/[a-zA-Z0-9_/?=&.%:-]*$/.test(path)) throw new Error('Unregistered synthetic request path');
  const env = environment();
  const url = options.auth ? `http://auth:9999${path}` : `http://api-gw:8000/functions/v1/core/api/v1${path}`;
  const config = [`url = ${JSON.stringify(url)}`, `request = ${JSON.stringify(options.method || 'GET')}`,
    'silent', 'show-error', 'max-time = 20', 'write-out = "\\n%{http_code}"'];
  const headers = { apikey: env.ANON_KEY, ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...options.headers };
  for (const [name, value] of Object.entries(headers)) config.push(`header = ${JSON.stringify(`${name}: ${value}`)}`);
  if (options.body !== undefined) config.push('header = "Content-Type: application/json"', `data = ${JSON.stringify(JSON.stringify(options.body))}`);
  const raw = compose(['exec', '-T', 'db', 'curl', '--config', '-'], config.join('\n') + '\n');
  const split = raw.lastIndexOf('\n'), body = raw.slice(0, split), status = Number(raw.slice(split + 1));
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(body); } catch { /* A non-JSON upstream response remains visible as a contract failure. */ }
  if (options.auth && status >= 500) {
    const log = compose(['logs', '--no-color', '--tail', '40', 'auth']);
    const scan = log.match(/sql: Scan error on column index \d+, name [\\"]+[a-z_]+[\\"]+: converting NULL to string is unsupported/);
    console.error(JSON.stringify({ fixture_diagnostic: 'auth_5xx', status,
      code: data.error_code || data.code, database_scan_error: scan?.[0] || 'not_observed' }));
  }
  return { status, data, body };
}
export const rows = (statement: string): Record<string, unknown>[] => JSON.parse(sql(`SELECT coalesce(json_agg(q),'[]'::json) FROM (${statement}) q;`).trim());
