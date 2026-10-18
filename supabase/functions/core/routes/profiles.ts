import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, outputIsOpen, type Failure } from '../output.ts';
import { resolveCurrentConfiguration } from '../config/effective.ts';
import { readCommandJson } from '../request-body.ts';
import { readFeedCursor,writeFeedCursor,type FeedCursor,type FeedScope } from './discovery-cursor.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const fields = new Set(['operation_id','base_version','nickname','username','bio','avatar_media_ref','background_media_ref']);
const codes = new Set(['SESSION_INVALID','FORBIDDEN','NOT_FOUND','CONFLICT','INVALID_INPUT',
  'RATE_LIMITED','CONFIG_UNAVAILABLE','SERVICE_UNAVAILABLE']);

function status(code: string): number {
  return code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 :
    code === 'CONFLICT' ? 409 : code === 'INVALID_INPUT' ? 422 : code === 'RATE_LIMITED' ? 429 : 503;
}

function validProfile(value: unknown, accountId: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  return Object.keys(p).length === 11 && p.account_id === accountId &&
    typeof p.nickname === 'string' && p.nickname.length > 0 && typeof p.username === 'string' &&
    typeof p.bio === 'string' && typeof p.registered_at === 'string' &&
    (p.avatar_media_ref === null || typeof p.avatar_media_ref === 'string' && uuid.test(p.avatar_media_ref)) &&
    (p.background_media_ref === null || typeof p.background_media_ref === 'string' && uuid.test(p.background_media_ref)) &&
    Number.isSafeInteger(p.followers_count) && Number.isSafeInteger(p.following_count) &&
    Number.isSafeInteger(p.row_version) && Array.isArray(p.allowed_actions) &&
    p.allowed_actions.every(action => typeof action === 'string');
}

