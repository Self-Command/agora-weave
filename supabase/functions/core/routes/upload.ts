import { SignJWT } from 'jsr:@panva/jose@6';
import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { resolveCurrentConfiguration } from '../config/effective.ts';
import { responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';
import { completeImageUploadCommand, createImageUploadCommand, imagePartCommand } from './upload-input.ts';
import { imageMime } from './image-mime.ts';

type Probe = { id: string; media_id: string; size_bytes: number; sha256: string; part_operation: string | null;
  completion_operation: string | null; uploaded_sha256: string | null; detected_mime: string | null;
  expires_at: string; state: string; bucket: string; key: string };
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const status = (code: string) => code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 :
  code === 'NOT_FOUND' ? 404 : code === 'CONFLICT' ? 409 : code === 'CONFIG_UNAVAILABLE' || code === 'SERVICE_UNAVAILABLE' ? 503 : 422;
const environment = () => Deno.env.get('CORE_ENVIRONMENT') || '';
const asFailure = (error: unknown,failure: Failure) => {
  const code=error instanceof Error && ['SESSION_INVALID','INVALID_INPUT','CONFIG_UNAVAILABLE'].includes(error.message)
    ? error.message : 'SERVICE_UNAVAILABLE';
  return failure(code,status(code));
};

async function actorFor(request: Request) {
  const actor = await principal(request);
  if (!actor || actor.audience !== 'authenticated') throw new Error('SESSION_INVALID');
  if (!['dev','test','production'].includes(environment())) throw new Error('SERVICE_UNAVAILABLE');
  return actor;
}
async function storageToken(probe: Probe): Promise<string> {
  const secret = Deno.env.get('JWT_SECRET');
  if (!secret || probe.bucket !== 'post-images-private' || probe.key !== `${probe.media_id}/original`) throw new Error('SERVICE_UNAVAILABLE');
  return new SignJWT({ role: 'core_upload', bucket: probe.bucket, object_key: probe.key })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30s')
    .sign(new TextEncoder().encode(secret));
}
async function boundedBytes(body: ReadableStream<Uint8Array> | null,limit: number): Promise<Uint8Array> {
  if (!body) throw new Error('INVALID_INPUT');
  const reader=body.getReader(), chunks: Uint8Array[]=[];
  let length=0;
  let timedOut=false;
  const deadline=setTimeout(()=>{ timedOut=true; void reader.cancel().catch(()=>{}); },15000);
  try {
    for (;;) {
      const item=await reader.read();
      if (timedOut) throw new Error('SERVICE_UNAVAILABLE');
      if (item.done) break;
      length+=item.value.length;
      if (length>limit) throw new Error('INVALID_INPUT');
      chunks.push(item.value);
    }
    const result=new Uint8Array(length);
    let offset=0;
    for (const chunk of chunks) { result.set(chunk,offset); offset+=chunk.length; }
    return result;
  } catch(error) { void reader.cancel().catch(()=>{}); throw error; }
  finally { clearTimeout(deadline); try { reader.releaseLock(); } catch { /* Cancellation may still be settling. */ } }
}
async function storageGet(probe: Probe): Promise<Uint8Array | null> {
  const token = await storageToken(probe);
  const url = `http://storage:5000/object/authenticated/${probe.bucket}/${probe.key}`;
  const response = await fetch(url,{ headers: { Authorization: `Bearer ${token}` },redirect:'error',signal:AbortSignal.timeout(15000) });
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail=await response.text();
    if (response.status===400 && detail.length<=512) {
      let error: unknown;
      try { error=JSON.parse(detail); } catch { /* Only the documented missing-object shape is accepted. */ }
      if (error && typeof error==='object' && !Array.isArray(error)) {
        const missing=error as Record<string,unknown>;
        if (missing.statusCode==='404' && missing.error==='not_found' && missing.code==='NoSuchKey') return null;
      }
    }
    throw new Error('SERVICE_UNAVAILABLE');
  }
  const length=response.headers.get('Content-Length');
  if (length!==null && Number(length)>probe.size_bytes) { await response.body?.cancel(); throw new Error('SERVICE_UNAVAILABLE'); }
  const bytes = await boundedBytes(response.body,probe.size_bytes);
  if (bytes.length !== probe.size_bytes) throw new Error('SERVICE_UNAVAILABLE');
  return bytes;
}
async function storagePut(probe: Probe, bytes: Uint8Array): Promise<void> {
  const token = await storageToken(probe);
  const url = `http://storage:5000/object/${probe.bucket}/${probe.key}`;
  const response = await fetch(url,{ method:'POST',headers: { Authorization:`Bearer ${token}`,
    'Content-Type':'application/octet-stream', 'Cache-Control':'no-store' },body:bytes,redirect:'error',signal:AbortSignal.timeout(15000) });
  await response.body?.cancel();
  // 409/400 can be a previous successful write with a lost response. Verify exact bytes below.
  if (!response.ok && ![400,409].includes(response.status)) throw new Error('SERVICE_UNAVAILABLE');
}
async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
  return [...digest].map(value => value.toString(16).padStart(2,'0')).join('');
}

