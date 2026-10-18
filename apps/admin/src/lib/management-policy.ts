export type AdminEnvironment = 'dev' | 'test' | 'production';
type Environment = Record<string, string | undefined>;

/** The upstream and environment are deployment configuration, never request input. */
export function managementConfiguration(env: Environment) {
  const environment = env.AGORAWEAVE_ADMIN_ENVIRONMENT;
  const value = env.AGORAWEAVE_ADMIN_CORE_API_URL;
  if (!['dev', 'test', 'production'].includes(environment ?? '') || !value) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/functions/v1/core/api/v1' && url.pathname !== '/core/api/v1') return null;
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    const internal = environment === 'production' && value === 'http://api-gw:8000/functions/v1/core/api/v1';
    if (environment === 'production' ? url.protocol !== 'https:' && !internal : !loopback || !['http:', 'https:'].includes(url.protocol)) return null;
    return { base: url.href.replace(/\/$/, ''), environment: environment as AdminEnvironment, anonKey: env.AGORAWEAVE_ADMIN_ANON_KEY };
  } catch { return null; }
}

export function sameOriginWrite(request: Request, env: Environment = process.env): boolean {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const target = new URL(request.url);
  const host = request.headers.get('host');
  // Generic Requests may omit Host. Real requests must match their raw authority;
  // forwarded headers never establish the browser's origin.
  let matching = origin === target.origin && (host === null || host === target.host);
  if (!matching && env.NODE_ENV === 'development' && ['dev', 'test'].includes(env.AGORAWEAVE_ADMIN_ENVIRONMENT ?? '') &&
      target.hostname === 'localhost' && host !== null) {
    try {
      const browser = new URL(origin);
      // NextURL normalizes 127.0.0.1 to localhost. Permit only this exact local
      // development transformation, with the original Host and identical scheme/port.
      matching = origin === browser.origin && browser.hostname === '127.0.0.1' && host === browser.host &&
        browser.protocol === target.protocol && browser.port === target.port;
    } catch { return false; }
  }
  if (!matching) return false;
  return request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() === 'application/json' &&
    request.headers.get('x-agoraweave-csrf') === '1';
}

export function isAdministrator(value: unknown, environment: AdminEnvironment): value is import('../features/management/contracts').Administrator {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const account = v.account as Record<string, unknown> | undefined;
  const mfa = v.mfa as Record<string, unknown> | undefined;
  return !!account && typeof account.id === 'string' && typeof account.phone_masked === 'string' &&
    v.environment === environment && Array.isArray(v.roles) && v.roles.length > 0 && v.roles.every(role => typeof role === 'string') &&
    Array.isArray(v.permissions) && v.permissions.every(permission => typeof permission === 'string') && !!mfa &&
    ['aal1', 'aal2'].includes(String(mfa.aal)) && typeof mfa.enrolled === 'boolean' && typeof mfa.verified === 'boolean' &&
    (v.sensitive_until === null || typeof v.sensitive_until === 'string');
}

export function managementPath(path: string[], method: string): string | null {
  const joined = '/' + path.join('/');
  if (path.some(segment => !/^[A-Za-z0-9_-]+$/.test(segment))) return null;
  const reads = ['/admin/session', '/admin/mfa/factors', '/admin/accounts', '/admin/contents', '/admin/cases', '/admin/appeals', '/admin/config/definitions'];
  const writes = ['/auth/challenges', '/auth/verify', '/auth/refresh', '/auth/logout', '/auth/password/captcha', '/auth/password', '/auth/password/forgot', '/admin/mfa/factors',
    '/admin/mfa/challenges', '/admin/mfa/verify', '/admin/stepup', '/admin/config/previews', '/admin/config/releases', '/admin/config/rollbacks'];
  if (method === 'GET' && (reads.includes(joined) || /^\/operations\/[a-f0-9-]{36}$/i.test(joined))) return joined;
  if (method === 'POST' && (writes.includes(joined) || /^\/auth\/operations\/[a-f0-9-]{36}$/i.test(joined) ||
    /^\/admin\/revisions\/[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\/decision(?:-previews)?$/i.test(joined))) return joined;
  return null;
}