/** GET /profiles/{accountId}; SQL separates public profile authorization from content. */
export async function getProfile(request: Request, accountId: string, failure: Failure): Promise<Response> {
  if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED',405);
  if (!uuid.test(accountId) || new URL(request.url).search) return failure('INVALID_INPUT',422);
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '';
  if (!['dev','test','production'].includes(environment)) return failure('SERVICE_UNAVAILABLE',503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failure(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', error instanceof Error && error.message === 'SERVICE_UNAVAILABLE' ? 503 : 401); }
  const viewer = actor?.audience === 'authenticated' ? actor : null;
  try {
    return await admittedOutput(failure, async tx => {
      const [row] = await tx`SELECT core.read_profile_result(${viewer?.account || null}::uuid,
        ${viewer?.session || null}::uuid,${accountId.toLowerCase()}::uuid,${environment}) AS result`;
      if (row.result?.code !== 'OK') {
        const code = codes.has(row.result?.code) ? row.result.code : 'SERVICE_UNAVAILABLE';
        return failure(code,status(code));
      }
      if (!validProfile(row.result.data,accountId.toLowerCase())) return failure('SERVICE_UNAVAILABLE',503);
      return jsonOutput(tx,row.result.data);
    });
  } catch { return failure('SERVICE_UNAVAILABLE',503); }
}

/** GET /profiles/{accountId}/contents, limited to approved posts and their static media. */
export async function getProfileContents(request: Request, accountId: string, failure: Failure): Promise<Response> {
  if (request.method!=='GET') return failure('METHOD_NOT_ALLOWED',405);
  const url=new URL(request.url),limit=url.searchParams.get('limit') || '20',type=url.searchParams.get('type') || 'posts';
  const release=request.headers.get('X-Client-Release') || '';
  if (!uuid.test(accountId) || [...url.searchParams.keys()].some(key=>!['limit','cursor','type'].includes(key)) ||
      ['limit','cursor','type'].some(key=>url.searchParams.getAll(key).length>1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || !['posts','media'].includes(type) ||
      !/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT',422);
  const environment=Deno.env.get('CORE_ENVIRONMENT') || '',secret=Deno.env.get('JWT_SECRET') || '';
  if (!['dev','test','production'].includes(environment) || !secret) return failure('SERVICE_UNAVAILABLE',503);
  return admittedOutput(failure,async tx=>{
    let actor;
    try { actor=await principal(request); }
    catch(error) {return failure(error instanceof Error && error.message==='SERVICE_UNAVAILABLE'?'SERVICE_UNAVAILABLE':'SESSION_INVALID',
      error instanceof Error && error.message==='SERVICE_UNAVAILABLE'?503:401);}
    if (actor?.audience==='share-read') return failure('FORBIDDEN',403);
    const scope:FeedScope={scope:`profile-${accountId.toLowerCase()}-${type}-created-v1`,
      subject:actor?.account ?? null,session:actor?.session ?? null,environment,limit:Number(limit),client_release:release};
    let cursor:FeedCursor|undefined;
    if(url.searchParams.has('cursor')){
      try{cursor=await readFeedCursor(url.searchParams.get('cursor')!,scope,secret);}
      catch{return failure('INVALID_INPUT',422);}
    }
    const [row]=await tx`SELECT core.profile_contents_result(${actor?.account ?? null}::uuid,
      ${actor?.session ?? null}::uuid,${environment},${accountId.toLowerCase()}::uuid,${type},${release},
      ${Number(limit)},${cursor?.position ?? null}::uuid,${cursor?.created_at ?? null}::timestamptz,
      ${cursor?.config_version ?? null}) AS result`;
    const result=row.result;
    if(result?.code!=='OK'){
      const code=codes.has(result?.code)?result.code:'SERVICE_UNAVAILABLE';
      return failure(code,status(code));
    }
    const next_cursor=result.has_more?await writeFeedCursor({...scope,position:result.next_id,
      created_at:result.next_created_at,config_version:result.config_version},secret):null;
    return jsonOutput(tx,{items:result.items,next_cursor,has_more:result.has_more});
  });
}

/** PATCH /me/profile; the SQL command owns CAS, reservations, and receipt. */
export async function updateProfile(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'PATCH') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search) return failure('INVALID_INPUT',422);
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '';
  if (!['dev','test','production'].includes(environment)) return failure('SERVICE_UNAVAILABLE',503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failure(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', error instanceof Error && error.message === 'SERVICE_UNAVAILABLE' ? 503 : 401); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID',401);
  let input;
  try { input = await readCommandJson(request,8192); }
  catch { return failure('INVALID_INPUT',422); }
  if (Object.keys(input).some(key => !fields.has(key)) || Object.keys(input).length < 3 ||
    typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
    !Number.isSafeInteger(input.base_version) || Number(input.base_version) < 1 ||
    input.nickname !== undefined && (typeof input.nickname !== 'string' || input.nickname.trim().length < 1 || input.nickname.length > 80) ||
    input.username !== undefined && (typeof input.username !== 'string' || input.username.length > 30) ||
    input.bio !== undefined && (typeof input.bio !== 'string' || input.bio.length > 1000) ||
    input.avatar_media_ref !== undefined && (typeof input.avatar_media_ref !== 'string' || !uuid.test(input.avatar_media_ref)) ||
    input.background_media_ref !== undefined && (typeof input.background_media_ref !== 'string' || !uuid.test(input.background_media_ref))) {
    return failure('INVALID_INPUT',422);
  }
  const command: Record<string, unknown> = { operation_id: input.operation_id.toLowerCase(),
    base_version: input.base_version };
  for (const field of ['nickname','username','bio','avatar_media_ref','background_media_ref']) {
    if (Object.hasOwn(input,field)) command[field] = input[field];
  }
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(command))));
  const digest = [...bytes].map(byte => byte.toString(16).padStart(2,'0')).join('');
  const release = request.headers.get('X-Client-Release') || '0.0.0';
  if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT',422);
  try {
    const result = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { code: 'SERVICE_UNAVAILABLE' };
      const config = await resolveCurrentConfiguration(tx,actor.account,actor.session,environment,'api',release);
      const min = config?.values['profile.username_min_length'];
      const max = config?.values['profile.username_max_length'];
      const change = config?.values['profile.username_change_seconds'];
      const hold = config?.values['profile.old_username_hold_seconds'];
      const reserved = config?.values['profile.reserved_usernames'];
      if (!config || !Number.isSafeInteger(min) || !Number.isSafeInteger(max) || !Number.isSafeInteger(change) ||
        !Number.isSafeInteger(hold) || !Array.isArray(reserved) || reserved.some(name => typeof name !== 'string')) {
        return { code: 'CONFIG_UNAVAILABLE' };
      }
      const [row] = await tx`SELECT core.update_profile_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment},${JSON.stringify(command)}::text::jsonb,${digest},${Number(min)},${Number(max)},
        ${Number(change)}::bigint,${Number(hold)}::bigint,${JSON.stringify(reserved)}::text::jsonb) AS result`;
      if (row.result?.code !== 'OK') return row.result;
      if (!validProfile(row.result.data,actor.account)) throw new Error('SERVICE_UNAVAILABLE');
      return { ...row.result, config_version: config.version };
    });
    if (result?.code !== 'OK') {
      const code = codes.has(result?.code) ? result.code : 'SERVICE_UNAVAILABLE';
      return failure(code,status(code));
    }
    if (!validProfile(result.data,actor.account) || typeof result.config_version !== 'string')
      return failure('SERVICE_UNAVAILABLE',503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: result.config_version, data: result.data },
      { status: 200, headers: { 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE',503); }
}
