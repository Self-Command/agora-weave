import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';

type Cursor = { position: string; subject: string; environment: string; limit: number; client_release: string; config_version: string };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decode = (value: string) => Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
const text = new TextEncoder();
async function cursorKey() {
  const secret = Deno.env.get('JWT_SECRET');
  if (!secret) throw new Error('SERVICE_UNAVAILABLE');
  return await crypto.subtle.importKey('raw',text.encode(secret),{ name: 'HMAC', hash: 'SHA-256' },false,['sign','verify']);
}
async function readCursor(value: string, scope: Omit<Cursor,'position'|'config_version'>): Promise<Cursor> {
  if (value.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('INVALID_INPUT');
  const envelope = JSON.parse(new TextDecoder().decode(decode(value)));
  if (!envelope || typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string' ||
      !await crypto.subtle.verify('HMAC',await cursorKey(),decode(envelope.signature),text.encode(envelope.payload))) throw new Error('INVALID_INPUT');
  const cursor = JSON.parse(envelope.payload);
  if (!cursor || Object.keys(cursor).length !== 6 || !uuid.test(cursor.position) || typeof cursor.config_version !== 'string' ||
      Object.entries(scope).some(([key,value]) => cursor[key] !== value)) throw new Error('INVALID_INPUT');
  return cursor;
}
async function writeCursor(cursor: Cursor): Promise<string> {
  const payload = JSON.stringify(cursor);
  const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC',await cursorKey(),text.encode(payload))));
  return encode(text.encode(JSON.stringify({ payload,signature })));
}

export async function revokeSession(request: Request, target: string | null,
  failure: (code: string, status: number) => Response): Promise<Response> {
  const logout = target === null;
  const actor = await principal(request);
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID',401);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev','test','production'].includes(environment)) return failure('SERVICE_UNAVAILABLE',503);
  let body;
  try {
    body = await readCommandJson(request,2048);
  } catch { return failure('INVALID_INPUT',422); }
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !(logout ? ['operation_id'] : ['operation_id','base_version']).includes(key)) ||
      typeof body.operation_id !== 'string' || !uuid.test(body.operation_id) || !logout &&
      (!target || !uuid.test(target) || !Number.isSafeInteger(body.base_version) || body.base_version < 1)) return failure('INVALID_INPUT',422);
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',text.encode(JSON.stringify({
    target,base_version: body.base_version ?? null,operation_id: body.operation_id,
  }))))].map(value => value.toString(16).padStart(2,'0')).join('');
  const [row] = await database()`SELECT core.revoke_session_result(${actor.account}::uuid,${actor.session}::uuid,
    ${target}::uuid,${body.base_version ?? null}::bigint,${body.operation_id}::uuid,${digest},${environment},${logout}) AS result`;
  const result = row.result;
  if (result.code !== 'OK') return failure(result.code,result.code === 'SESSION_INVALID' ? 401 :
    result.code === 'NOT_FOUND' ? 404 : result.code === 'CONFLICT' ? 409 : 422);
  return Response.json({ request_id: body.operation_id,data: {
    revoked: result.revoked,clear_restricted_cache: result.clear_restricted_cache,
  } },{ headers: { 'Cache-Control': 'no-store' } });
}

/** The caller receives only current owned device metadata, under the same output gate as revocation. */
export function listSessions(request: Request, failure: (code: string, status: number) => Response): Promise<Response> {
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') ?? '20';
  const release = request.headers.get('X-Client-Release') || '';
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if ([...url.searchParams.keys()].some(key => !['limit','cursor'].includes(key)) ||
      url.searchParams.getAll('limit').length > 1 || url.searchParams.getAll('cursor').length > 1 ||
      !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 50 || !/^[\w.-]{1,128}$/.test(release)) {
    return Promise.resolve(failure('INVALID_INPUT',422));
  }
  if (!environment || !['dev','test','production'].includes(environment)) return Promise.resolve(failure('SERVICE_UNAVAILABLE',503));
  return new Promise<Response>(resolve => {
    let resolved = false;
    const deliver = (response: Response) => { if (!resolved) { resolved = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      const actor = await principal(request);
      if (!actor || actor.audience !== 'authenticated') { deliver(failure('SESSION_INVALID',401)); return; }
      const scope = { subject: actor.account, environment, limit: Number(limit), client_release: release };
      let cursor: Cursor | undefined;
      if (url.searchParams.has('cursor')) {
        try { cursor = await readCursor(url.searchParams.get('cursor')!,scope); }
        catch { deliver(failure('INVALID_INPUT',422)); return; }
      }
      const [row] = await tx`SELECT core.list_sessions_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment},${release},${Number(limit)},${cursor?.position ?? null}::uuid,${cursor?.config_version ?? null}) AS result`;
      const result = row.result;
      if (result.code !== 'OK') { deliver(failure(result.code === 'CONFIG_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE' : result.code,
        result.code === 'SESSION_INVALID' ? 401 : result.code === 'INVALID_INPUT' ? 422 : 503)); return; }
      const next_cursor = result.has_more ? await writeCursor({ ...scope,position: result.next_id,config_version: result.config_version }) : null;
      const bytes = text.encode(JSON.stringify({ request_id: crypto.randomUUID(),config_version: result.config_version,
        data: { items: result.items,next_cursor,has_more: result.has_more } }));
      if (bytes.length > 1024 * 1024) { deliver(failure('SERVICE_UNAVAILABLE',503)); return; }
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(bytes); value.close(); } finally { clearTimeout(timer); done(); } },
        cancel() { clearTimeout(timer); done(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } }));
      await handedOff;
    }).catch(() => deliver(failure('SERVICE_UNAVAILABLE',503)));
  });
}