async function probe(actor: {account:string;session:string}, uploadId: string, failure: Failure): Promise<Probe | Response> {
  const [row] = await database()`SELECT core.image_upload_probe(${actor.account}::uuid,${actor.session}::uuid,
    ${environment()},${uploadId}::uuid) AS result`;
  return row.result?.code === 'OK' ? row.result.data as Probe : failure(row.result?.code || 'SERVICE_UNAVAILABLE',
    status(row.result?.code || 'SERVICE_UNAVAILABLE'));
}
function output(data: unknown,version: string) {
  return Response.json({ request_id:crypto.randomUUID(),config_version:version,data },{ status:200,headers });
}

export async function createUpload(request: Request,failure: Failure): Promise<Response> {
  if (request.method!=='POST') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search) return failure('INVALID_INPUT',422);
  try {
    const actor=await actorFor(request),command=createImageUploadCommand(await readCommandJson(request,4096));
    if (!command) return failure('INVALID_INPUT',422);
    const release=request.headers.get('X-Client-Release') || '0.0.0';
    if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT',422);
    return await database().begin(async tx => {
      const config=await resolveCurrentConfiguration(tx,actor.account,actor.session,environment(),'api',release);
      const byteLimit=config?.values['media.image_bytes'];
      if (!config || !Number.isSafeInteger(byteLimit) || Number(byteLimit)<1) return failure('CONFIG_UNAVAILABLE',503);
      const [row]=command.intent==='profile'
        ? await tx`SELECT core.create_profile_image_upload_result(${actor.account}::uuid,${actor.session}::uuid,
          ${environment()},${command.operation_id}::uuid,${command.size_bytes},${command.sha256},
          ${Math.min(Number(byteLimit),10_000_000)},${config.version}) AS result`
        : await tx`SELECT core.create_image_upload_result(${actor.account}::uuid,${actor.session}::uuid,
          ${environment()},${command.operation_id}::uuid,${command.size_bytes},${command.sha256},
          ${Math.min(Number(byteLimit),10_000_000)},${config.version}) AS result`;
      return row.result?.code==='OK' ? output(row.result.data,await responseConfigVersion(tx)) :
        failure(row.result?.code || 'SERVICE_UNAVAILABLE',status(row.result?.code || 'SERVICE_UNAVAILABLE'));
    });
  } catch(error) { return asFailure(error,failure); }
}

