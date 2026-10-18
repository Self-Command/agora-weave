import { countGraphemes } from '../../../../packages/contracts/src/vendor/unicode-segmenter/grapheme.js';
import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, outputIsOpen, responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;
const knownErrors = new Set(['SESSION_INVALID', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT',
  'RATE_LIMITED', 'CONFIG_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'INVALID_INPUT']);
const encoder = new TextEncoder();
type CursorScope = { scope: 'own-sanctions-v1' | 'own-appeals-v1'; subject: string; session: string;
  environment: string; limit: number };
type PageCursor = CursorScope & { position: string; created_at: string; config_version: string };

function fail(code: unknown, fallback: Failure): Response {
  const registered = typeof code === 'string' && knownErrors.has(code) ? code : 'SERVICE_UNAVAILABLE';
  const status = registered === 'SESSION_INVALID' ? 401 : registered === 'FORBIDDEN' ? 403 :
    registered === 'NOT_FOUND' ? 404 : registered === 'CONFLICT' ? 409 :
      registered === 'INVALID_INPUT' ? 422 : registered === 'RATE_LIMITED' ? 429 : 503;
  if (status === 429) return Response.json({ request_id: crypto.randomUUID(), code: registered,
    message: '操作过于频繁，请稍后重试', retryable: true },
  { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  return fallback(registered, status);
}

function validSanction(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const s = value as Record<string, unknown>;
  return typeof s.id === 'string' && uuid.test(s.id) &&
    (s.subject_id === null || typeof s.subject_id === 'string' && uuid.test(s.subject_id)) &&
    (s.target_id === null || typeof s.target_id === 'string' && uuid.test(s.target_id)) &&
    ['function', 'temporary', 'permanent'].includes(String(s.type)) &&
    Array.isArray(s.functions) && s.functions.every(value => typeof value === 'string') &&
    typeof s.starts_at === 'string' && timestamp.test(s.starts_at) &&
    (s.ends_at === null || typeof s.ends_at === 'string' && timestamp.test(s.ends_at)) &&
    typeof s.reason === 'string' && ['active', 'revoked', 'expired'].includes(String(s.state)) &&
    Array.isArray(s.allowed_actions) && s.allowed_actions.every(value => value === 'appeal');
}

function validAppeal(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const a = value as Record<string, unknown>;
  return typeof a.id === 'string' && uuid.test(a.id) && typeof a.sanction_id === 'string' &&
    uuid.test(a.sanction_id) && typeof a.statement === 'string' &&
    ['awaiting_independent_review', 'reviewing', 'decided'].includes(String(a.state)) &&
    (a.decision === null || a.decision === 'uphold' || a.decision === 'overturn') &&
    ['pending', 'succeeded', 'failed'].includes(String(a.execution_state)) &&
    typeof a.created_at === 'string' && timestamp.test(a.created_at) &&
    Array.isArray(a.allowed_actions) && a.allowed_actions.every(value => typeof value === 'string');
}

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('INVALID_INPUT');
  const bytes = Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)),
    character => character.charCodeAt(0));
  if (encode(bytes) !== value) throw new Error('INVALID_INPUT');
  return bytes;
}
async function key(secret: string) {
  if (!secret) throw new Error('SERVICE_UNAVAILABLE');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function readCursor(value: string, scope: CursorScope, secret: string): Promise<PageCursor> {
  if (value.length > 2048) throw new Error('INVALID_INPUT');
  const envelope = JSON.parse(new TextDecoder().decode(decode(value)));
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope) || Object.keys(envelope).length !== 2 ||
      typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string' ||
      !await crypto.subtle.verify('HMAC', await key(secret), decode(envelope.signature), encoder.encode(envelope.payload)))
    throw new Error('INVALID_INPUT');
  const cursor = JSON.parse(envelope.payload);
  if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor) || Object.keys(cursor).length !== 8 ||
      typeof cursor.position !== 'string' || !uuid.test(cursor.position) ||
      typeof cursor.created_at !== 'string' || !timestamp.test(cursor.created_at) ||
      typeof cursor.config_version !== 'string' || !cursor.config_version.length || cursor.config_version.length > 256 ||
      Object.entries(scope).some(([name, expected]) => cursor[name] !== expected)) throw new Error('INVALID_INPUT');
  return cursor;
}
async function writeCursor(cursor: PageCursor, secret: string): Promise<string> {
  const payload = JSON.stringify(cursor);
  const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload))));
  const value = encode(encoder.encode(JSON.stringify({ payload, signature })));
  if (value.length > 2048) throw new Error('SERVICE_UNAVAILABLE');
  return value;
}

