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
type Report = { id: string; target_ref: string; state: string; public_feedback: string | null; created_at: string };
type CursorScope = { scope: 'own-reports-v1'; subject: string; session: string; environment: string; limit: number };
type ReportCursor = CursorScope & { position: string; created_at: string; config_version: string };

function fail(code: unknown, failure: Failure): Response {
  const registered = typeof code === 'string' && knownErrors.has(code) ? code : 'SERVICE_UNAVAILABLE';
  const status = registered === 'SESSION_INVALID' ? 401 : registered === 'FORBIDDEN' ? 403 :
    registered === 'NOT_FOUND' ? 404 : registered === 'CONFLICT' ? 409 :
      registered === 'INVALID_INPUT' ? 422 : registered === 'RATE_LIMITED' ? 429 : 503;
  if (status === 429) return Response.json({ request_id: crypto.randomUUID(), code: registered,
    message: '操作过于频繁，请稍后重试', retryable: true },
  { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  return failure(registered, status);
}

function validReport(value: unknown): value is Report {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const report = value as Record<string, unknown>;
  return Object.keys(report).length === 5 && typeof report.id === 'string' && uuid.test(report.id) &&
    typeof report.target_ref === 'string' && uuid.test(report.target_ref) &&
    ['pending', 'reviewing', 'processed', 'not_actionable'].includes(String(report.state)) &&
    (report.public_feedback === null || typeof report.public_feedback === 'string') &&
    typeof report.created_at === 'string' && timestamp.test(report.created_at);
}

function parseCommand(input: Record<string, unknown>) {
  if (Object.keys(input).some(name => !['operation_id', 'target_kind', 'target_id', 'reason', 'evidence_refs'].includes(name)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      typeof input.target_id !== 'string' || !uuid.test(input.target_id) ||
      !['account', 'post', 'comment', 'message'].includes(String(input.target_kind)) ||
      typeof input.reason !== 'string' || input.reason.includes('\u0000') ||
      input.evidence_refs !== undefined && (!Array.isArray(input.evidence_refs) || input.evidence_refs.length > 9 ||
        input.evidence_refs.some(item => typeof item !== 'string' || !uuid.test(item)))) return null;
  const evidenceRefs = (input.evidence_refs as string[] | undefined)?.map(reference => reference.toLowerCase()) ?? [];
  if (new Set(evidenceRefs).size !== evidenceRefs.length) return null;
  const reason = input.reason.replace(/\r\n?/g, '\n');
  if (!reason.trim() || [...reason].length > 2000) return null;
  const visibleLength = countGraphemes(reason);
  if (visibleLength < 1 || visibleLength > 2000) return null;
  return { command: { operation_id: input.operation_id.toLowerCase(), target_kind: input.target_kind as string,
    target_id: input.target_id.toLowerCase(), reason, evidence_refs: evidenceRefs }, visibleLength };
}

async function hash(value: unknown): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(value))));
  return [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('');
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
async function readCursor(value: string, scope: CursorScope, secret: string): Promise<ReportCursor> {
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
async function writeCursor(cursor: ReportCursor, secret: string): Promise<string> {
  const payload = JSON.stringify(cursor);
  const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload))));
  const value = encode(encoder.encode(JSON.stringify({ payload, signature })));
  if (value.length > 2048) throw new Error('SERVICE_UNAVAILABLE');
  return value;
}

export async function createReport(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 405);
  if (new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return fail(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  let input;
  try { input = await readCommandJson(request, 16384); }
  catch { return failure('INVALID_INPUT', 422); }
  const parsed = parseCommand(input);
  if (!parsed) return failure('INVALID_INPUT', 422);
  const digest = await hash(parsed.command);
  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const [record] = await tx`SELECT core.create_report_result(${actor.account}::uuid,
        ${actor.session}::uuid,${environment},${JSON.stringify(parsed.command)}::text::jsonb,
        ${digest},${parsed.visibleLength}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validReport(record.result.data)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: await responseConfigVersion(tx) };
    });
    if (row.result?.code !== 'OK') return fail(row.result?.code, failure);
    if (!row.config_version || !validReport(row.result.data)) return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: row.result.data },
      { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}

export function listOwnReports(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'GET') return Promise.resolve(failure('METHOD_NOT_ALLOWED', 405));
  const url = new URL(request.url), limit = url.searchParams.get('limit') ?? '20';
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '', secret = Deno.env.get('JWT_SECRET') || '';
  if ([...url.searchParams.keys()].some(name => !['limit', 'cursor'].includes(name)) ||
      ['limit', 'cursor'].some(name => url.searchParams.getAll(name).length > 1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) ||
      (url.searchParams.has('cursor') && !url.searchParams.get('cursor'))) return Promise.resolve(failure('INVALID_INPUT', 422));
  if (!['dev', 'test', 'production'].includes(environment) || !secret)
    return Promise.resolve(failure('SERVICE_UNAVAILABLE', 503));
  return admittedOutput(failure, async tx => {
    let actor;
    try { actor = await principal(request); }
    catch (error) { return fail(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
      ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
    if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
    const scope: CursorScope = { scope: 'own-reports-v1', subject: actor.account, session: actor.session,
      environment, limit: Number(limit) };
    let cursor: ReportCursor | undefined;
    if (url.searchParams.has('cursor')) {
      try { cursor = await readCursor(url.searchParams.get('cursor')!, scope, secret); }
      catch { return failure('INVALID_INPUT', 422); }
    }
    const activeVersion = await responseConfigVersion(tx);
    if (cursor && cursor.config_version !== activeVersion) return failure('INVALID_INPUT', 422);
    const [row] = await tx`SELECT core.list_own_reports_result(${actor.account}::uuid,
      ${actor.session}::uuid,${environment},${Number(limit)},
      ${cursor?.position ?? null}::uuid,${cursor?.created_at ?? null}::timestamptz) AS result`;
    const result = row.result;
    if (result?.code !== 'OK') return fail(result?.code, failure);
    if (!Array.isArray(result.items) || result.items.length > Number(limit) ||
        result.items.some((item: unknown) => !validReport(item)) || typeof result.has_more !== 'boolean')
      return failure('SERVICE_UNAVAILABLE', 503);
    let nextCursor: string | null = null;
    if (result.has_more) {
      if (typeof result.next_id !== 'string' || !uuid.test(result.next_id) ||
          typeof result.next_created_at !== 'string' || !timestamp.test(result.next_created_at))
        return failure('SERVICE_UNAVAILABLE', 503);
      nextCursor = await writeCursor({ ...scope, position: result.next_id,
        created_at: result.next_created_at, config_version: activeVersion }, secret);
    }
    return jsonOutput(tx, { items: result.items, next_cursor: nextCursor, has_more: result.has_more });
  });
}
