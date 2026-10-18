import { SignJWT } from 'jsr:@panva/jose@6';
import { principal } from '../identity.ts';
import { database } from '../database.ts';
import { admittedOutput, type Failure } from '../output.ts';

const chunkSize = 64 * 1024;
const unavailable = (code: string) => code==='SESSION_INVALID'?401:code==='SERVICE_UNAVAILABLE'?503:404;
type MediaResult = { code: string; data: { mime: string; size_bytes: number; hash?: string }; source: { bucket: string; key: string } };
function range(value: string | null,size: number): [number,number] | null {
  if (!value) return [0,size-1];
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size-1,Number(match[2])) : size-1;
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start>=0 && start<=end && start<size ? [start,end] : null;
}
async function storageBytes(source: MediaResult['source'],start: number,end: number) {
  const secret = Deno.env.get('JWT_SECRET'); if (!secret) throw new Error('SERVICE_UNAVAILABLE');
  const jwt = await new SignJWT({ role: 'core_media',bucket: source.bucket,object_key: source.key })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('10s').sign(new TextEncoder().encode(secret));
  const path = [source.bucket,...source.key.split('/')].map(encodeURIComponent).join('/');
  const response = await fetch(`http://storage:5000/object/authenticated/${path}`,{ headers: { Authorization: `Bearer ${jwt}`,Range: `bytes=${start}-${end}` },
    redirect: 'error',signal: AbortSignal.timeout(2000) });
  if (!response.ok || ![200,206].includes(response.status)) { await response.body?.cancel(); throw new Error('SERVICE_UNAVAILABLE'); }
  const reader = response.body?.getReader(); if (!reader) throw new Error('SERVICE_UNAVAILABLE');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) { const item = await reader.read(); if (item.done) break; size+=item.value.length;
      if (size>end-start+1) throw new Error('SERVICE_UNAVAILABLE'); chunks.push(item.value); }
  } finally { await reader.cancel(); }
  if (size!==end-start+1) throw new Error('SERVICE_UNAVAILABLE');
  const bytes = new Uint8Array(size); let offset=0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.length; }
  return bytes;
}

export async function media(request: Request,target: string,failure: Failure): Promise<Response> {
  if (!['GET','HEAD'].includes(request.method)) return failure('METHOD_NOT_ALLOWED',405);
  const url = new URL(request.url),variant = url.searchParams.get('variant') || 'original';
  if ([...url.searchParams].some(([key])=>key!=='variant') || url.searchParams.getAll('variant').length>1) return failure('INVALID_INPUT',422);
  const actor = await principal(request);
  const read = async (tx: ReturnType<typeof database>) => {
    const current = await principal(request);
    const [row] = await tx`SELECT core.media_read_result(${current?.account ?? null}::uuid,${current?.session ?? null}::uuid,${target}::uuid,${variant}) AS result`;
    if (row.result?.code === 'OK') return row.result as MediaResult;
    const [profile] = await tx`SELECT core.profile_media_read_result(${current?.account ?? null}::uuid,
      ${current?.session ?? null}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''},${target}::uuid,${variant}) AS result`;
    if (profile.result?.code === 'OK' || !current || current.audience !== 'authenticated' || variant !== 'original')
      return profile.result as MediaResult;
    const [review] = await tx`SELECT core.media_review_read_result(${current.account}::uuid,${current.session}::uuid,
      ${Deno.env.get('CORE_ENVIRONMENT') || ''},${current.aal},${target}::uuid) AS result`;
    return (review.result?.code === 'OK' ? review.result : row.result) as MediaResult;
  };
  // Fetch internal bytes before final admission, so a slow origin never holds a policy lock.
  const initial = await read(database());
  if (initial.code!=='OK') return failure(initial.code,unavailable(initial.code));
  const initialSize=Number(initial.data.size_bytes),initialTag=initial.data.hash?`"${initial.data.hash}"`:null;
  const requested=request.headers.get('Range');
  const useRange=requested && (!request.headers.has('If-Range') || request.headers.get('If-Range')===initialTag);
  const selected=range(useRange?requested:null,initialSize);
  const noBody=request.method==='HEAD' || initialTag && request.headers.get('If-None-Match')===initialTag;
  const prefetched=!noBody && selected && selected[1]-selected[0]+1<=chunkSize ? await storageBytes(initial.source,...selected):null;
  const fingerprint=(value:MediaResult)=>JSON.stringify([value.source,value.data]);
  return admittedOutput(failure,async tx => {
    const result = await read(tx);
    if (result.code!=='OK') return failure(result.code,unavailable(result.code));
    if (fingerprint(result)!==fingerprint(initial)) return failure('SERVICE_UNAVAILABLE',503);
    const size = Number(result.data.size_bytes),etag = result.data.hash ? `"${result.data.hash}"` : null;
    if (!Number.isSafeInteger(size) || size<1 || size>200000000) return failure('SERVICE_UNAVAILABLE',503);
    const headers = new Headers({ 'Content-Type': result.data.mime || 'application/octet-stream','Accept-Ranges':'bytes',
      'Content-Disposition':'inline; filename="media"','Content-Security-Policy':"sandbox; default-src 'none'" });
    if (etag) headers.set('ETag',etag);
    if (etag && request.headers.get('If-None-Match')===etag) return { status:304,headers };
    if (!selected) return { status:416,headers:{ 'Content-Range':`bytes */${size}` } };
    const [start,end] = selected,partial = start>0 || end<size-1;
    headers.set('Content-Length',String(end-start+1));
    if (partial || useRange) headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
    if (request.method==='HEAD') return { status:partial || useRange?206:200,headers };
    if (prefetched) return { bytes:prefetched,status:partial || useRange?206:200,headers };
    let position = start,cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const stop = Math.min(end,position+chunkSize-1),bytes = await storageBytes(result.source,position,stop);
          await database().begin(async next => {
            await next`SELECT pg_advisory_xact_lock_shared(17013,1)`;
            const [gate] = await next`SELECT core.policy_context_result(${actor?.account ?? null}::uuid,${actor?.session ?? null}::uuid,
              ${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
            if (gate.result.code!=='OK') throw new Error('ACCESS_CHANGED');
            const current = await read(next);
            if (cancelled || current.code!=='OK' || fingerprint(current)!==fingerprint(result) || actor && actor.expires_at*1000<=Date.now()) throw new Error('ACCESS_CHANGED');
            if (cancelled) return;
            controller.enqueue(bytes); position=stop+1; if (position>end) controller.close();
          });
        } catch { if (!cancelled) controller.error(new Error('MEDIA_UNAVAILABLE')); }
      },
      cancel() { cancelled=true; },
    },{ highWaterMark:0 });
    // Chunk streams do their own admission and never use a storage redirect or positive authorization cache.
    headers.set('Cache-Control','no-store'); headers.set('X-Robots-Tag','noindex'); headers.set('X-Content-Type-Options','nosniff');
    return new Response(stream,{ status:partial || useRange?206:200,headers });
  });
}
