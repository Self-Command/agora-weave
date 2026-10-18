import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { outputIsOpen, responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const knownErrors = new Set(['SESSION_INVALID', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT',
  'RATE_LIMITED', 'SERVICE_UNAVAILABLE', 'INVALID_INPUT']);

function status(code: string): number {
  return code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 :
    code === 'CONFLICT' ? 409 : code === 'RATE_LIMITED' ? 429 : code === 'INVALID_INPUT' ? 422 : 503;
}

function validReceipt(value: unknown, operationId: string, target: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  return Object.keys(receipt).length === 4 && receipt.operation_id === operationId &&
    receipt.state === 'succeeded' && receipt.target_ref === target &&
    Array.isArray(receipt.allowed_actions) && receipt.allowed_actions.length === 0;
}

export async function accountBlock(request: Request, accountId: string, failure: Failure): Promise<Response> {
  if (!['PUT', 'DELETE'].includes(request.method)) return failure('METHOD_NOT_ALLOWED', 405);
  if (!uuid.test(accountId) || new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const target = accountId.toLowerCase();
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failure(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', error instanceof Error && error.message === 'SERVICE_UNAVAILABLE' ? 503 : 401); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  let input;
  try { input = await readCommandJson(request, 2048); }
  catch { return failure('INVALID_INPUT', 422); }
  if (Object.keys(input).length !== 1 || typeof input.operation_id !== 'string' || !uuid.test(input.operation_id)) {
    return failure('INVALID_INPUT', 422);
  }
  const operationId = input.operation_id.toLowerCase();
  const desiredActive = request.method === 'PUT';
  const payload = JSON.stringify({ operation_id: operationId, target_id: target, active: desiredActive });
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))]
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const [record] = await tx`SELECT core.set_account_block_result(${actor.account}::uuid,
        ${actor.session}::uuid,${environment},${target}::uuid,${operationId}::uuid,
        ${digest},${desiredActive}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validReceipt(record.result.data, operationId, target)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: await responseConfigVersion(tx) };
    });
    if (row.result?.code !== 'OK') {
      const code = knownErrors.has(row.result?.code) ? row.result.code : 'SERVICE_UNAVAILABLE';
      return failure(code, status(code));
    }
    if (!row.config_version || !validReceipt(row.result.data, operationId, target)) return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: row.result.data },
      { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}
