import { NextRequest, NextResponse } from 'next/server';
import { isAdministrator, managementConfiguration } from '@/lib/management-policy';
import { managementCookie, openManagementSession, serializeManagementSession } from '@/lib/management-session';
import { callManagementCore } from '@/lib/management-upstream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const imageTypes = new Set(['image/jpeg','image/png']);
const safeHeaders = { 'Cache-Control':'no-store', 'Content-Security-Policy':"sandbox; default-src 'none'",
  'Cross-Origin-Resource-Policy':'same-origin', 'Referrer-Policy':'no-referrer',
  'X-Content-Type-Options':'nosniff', 'X-Robots-Tag':'noindex' };
function failure(status:number) { return NextResponse.json({code:status===401?'SESSION_INVALID':
  status===404?'NOT_FOUND':'SERVICE_UNAVAILABLE'}, {status,headers:safeHeaders}); }

export async function GET(request:NextRequest,context:{params:Promise<{id:string}>}) {
  const {id}=await context.params;
  if(!uuid.test(id) || request.nextUrl.search || request.headers.has('range')) return failure(404);
  const config=managementConfiguration(process.env);
  if(!config) return failure(503);
  const encrypted=request.cookies.get(managementCookie().name)?.value;
  return serializeManagementSession(encrypted,async()=>{
    let session;
    try { session=openManagementSession(encrypted); } catch { return failure(503); }
    if(!session) return failure(401);
    const current=await callManagementCore('/admin/session',{token:session.access_token});
    if(current.status!==200) return failure(current.status===401?401:503);
    const administrator=(current.body as Record<string,unknown>).data;
    if(!isAdministrator(administrator,config.environment) || !administrator.mfa.verified ||
      administrator.mfa.aal!=='aal2') return failure(404);
    try {
      const upstream=await fetch(`${config.base}/media/${id}?variant=original`,{
        method:'GET',cache:'no-store',redirect:'error',headers:{Authorization:`Bearer ${session.access_token}`,
          'X-Client-Release':'0.0.0',...(config.anonKey?{apikey:config.anonKey}:{})},
        signal:AbortSignal.timeout(20000)
      });
      if(!upstream.ok) {await upstream.body?.cancel();return failure(upstream.status===401?401:upstream.status===404?404:503);}
      const mime=upstream.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
      const size=Number(upstream.headers.get('content-length'));
      if(!mime || !imageTypes.has(mime) || !Number.isSafeInteger(size) || size<1 || size>10_000_000)
        {await upstream.body?.cancel();return failure(503);}
      if(!upstream.body) return failure(503);
      const reader=upstream.body.getReader(),parts:Uint8Array[]= [];
      let count=0;
      try {
        for(;;) {
          const item=await reader.read();if(item.done) break;
          count+=item.value.length;if(count>size) {await reader.cancel();return failure(503);}
          parts.push(item.value);
        }
      } finally {reader.releaseLock();}
      if(count!==size) return failure(503);
      const bytes=new Uint8Array(size);let offset=0;
      for(const part of parts) {bytes.set(part,offset);offset+=part.length;}
      return new NextResponse(bytes,{status:200,headers:{...safeHeaders,'Content-Type':mime,'Content-Length':String(size)}});
    } catch { return failure(503); }
  });
}
