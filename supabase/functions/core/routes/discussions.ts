import { countGraphemes } from '../../../../packages/contracts/src/vendor/unicode-segmenter/grapheme.js';
import { database } from '../database.ts';
import { resolveCurrentConfiguration } from '../config/effective.ts';
import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, outputIsOpen, responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';
import { readCommentCursor, writeCommentCursor, type CommentCursor, type CommentScope } from './discussion-cursor.ts';
import { textCommentCommand } from './discussion-input.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;
const score = /^-?[0-9]{1,20}(?:\.[0-9]{1,12})?$/;
const knownErrors = new Set(['SESSION_INVALID', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT',
  'RATE_LIMITED', 'CONFIG_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'INVALID_INPUT']);
const text = new TextEncoder();

function failureFor(code: unknown, fallback: Failure): Response {
  const registered = typeof code === 'string' && knownErrors.has(code) ? code : 'SERVICE_UNAVAILABLE';
  const status = registered === 'SESSION_INVALID' ? 401 : registered === 'FORBIDDEN' ? 403 :
    registered === 'NOT_FOUND' ? 404 : registered === 'CONFLICT' ? 409 : registered === 'INVALID_INPUT' ? 422 :
    registered === 'RATE_LIMITED' ? 429 : 503;
  if (status === 429) return Response.json({ request_id: crypto.randomUUID(), code: registered,
    message: '操作过于频繁，请稍后重试', retryable: true },
  { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  return fallback(registered, status);
}

function validReceipt(value: unknown, operationId: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  return Object.keys(receipt).length === 6 && receipt.operation_id === operationId &&
    typeof receipt.resource_id === 'string' && uuid.test(receipt.resource_id) &&
    typeof receipt.revision_id === 'string' && uuid.test(receipt.revision_id) &&
    ['pending', 'approved', 'rejected'].includes(String(receipt.review_state)) &&
    ['preparing', 'awaiting_review', 'published', 'rejected', 'failed', 'cancelled'].includes(String(receipt.publication_state)) &&
    Number.isSafeInteger(receipt.row_version) && Number(receipt.row_version) >= 1;
}

async function hash(value: unknown): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', text.encode(JSON.stringify(value))));
  return [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createComment(request: Request, postId: string, failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 405);
  if (!uuid.test(postId) || new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failureFor(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  const authenticatedActor = actor;
  let input;
  try { input = await readCommandJson(request, 65536); }
  catch { return failure('INVALID_INPUT', 422); }
  const command = textCommentCommand(input);
  if (!command) return failure('INVALID_INPUT', 422);
  const visibleCount = countGraphemes(command.body);
  const digest = await hash({ post_id: postId.toLowerCase(), ...command });
  const release = request.headers.get('X-Client-Release') || '0.0.0';
  if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT', 422);
  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const configuration = await resolveCurrentConfiguration(tx, authenticatedActor.account,
        authenticatedActor.session, environment, 'api', release);
      const limit = configuration?.values['comments.body_limit'];
      if (!configuration || !Number.isSafeInteger(limit) || Number(limit) < 1)
        return { result: { code: 'CONFIG_UNAVAILABLE' } };
      const effectiveLimit = Math.min(Number(limit), 65536);
      const [record] = await tx`SELECT core.create_text_comment_result(${authenticatedActor.account}::uuid,
        ${authenticatedActor.session}::uuid,${environment},${postId}::uuid,${JSON.stringify(command)}::text::jsonb,
        ${digest},${visibleCount},${effectiveLimit},${configuration.version}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validReceipt(record.result.data, command.operation_id)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: configuration.version };
    });
    if (row.result?.code !== 'OK') return failureFor(row.result?.code, failure);
    if (!row.config_version || !validReceipt(row.result.data, command.operation_id)) return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: row.result.data },
      { status: 202, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}

export function listComments(request: Request, postId: string, failure: Failure): Promise<Response> {
  if (request.method !== 'GET') return Promise.resolve(failure('METHOD_NOT_ALLOWED', 405));
  const url = new URL(request.url), limit = url.searchParams.get('limit') ?? '20';
  const sort = url.searchParams.get('sort') ?? 'latest';
  const release = request.headers.get('X-Client-Release') || '';
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '', secret = Deno.env.get('JWT_SECRET') || '';
  if (!uuid.test(postId) || [...url.searchParams.keys()].some(name => !['limit', 'cursor', 'sort'].includes(name)) ||
      ['limit', 'cursor', 'sort'].some(name => url.searchParams.getAll(name).length > 1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || !['latest', 'hot'].includes(sort) ||
      !/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return Promise.resolve(failure('INVALID_INPUT', 422));
  if (!['dev', 'test', 'production'].includes(environment) || !secret) return Promise.resolve(failure('SERVICE_UNAVAILABLE', 503));
  return admittedOutput(failure, async tx => {
    let actor;
    try { actor = await principal(request); }
    catch (error) { return failureFor(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
      ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', failure); }
    if (actor?.audience === 'share-read') return failure('FORBIDDEN', 403);
    const scope: CommentScope = { scope: 'post-comments-v1', post_id: postId.toLowerCase(), sort: sort as CommentScope['sort'],
      subject: actor?.account ?? null, session: actor?.session ?? null, environment, limit: Number(limit), client_release: release };
    let cursor: CommentCursor | undefined;
    if (url.searchParams.has('cursor')) {
      try { cursor = await readCommentCursor(url.searchParams.get('cursor')!, scope, secret); }
      catch { return failure('INVALID_INPUT', 422); }
    }
    const [row] = await tx`SELECT core.list_post_comments_result(${actor?.account ?? null}::uuid,
      ${actor?.session ?? null}::uuid,${environment},${postId}::uuid,${sort},${Number(limit)},
      ${cursor?.position ?? null}::uuid,${cursor?.created_at ?? null}::timestamptz,
      ${cursor?.score ?? null}::numeric,${cursor?.config_version ?? null},${release}) AS result`;
    const result = row.result;
    if (result?.code !== 'OK') return failureFor(result?.code, failure);
    const activeVersion = await responseConfigVersion(tx);
    if (result.config_version !== activeVersion || !Array.isArray(result.items) || result.items.length > Number(limit) ||
        typeof result.has_more !== 'boolean' || result.items.some((item: unknown) => !item || typeof item !== 'object'))
      return failure('SERVICE_UNAVAILABLE', 503);
    let nextCursor: string | null = null;
    if (result.has_more) {
      if (typeof result.next_id !== 'string' || !uuid.test(result.next_id) ||
          typeof result.next_created_at !== 'string' || !timestamp.test(result.next_created_at) ||
          (sort === 'latest' ? result.next_score !== null : typeof result.next_score !== 'string' || !score.test(result.next_score)))
        return failure('SERVICE_UNAVAILABLE', 503);
      nextCursor = await writeCommentCursor({ ...scope, position: result.next_id,
        created_at: result.next_created_at, score: result.next_score, config_version: activeVersion }, secret);
    }
    return jsonOutput(tx, { items: result.items, next_cursor: nextCursor, has_more: result.has_more });
  });
}
