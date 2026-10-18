import { NextResponse, type NextRequest } from 'next/server';
import { canPreviewTemplate, requestHostname } from './lib/template-preview.mjs';
import { managementConfiguration } from './lib/management-policy';

export function proxy(request: NextRequest) {
  const allowed = canPreviewTemplate({
    nodeEnv: process.env.NODE_ENV,
    enabled: process.env.AGORAWEAVE_ADMIN_TEMPLATE_PREVIEW,
    hostname: requestHostname(request.headers.get('host')),
    pathname: request.nextUrl.pathname,
    method: request.method,
    origin: request.headers.get('origin'),
    requestOrigin: request.nextUrl.origin,
    fetchSite: request.headers.get('sec-fetch-site')
  });
  const path = request.nextUrl.pathname;
  const page = /^(?:\/admin\/(?:login|mfa)|\/dashboard\/(?:identity|configuration\/otp))\/?$/.test(path);
  const publicRead = ['GET', 'HEAD'].includes(request.method) && (page || path === '/' || path === '/dashboard');
  const asset = /^(?:\/_next\/(?:static\/|webpack-hmr$)|\/favicon\.ico$)/.test(path) && canPreviewTemplate({
    nodeEnv: 'development', enabled: '1', hostname: '127.0.0.1', pathname: path, method: request.method,
    origin: request.headers.get('origin'), requestOrigin: request.nextUrl.origin, fetchSite: request.headers.get('sec-fetch-site')
  });
  const api = path.startsWith('/api/management/');
  const management = publicRead || asset || api;
  const configured = managementConfiguration(process.env) && /^[a-f0-9]{64}$/i.test(process.env.AGORAWEAVE_ADMIN_SESSION_KEY ?? '');
  if (!allowed && management && !configured && page) {
    return new NextResponse('Management service is unavailable.', { status: 503, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  if (!allowed && (!management || !configured && !api)) {
    return new NextResponse('Management access is unavailable until current administrator identity, MFA and authorization are connected.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
    });
  }
  const headers = new Headers(request.headers);
  headers.set('x-agoraweave-admin-surface', allowed ? 'preview' : 'management');
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-AgoraWeave-Surface', allowed ? 'local-upstream-template-preview' : 'management');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export const config = { matcher: '/:path*' };
