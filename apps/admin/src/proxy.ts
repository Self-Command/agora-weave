import { NextResponse, type NextRequest } from 'next/server';
import { canPreviewTemplate, requestHostname } from './lib/template-preview.mjs';

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
  if (!allowed) {
    return new NextResponse('Management access is unavailable until current administrator identity, MFA and authorization are connected.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
    });
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-AgoraWeave-Surface', 'local-upstream-template-preview');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export const config = { matcher: '/:path*' };
