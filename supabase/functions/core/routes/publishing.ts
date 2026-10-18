import { countGraphemes } from '../../../../packages/contracts/src/vendor/unicode-segmenter/grapheme.js';
import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { outputIsOpen, type Failure } from '../output.ts';
import { resolveCurrentConfiguration } from '../config/effective.ts';
import { readCommandJson } from '../request-body.ts';
import { imagePostCommand, textPostCommand, type ImagePostCommand, type TextPostCommand } from './publishing-input.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const encoder = new TextEncoder();

const knownErrors = new Set(['SESSION_INVALID', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT',
  'RATE_LIMITED', 'CONFIG_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'INVALID_INPUT']);

async function payloadHash(payload: TextPostCommand | ImagePostCommand): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(payload))));
  return [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
}

function errorStatus(code: string): number {
  if (code === 'SESSION_INVALID') return 401;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  if (code === 'CONFLICT') return 409;
  if (code === 'RATE_LIMITED') return 429;
  if (code === 'CONFIG_UNAVAILABLE' || code === 'SERVICE_UNAVAILABLE') return 503;
  return 422;
}

function validReceipt(value: unknown, operationId: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  return result.operation_id === operationId && typeof result.resource_id === 'string' && uuid.test(result.resource_id) &&
    typeof result.revision_id === 'string' && uuid.test(result.revision_id) &&
    ['pending', 'approved', 'rejected'].includes(String(result.review_state)) &&
    ['preparing', 'awaiting_review', 'published', 'rejected', 'failed', 'cancelled'].includes(String(result.publication_state)) &&
    Number.isSafeInteger(result.row_version) && Number(result.row_version) >= 1 && Object.keys(result).length === 6;
}

/** POST /posts. SQL owns the current-policy check and the atomic content + operation write. */
export async function createPost(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 405);
  if (new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failure(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', error instanceof Error && error.message === 'SERVICE_UNAVAILABLE' ? 503 : 401); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  const authenticatedActor = actor;
  let input;
  try { input = await readCommandJson(request, 65536); }
  catch { return failure('INVALID_INPUT', 422); }
  const command = input.type === 'images' ? imagePostCommand(input) : textPostCommand(input);
  if (!command) return failure('INVALID_INPUT', 422);
  const digest = await payloadHash(command);
  const visibleCount = countGraphemes(command.body);
  const release = request.headers.get('X-Client-Release') || '0.0.0';
  if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT', 422);

  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const configuration = await resolveCurrentConfiguration(tx, authenticatedActor.account,
        authenticatedActor.session, environment, 'api', release);
      const limit = configuration?.values['content.body_limit'];
      if (!configuration || !Number.isSafeInteger(limit) || Number(limit) < 1)
        return { result: { code: 'CONFIG_UNAVAILABLE' } };
      const effectiveLimit = Math.min(Number(limit), 65536);
      const imageLimit = configuration.values['media.image_count'];
      const imageBytes = configuration.values['media.image_bytes'];
      if (command.type === 'images' && (!Number.isSafeInteger(imageLimit) || Number(imageLimit)<1 ||
          !Number.isSafeInteger(imageBytes) || Number(imageBytes)<1))
        return { result: { code: 'CONFIG_UNAVAILABLE' } };
      const [record] = command.type === 'images'
        ? await tx`SELECT core.create_image_post_result(${authenticatedActor.account}::uuid,
          ${authenticatedActor.session}::uuid,${environment},${JSON.stringify(command)}::text::jsonb,${digest},
          ${visibleCount},${effectiveLimit},${Math.min(Number(imageLimit),9)},
          ${Math.min(Number(imageBytes),10_000_000)},${configuration.version}) AS result`
        : await tx`SELECT core.create_text_post_result(${authenticatedActor.account}::uuid,
          ${authenticatedActor.session}::uuid,${environment},${JSON.stringify(command)}::text::jsonb,${digest},
          ${visibleCount},${effectiveLimit},${configuration.version}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validReceipt(record.result.data, command.operation_id)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: configuration.version };
    });
    const result = row.result;
    if (result?.code !== 'OK') {
      const code = knownErrors.has(result?.code) ? result.code : 'SERVICE_UNAVAILABLE';
      if (code === 'RATE_LIMITED') return Response.json({ request_id: crypto.randomUUID(), code,
        message: '操作过于频繁，请稍后重试', retryable: true },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
      return failure(code, errorStatus(code));
    }
    if (!validReceipt(result.data, command.operation_id) || typeof row.config_version !== 'string')
      return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: result.data },
      { status: 202, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}