async function listOwn(request: Request, kind: 'sanctions' | 'appeals', failure: Failure): Promise<Response> {
  if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED', 405);
  const url = new URL(request.url), limit = url.searchParams.get('limit') ?? '20';
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '', secret = Deno.env.get('JWT_SECRET') || '';
  if ([...url.searchParams.keys()].some(name => !['limit', 'cursor'].includes(name)) ||
      ['limit', 'cursor'].some(name => url.searchParams.getAll(name).length > 1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) ||
      (url.searchParams.has('cursor') && !url.searchParams.get('cursor'))) return failure('INVALID_INPUT', 422);
  if (!['dev', 'test', 'production'].includes(environment) || !secret) return failure('SERVICE_UNAVAILABLE', 503);
  return admittedOutput(failure, async tx => {
    let actor;
    try { actor = await principal(request); }
    catch (error) { return fail(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
      ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
    if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
    const scope: CursorScope = { scope: kind === 'sanctions' ? 'own-sanctions-v1' : 'own-appeals-v1',
      subject: actor.account, session: actor.session, environment, limit: Number(limit) };
    let cursor: PageCursor | undefined;
    if (url.searchParams.has('cursor')) {
      try { cursor = await readCursor(url.searchParams.get('cursor')!, scope, secret); }
      catch { return failure('INVALID_INPUT', 422); }
    }
    const version = await responseConfigVersion(tx);
    if (cursor && cursor.config_version !== version) return failure('INVALID_INPUT', 422);
    const [row] = kind === 'sanctions'
      ? await tx`SELECT core.list_own_sanctions_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment},${Number(limit)},${cursor?.created_at ?? null}::timestamptz,
        ${cursor?.position ?? null}::uuid) AS result`
      : await tx`SELECT core.list_own_appeals_result(${actor.account}::uuid,${actor.session}::uuid,
        ${environment},${Number(limit)},${cursor?.created_at ?? null}::timestamptz,
        ${cursor?.position ?? null}::uuid) AS result`;
    const result = row.result;
    if (result?.code !== 'OK') return fail(result?.code, failure);
    const validate = kind === 'sanctions' ? validSanction : validAppeal;
    if (!Array.isArray(result.items) || result.items.length > Number(limit) ||
        result.items.some((item: unknown) => !validate(item)) || typeof result.has_more !== 'boolean')
      return failure('SERVICE_UNAVAILABLE', 503);
    let nextCursor: string | null = null;
    if (result.has_more) {
      if (typeof result.next_id !== 'string' || !uuid.test(result.next_id) ||
          typeof result.next_created_at !== 'string' || !timestamp.test(result.next_created_at))
        return failure('SERVICE_UNAVAILABLE', 503);
      nextCursor = await writeCursor({ ...scope, position: result.next_id,
        created_at: result.next_created_at, config_version: version }, secret);
    }
    return jsonOutput(tx, { items: result.items, next_cursor: nextCursor, has_more: result.has_more });
  });
}

export const listOwnSanctions = (request: Request, failure: Failure) => listOwn(request, 'sanctions', failure);
export const listOwnAppeals = (request: Request, failure: Failure) => listOwn(request, 'appeals', failure);

export async function createAppeal(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 405);
  if (new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return fail(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  let input: Record<string, unknown>;
  try { input = await readCommandJson(request, 32768); }
  catch { return failure('INVALID_INPUT', 422); }
  if (Object.keys(input).length !== 4 ||
      Object.keys(input).some(name => !['operation_id', 'sanction_id', 'statement', 'media_refs'].includes(name)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      typeof input.sanction_id !== 'string' || !uuid.test(input.sanction_id) ||
      typeof input.statement !== 'string' || input.statement.includes('\u0000') ||
      !Array.isArray(input.media_refs) || input.media_refs.length > 9 ||
      input.media_refs.some(item => typeof item !== 'string' || !uuid.test(item))) return failure('INVALID_INPUT', 422);
  const media = (input.media_refs as string[]).map(value => value.toLowerCase());
  const statement = input.statement.replace(/\r\n?/g, '\n');
  const visibleLength = countGraphemes(statement);
  if (!statement.trim() || [...statement].length > 10000 || visibleLength > 10000 ||
      new Set(media).size !== media.length) return failure('INVALID_INPUT', 422);
  const command = { operation_id: input.operation_id.toLowerCase(), sanction_id: input.sanction_id.toLowerCase(),
    statement, media_refs: media };
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(command))));
  const digest = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const [record] = await tx`SELECT core.create_appeal_result(${actor.account}::uuid,
        ${actor.session}::uuid,${environment},${JSON.stringify(command)}::text::jsonb,
        ${digest},${visibleLength}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validAppeal(record.result.data)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: await responseConfigVersion(tx) };
    });
    if (row.result?.code !== 'OK') return fail(row.result?.code, failure);
    if (!row.config_version || !validAppeal(row.result.data)) return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: row.result.data },
      { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}
