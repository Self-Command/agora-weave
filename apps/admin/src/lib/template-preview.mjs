const readRoutes = [
  /^\/$/,
  /^\/dashboard\/?$/,
  /^\/dashboard\/(?:overview|users|kanban|chat|ai-chat|notifications)\/?$/,
  /^\/dashboard\/product(?:\/(?:new|\d+))?\/?$/,
  /^\/dashboard\/forms\/(?:basic|multi-step|sheet-form|advanced)\/?$/,
  /^\/dashboard\/elements\/icons\/?$/,
  /^\/_next\/(?:static\/|image$|webpack-hmr$)/,
  /^\/(?:favicon\.ico|shadcn-dashboard\.png|logo\.svg)$/
];
const syntheticApi = /^\/api\/(?:products|users)(?:\/\d+)?\/?$/;

/** @param {string|null} host */
export function requestHostname(host) {
  if (!host || /[\s,@\\/]/.test(host)) return '';
  try {
    const url = new URL('http://' + host);
    return url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password ? url.hostname : '';
  } catch { return ''; }
}

/**
 * This grants access only to an isolated upstream template preview. It never
 * validates, establishes or upgrades an AgoraWeave administrator session.
 * @param {{nodeEnv?:string, enabled?:string, hostname:string, pathname:string,
 * method:string, origin?:string|null, requestOrigin:string, fetchSite?:string|null}} input
 */
export function canPreviewTemplate(input) {
  if (input.nodeEnv !== 'development' || input.enabled !== '1') return false;
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(input.hostname)) return false;
  if (/\\/.test(input.pathname) || input.pathname.includes('//')) return false;
  if (input.pathname.includes('%')) {
    // Next generates percent-encoded @scope and [turbopack] chunk names.
    // Permit encoding only inside its static asset directory; business routes stay literal.
    try {
      const decoded = decodeURIComponent(input.pathname);
      if (!decoded.startsWith('/_next/static/') || /[%\\]/.test(decoded) || decoded.includes('//') ||
        decoded.split('/').some(segment => segment === '..' || segment === '.')) return false;
    } catch { return false; }
  }
  if (input.origin && input.origin !== input.requestOrigin) return false;
  if (input.fetchSite === 'cross-site') return false;
  if (syntheticApi.test(input.pathname)) {
    if (['GET', 'HEAD'].includes(input.method)) return true;
    return ['POST', 'PUT', 'DELETE'].includes(input.method) && input.origin === input.requestOrigin;
  }
  return ['GET', 'HEAD'].includes(input.method) && readRoutes.some(route => route.test(input.pathname));
}
