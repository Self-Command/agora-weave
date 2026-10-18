import { countGraphemes } from '../../../../packages/contracts/src/vendor/unicode-segmenter/grapheme.js';
import { database } from '../database.ts';
import { resolveCurrentConfiguration } from '../config/effective.ts';
import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, outputIsOpen, responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digestPattern = /^[a-f0-9]{64}$/;
const releasePattern = /^[A-Za-z0-9_.-]{1,128}$/;
const knownErrors = new Set(['SESSION_INVALID','FORBIDDEN','NOT_FOUND','CONFLICT','INVALID_INPUT',
  'RATE_LIMITED','CONFIG_UNAVAILABLE','SERVICE_UNAVAILABLE']);
const encoder = new TextEncoder();

type Command = Record<string, unknown> & { operation_id: string };
type CurrentActor = { account: string; session: string };
type SqlResult = { code: string; data?: unknown; items?: unknown; has_more?: unknown;
  next_revision_no?: unknown; next_id?: unknown; next_deleted_at?: unknown };

function environment(): string | null {
  const env = Deno.env.get('CORE_ENVIRONMENT');
  return env && ['dev','test','production'].includes(env) ? env : null;
}
function error(result: unknown, failure: Failure): Response {
  const code = typeof result === 'string' && knownErrors.has(result) ? result : 'SERVICE_UNAVAILABLE';
  const status = code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 :
    code === 'CONFLICT' ? 409 : code === 'INVALID_INPUT' ? 422 : code === 'RATE_LIMITED' ? 429 : 503;
  if (status === 429) return Response.json({ request_id: crypto.randomUUID(), code,
    message: '操作过于频繁，请稍后重试', retryable: true },
  { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  return failure(code,status);
}
async function actorFor(request: Request): Promise<CurrentActor | null> {
  const actor = await principal(request);
  return actor?.audience === 'authenticated' ? { account: actor.account, session: actor.session } : null;
}
function exactKeys(value: unknown, required: string[], optional: string[] = []): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return required.every(key => keys.includes(key)) && keys.every(key => required.includes(key) || optional.includes(key));
}
function operation(value: unknown): value is string { return typeof value === 'string' && uuid.test(value); }
function version(value: unknown): value is number { return Number.isSafeInteger(value) && Number(value) >= 1; }
function validText(value: unknown): value is string {
  return typeof value === 'string' && new TextEncoder().encode(value).length <= 65536;
}
function validTags(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 20 && value.every(tag => typeof tag === 'string' &&
    tag.length > 0 && tag.length <= 100 && !/[\u0000-\u001f]/.test(tag));
}
function validAlt(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 9 && value.every(alt => typeof alt === 'string' &&
    alt.length <= 2000 && !/[\u0000-\u0008\u000b-\u001f]/.test(alt));
}
function validCommand(value: unknown, kind: 'content'|'visibility'|'reply'|'versioned'|'operation'): value is Command {
  const required = kind === 'content' ? ['operation_id','base_version'] :
    kind === 'visibility' ? ['operation_id','base_version','visibility'] :
    kind === 'reply' ? ['operation_id','base_version','scope'] :
    kind === 'versioned' ? ['operation_id','base_version'] : ['operation_id'];
  const optional = kind === 'content' ? ['body','tags','alt_text'] : kind === 'visibility' ? ['preview_digest'] : [];
  if (!exactKeys(value,required,optional) || !operation(value.operation_id) ||
      (kind !== 'operation' && !version(value.base_version))) return false;
  if (kind === 'content') return ['body','tags','alt_text'].some(key => key in value) &&
    (!('body' in value) || validText(value.body)) && (!('tags' in value) || validTags(value.tags)) &&
    (!('alt_text' in value) || validAlt(value.alt_text));
  if (kind === 'visibility') return ['public','followers','self'].includes(String(value.visibility)) &&
    (!('preview_digest' in value) || typeof value.preview_digest === 'string' && digestPattern.test(value.preview_digest));
  if (kind === 'reply') return ['all_readers','author_follows','mentioned','closed'].includes(String(value.scope));
  return true;
}
async function hash(value: unknown): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(JSON.stringify(value))));
  return [...bytes].map(byte => byte.toString(16).padStart(2,'0')).join('');
}
function receipt(value: unknown, operationId: string, kind: 'revision'|'action'|'deletion'): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (kind === 'revision') return Object.keys(row).length === 6 && row.operation_id === operationId &&
    operation(row.resource_id) && operation(row.revision_id) && version(row.row_version) &&
    ['pending','approved','rejected'].includes(String(row.review_state)) &&
    ['preparing','awaiting_review','published','rejected','failed','cancelled'].includes(String(row.publication_state));
  if (kind === 'action') return Object.keys(row).every(key => ['operation_id','state','target_ref','allowed_actions'].includes(key)) &&
    row.operation_id === operationId && ['pending','succeeded','failed','unknown'].includes(String(row.state)) &&
    Array.isArray(row.allowed_actions) && row.allowed_actions.every(x => typeof x === 'string') &&
    (row.target_ref === undefined || operation(row.target_ref));
  return Object.keys(row).length === 9 && operation(row.id) && operation(row.target_id) && version(row.row_version) &&
    ['deleted','restored','physical_removed'].includes(String(row.state)) &&
    ['deleted_at','undo_until','restore_until'].every(key => typeof row[key] === 'string' && !Number.isNaN(Date.parse(String(row[key])))) &&
    ['pending','running','failed','cancelled','physical_removed'].includes(String(row.purge_state)) &&
    Array.isArray(row.allowed_actions) && row.allowed_actions.every(x => typeof x === 'string');
}
function writeResponse(data: unknown, configVersion: string, status: number): Response {
  return Response.json({ request_id: crypto.randomUUID(), config_version: configVersion, data },
    { status, headers: { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
}

async function write(request: Request,target: string,failure: Failure,
  kind: 'content'|'visibility'|'reply'|'versioned'|'operation',
  procedure: 'patch_content_result'|'patch_visibility_result'|'patch_reply_policy_result'|'delete_resource_result'|'restore_resource_result',
  responseKind: 'revision'|'action'|'deletion',status: number,resourceKind?: 'post'|'comment'): Promise<Response> {
  if (!uuid.test(target) || new URL(request.url).search) return failure('INVALID_INPUT',422);
  const env = environment();
  if (!env) return failure('SERVICE_UNAVAILABLE',503);
  let actor: CurrentActor | null;
  try { actor = await actorFor(request); }
  catch (e) { return error(e instanceof Error && e.message === 'SERVICE_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID',failure); }
  if (!actor) return failure('SESSION_INVALID',401);
  let input: unknown;
  try { input = await readCommandJson(request,65536); }
  catch { return failure('INVALID_INPUT',422); }
  if (!validCommand(input,kind)) return failure('INVALID_INPUT',422);
  const command = input as Command;
  const payload = JSON.stringify(command);
  const payloadHash = await hash({ target:target.toLowerCase(), action:procedure, resource_kind:resourceKind ?? null, command });
  const release = request.headers.get('X-Client-Release') || '0.0.0';
  if (!releasePattern.test(release)) return failure('INVALID_INPUT',422);
  try {
    const result: { row: SqlResult; configVersion: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { row:{code:'SERVICE_UNAVAILABLE'},configVersion:'' };
      let row: { result: SqlResult };
      if (procedure === 'patch_content_result') {
        const configuration = await resolveCurrentConfiguration(tx,actor.account,actor.session,env,'api',release);
        const key = resourceKind === 'comment' ? 'comments.body_limit' : 'content.body_limit';
        const limit = configuration?.values[key];
        if (!configuration || !Number.isSafeInteger(limit) || Number(limit) < 1)
          return { row:{code:'CONFIG_UNAVAILABLE'},configVersion:'' };
        const body = typeof command.body === 'string' ? command.body : null;
        [row] = await tx`SELECT core.patch_content_result(${actor.account}::uuid,${actor.session}::uuid,${env},
          ${target}::uuid,${resourceKind},${payload}::text::jsonb,${payloadHash},
          ${body === null ? null : countGraphemes(body)}::integer,${Math.min(Number(limit),65536)}::integer,
          ${configuration.version}) AS result`;
        return { row:row.result,configVersion:configuration.version };
      }
      if (procedure === 'patch_visibility_result') [row] = await tx`SELECT core.patch_visibility_result(
        ${actor.account}::uuid,${actor.session}::uuid,${env},${target}::uuid,${payload}::text::jsonb,${payloadHash}) AS result`;
      else if (procedure === 'patch_reply_policy_result') [row] = await tx`SELECT core.patch_reply_policy_result(
        ${actor.account}::uuid,${actor.session}::uuid,${env},${target}::uuid,${payload}::text::jsonb,${payloadHash}) AS result`;
      else if (procedure === 'delete_resource_result') [row] = await tx`SELECT core.delete_resource_result(
        ${actor.account}::uuid,${actor.session}::uuid,${env},${target}::uuid,${resourceKind ?? null},
        ${payload}::text::jsonb,${payloadHash}) AS result`;
      else [row] = await tx`SELECT core.restore_resource_result(${actor.account}::uuid,${actor.session}::uuid,
        ${env},${target}::uuid,${payload}::text::jsonb,${payloadHash}) AS result`;
      return { row:row.result,configVersion:await responseConfigVersion(tx) };
    });
    if (result.row?.code !== 'OK') return error(result.row?.code,failure);
    if (!receipt(result.row.data,command.operation_id,responseKind) || !result.configVersion)
      return failure('SERVICE_UNAVAILABLE',503);
    return writeResponse(result.row.data,result.configVersion,status);
  } catch { return failure('SERVICE_UNAVAILABLE',503); }
}

export function patchPost(request: Request,postId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'PATCH') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,postId,failure,'content','patch_content_result','revision',202,'post');
}
export function patchComment(request: Request,commentId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'PATCH') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,commentId,failure,'content','patch_content_result','revision',202,'comment');
}
export function patchPostVisibility(request: Request,postId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'PATCH') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,postId,failure,'visibility','patch_visibility_result','action',200);
}
export async function previewPostVisibility(request: Request,postId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED',405);
  if (!uuid.test(postId) || new URL(request.url).search) return failure('INVALID_INPUT',422);
  const env=environment();
  if (!env) return failure('SERVICE_UNAVAILABLE',503);
  let actor:CurrentActor|null;
  try { actor=await actorFor(request); }
  catch(e) { return error(e instanceof Error && e.message==='SERVICE_UNAVAILABLE'?'SERVICE_UNAVAILABLE':'SESSION_INVALID',failure); }
  if (!actor) return failure('SESSION_INVALID',401);
  let input:unknown;
  try { input=await readCommandJson(request,65536); }
  catch { return failure('INVALID_INPUT',422); }
  if (!exactKeys(input,['operation_id','base_version','visibility']) || !validCommand(input,'visibility'))
    return failure('INVALID_INPUT',422);
  const payload=JSON.stringify(input);
  const payloadHash=await hash({target:postId.toLowerCase(),action:'post.visibility.preview',command:input});
  try {
    const {result,configVersion}=await database().begin(async tx=>{
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return {result:{code:'SERVICE_UNAVAILABLE'} as SqlResult,configVersion:''};
      const [row]=await tx`SELECT core.preview_post_visibility_result(${actor.account}::uuid,
        ${actor.session}::uuid,${env},${postId}::uuid,${payload}::text::jsonb,${payloadHash}) AS result`;
      return {result:row.result as SqlResult,configVersion:await responseConfigVersion(tx)};
    });
    if (result.code!=='OK') return error(result.code,failure);
    const data=result.data as Record<string,unknown>|undefined;
    if (!data || !operation(data.preview_id) || typeof data.preview_digest!=='string' ||
      !digestPattern.test(data.preview_digest) || !version(data.base_version) ||
      typeof data.expires_at!=='string' || Number.isNaN(Date.parse(data.expires_at)) ||
      !Array.isArray(data.affected_refs) || !data.affected_refs.every(operation) ||
      !Array.isArray(data.impacts) || !data.impacts.every(x=>typeof x==='string') || !configVersion)
      return failure('SERVICE_UNAVAILABLE',503);
    return writeResponse(data,configVersion,200);
  } catch { return failure('SERVICE_UNAVAILABLE',503); }
}
export function patchReplyPolicy(request: Request,postId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'PATCH') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,postId,failure,'reply','patch_reply_policy_result','action',200);
}
export function deleteComment(request: Request,commentId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'DELETE') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,commentId,failure,'versioned','delete_resource_result','action',200,'comment');
}
export function deleteResource(request: Request,resourceId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,resourceId,failure,'versioned','delete_resource_result','deletion',200);
}
export function restoreResource(request: Request,deletionId: string,failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return Promise.resolve(failure('METHOD_NOT_ALLOWED',405));
  return write(request,deletionId,failure,'versioned','restore_resource_result','deletion',200);
}