export async function putUploadPart(request: Request,uploadId: string,part: string,failure: Failure): Promise<Response> {
  if (request.method!=='PUT') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search) return failure('INVALID_INPUT',422);
  const type=request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() || null;
  const command=imagePartCommand(uploadId,part,request.headers.get('X-Operation-Id'),
    type,request.headers.get('Content-Length'));
  if (!command || command.part!==0) return failure('INVALID_INPUT',422);
  try {
    const actor=await actorFor(request),data=await probe(actor,command.upload_id,failure);
    if (data instanceof Response) return data;
    if (command.size_bytes!==null && command.size_bytes!==data.size_bytes) return failure('INVALID_INPUT',422);
    if (data.part_operation===command.operation_id) return await database().begin(async tx => {
      const [row]=await tx`SELECT core.image_upload_part_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment()},${command.upload_id}::uuid,${command.operation_id}::uuid,${data.sha256}) AS result`;
      return row.result?.code==='OK' ? output(row.result.data,await responseConfigVersion(tx)) :
        failure(row.result?.code || 'SERVICE_UNAVAILABLE',status(row.result?.code || 'SERVICE_UNAVAILABLE'));
    });
    if ((!data.part_operation && (new Date(data.expires_at).getTime()<=Date.now() || !['allocated','uploading'].includes(data.state))) ||
        data.part_operation && data.part_operation!==command.operation_id)
      return failure('CONFLICT',409);
    if (!request.body) return failure('INVALID_INPUT',422);
    const bytes=await boundedBytes(request.body,data.size_bytes);
    if (bytes.length!==data.size_bytes || bytes.length>10_000_000) return failure('INVALID_INPUT',422);
    const hash=await sha256(bytes);
    if (hash!==data.sha256) return failure('INVALID_INPUT',422);
    const existing=await storageGet(data);
    if (existing !== null && await sha256(existing)!==hash) return failure('CONFLICT',409);
    if (existing === null) await storagePut(data,bytes);
    const verified=await storageGet(data);
    if (!verified || await sha256(verified)!==hash) return failure('SERVICE_UNAVAILABLE',503);
    const refreshed=await probe(actor,command.upload_id,failure);
    if (refreshed instanceof Response) return refreshed;
    if (refreshed.part_operation && refreshed.part_operation!==command.operation_id) return failure('CONFLICT',409);
    return await database().begin(async tx => {
      const [row]=await tx`SELECT core.image_upload_part_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment()},${command.upload_id}::uuid,${command.operation_id}::uuid,${hash}) AS result`;
      return row.result?.code==='OK' ? output(row.result.data,await responseConfigVersion(tx)) :
        failure(row.result?.code || 'SERVICE_UNAVAILABLE',status(row.result?.code || 'SERVICE_UNAVAILABLE'));
    });
  } catch(error) { return asFailure(error,failure); }
}

export async function completeUpload(request: Request,uploadId: string,failure: Failure): Promise<Response> {
  if (request.method!=='POST') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search || !uuid.test(uploadId)) return failure('INVALID_INPUT',422);
  try {
    const actor=await actorFor(request),command=completeImageUploadCommand(await readCommandJson(request,4096));
    if (!command) return failure('INVALID_INPUT',422);
    const data=await probe(actor,uploadId,failure);
    if (data instanceof Response) return data;
    if (data.completion_operation===command.operation_id && data.detected_mime && command.sha256===data.sha256)
      return await database().begin(async tx => {
        const [row]=await tx`SELECT core.complete_image_upload_result(${actor.account}::uuid,${actor.session}::uuid,
          ${environment()},${uploadId}::uuid,${command.operation_id}::uuid,${data.sha256},${data.detected_mime}) AS result`;
        return row.result?.code==='OK' ? output(row.result.data,await responseConfigVersion(tx)) :
          failure(row.result?.code || 'SERVICE_UNAVAILABLE',status(row.result?.code || 'SERVICE_UNAVAILABLE'));
      });
    if (data.completion_operation && data.completion_operation!==command.operation_id) return failure('CONFLICT',409);
    if (!data.completion_operation && (new Date(data.expires_at).getTime()<=Date.now() || data.state!=='uploaded'))
      return failure('CONFLICT',409);
    const bytes=await storageGet(data),hash=bytes && await sha256(bytes),mime=bytes && imageMime(bytes);
    if (!bytes || hash!==data.sha256 || hash!==command.sha256 || !mime) return failure('INVALID_INPUT',422);
    const refreshed=await probe(actor,uploadId,failure);
    if (refreshed instanceof Response) return refreshed;
    if (refreshed.completion_operation && refreshed.completion_operation!==command.operation_id) return failure('CONFLICT',409);
    return await database().begin(async tx => {
      const [row]=await tx`SELECT core.complete_image_upload_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment()},${uploadId}::uuid,${command.operation_id}::uuid,${hash},${mime}) AS result`;
      return row.result?.code==='OK' ? output(row.result.data,await responseConfigVersion(tx)) :
        failure(row.result?.code || 'SERVICE_UNAVAILABLE',status(row.result?.code || 'SERVICE_UNAVAILABLE'));
    });
  } catch(error) { return asFailure(error,failure); }
}