// Cursor is bound to the current identity, target, page size and current config version.
type Cursor = { scope:string; target:string; subject:string; session:string; env:string; limit:number;
  release:string; config_version:string; revision_no?:number; position?:string; deleted_at?:string };
const b64 = (bytes:Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
function unb64(value:string):Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('INVALID_INPUT');
  const bytes = Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4)),x=>x.charCodeAt(0));
  if (b64(bytes)!==value) throw new Error('INVALID_INPUT');
  return bytes;
}
async function cursorKey(secret:string):Promise<CryptoKey> {
  return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function readCursor(value:string,scope:Omit<Cursor,'config_version'|'revision_no'|'position'|'deleted_at'>,
  secret:string):Promise<Cursor> {
  if (value.length>2048) throw new Error('INVALID_INPUT');
  const envelope=JSON.parse(new TextDecoder().decode(unb64(value)));
  if (!exactKeys(envelope,['payload','signature']) || typeof envelope.payload!=='string' || typeof envelope.signature!=='string' ||
    !await crypto.subtle.verify('HMAC',await cursorKey(secret),unb64(envelope.signature),encoder.encode(envelope.payload)))
    throw new Error('INVALID_INPUT');
  const cursor=JSON.parse(envelope.payload) as Cursor;
  if (!cursor || typeof cursor!=='object' || Object.entries(scope).some(([key,expected])=>
      cursor[key as keyof Cursor]!==expected) || typeof cursor.config_version!=='string' ||
      cursor.config_version.length>256 || !cursor.config_version.length ||
      (scope.scope==='post-revisions' ? !version(cursor.revision_no) :
        !operation(cursor.position) || typeof cursor.deleted_at!=='string' || Number.isNaN(Date.parse(cursor.deleted_at))))
    throw new Error('INVALID_INPUT');
  return cursor;
}
async function writeCursor(cursor:Cursor,secret:string):Promise<string> {
  const payload=JSON.stringify(cursor);
  const signature=b64(new Uint8Array(await crypto.subtle.sign('HMAC',await cursorKey(secret),encoder.encode(payload))));
  return b64(encoder.encode(JSON.stringify({payload,signature})));
}
async function list(request:Request,target:string,failure:Failure,kind:'post-revisions'|'recent-deletions'):Promise<Response> {
  if (request.method!=='GET') return failure('METHOD_NOT_ALLOWED',405);
  const url=new URL(request.url),limit=url.searchParams.get('limit') ?? '20';
  const release=request.headers.get('X-Client-Release') || '';
  if ((kind==='post-revisions' && !uuid.test(target)) ||
      [...url.searchParams.keys()].some(key=>!['limit','cursor'].includes(key)) ||
      ['limit','cursor'].some(key=>url.searchParams.getAll(key).length>1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || !releasePattern.test(release))
    return failure('INVALID_INPUT',422);
  const env=environment(),secret=Deno.env.get('JWT_SECRET');
  if (!env || !secret) return failure('SERVICE_UNAVAILABLE',503);
  let actor:CurrentActor|null;
  try { actor=await actorFor(request); }
  catch(e) { return error(e instanceof Error && e.message==='SERVICE_UNAVAILABLE'?'SERVICE_UNAVAILABLE':'SESSION_INVALID',failure); }
  if (!actor) return failure('SESSION_INVALID',401);
  const scope={scope:kind,target:target.toLowerCase(),subject:actor.account,session:actor.session,env,limit:Number(limit),release};
  let cursor:Cursor|undefined;
  if (url.searchParams.has('cursor')) {
    try { cursor=await readCursor(url.searchParams.get('cursor')!,scope,secret); }
    catch { return failure('INVALID_INPUT',422); }
  }
  return admittedOutput(failure,async tx=>{
    const active=await responseConfigVersion(tx);
    if (cursor && cursor.config_version!==active) return failure('CONFLICT',409);
    const [row]=kind==='post-revisions' ? await tx`SELECT core.list_post_revisions_result(
      ${actor.account}::uuid,${actor.session}::uuid,${env},${target}::uuid,${Number(limit)}::integer,
      ${cursor?.revision_no ?? null}::bigint) AS result` : await tx`SELECT core.list_recently_deleted_result(
      ${actor.account}::uuid,${actor.session}::uuid,${env},${Number(limit)}::integer,
      ${cursor?.deleted_at ?? null}::timestamptz,${cursor?.position ?? null}::uuid) AS result`;
    const result=row.result as SqlResult;
    if (result?.code!=='OK') return error(result?.code,failure);
    if (!Array.isArray(result.items) || result.items.length>Number(limit) || typeof result.has_more!=='boolean')
      return failure('SERVICE_UNAVAILABLE',503);
    const validItem=kind==='post-revisions' ? (item:unknown)=>Boolean(item && typeof item==='object' &&
      operation((item as Record<string,unknown>).id) && operation((item as Record<string,unknown>).resource_id) &&
      version((item as Record<string,unknown>).revision_no)) :
      (item:unknown)=>receipt(item,'','deletion');
    if (!result.items.every(validItem)) return failure('SERVICE_UNAVAILABLE',503);
    let next_cursor:string|null=null;
    if (result.has_more) {
      if (kind==='post-revisions') {
        if (!version(result.next_revision_no)) return failure('SERVICE_UNAVAILABLE',503);
        next_cursor=await writeCursor({...scope,config_version:active,revision_no:result.next_revision_no as number},secret);
      } else {
        if (!operation(result.next_id) || typeof result.next_deleted_at!=='string' ||
            Number.isNaN(Date.parse(result.next_deleted_at))) return failure('SERVICE_UNAVAILABLE',503);
        next_cursor=await writeCursor({...scope,config_version:active,position:result.next_id,deleted_at:result.next_deleted_at},secret);
      }
      if (next_cursor.length>2048) return failure('SERVICE_UNAVAILABLE',503);
    }
    return jsonOutput(tx,{items:result.items,next_cursor,has_more:result.has_more});
  });
}
export function listPostRevisions(request:Request,postId:string,failure:Failure):Promise<Response> {
  return list(request,postId,failure,'post-revisions');
}
export function listRecentlyDeleted(request:Request,failure:Failure):Promise<Response> {
  return list(request,'me',failure,'recent-deletions');
}
