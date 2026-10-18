import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { outputIsOpen, responseConfigVersion, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';
import { likeOperationCommand } from './discussion-input.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const knownErrors = new Set(['SESSION_INVALID', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT',
  'RATE_LIMITED', 'CONFIG_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'INVALID_INPUT']);

function status(code: string): number {
  return code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 :
    code === 'CONFLICT' ? 409 : code === 'RATE_LIMITED' ? 429 : code === 'INVALID_INPUT' ? 422 : 503;
}

function validReceipt(value: unknown, target: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  return Object.keys(receipt).length === 3 && receipt.target_id === target.toLowerCase() &&
    typeof receipt.active === 'boolean' && Number.isSafeInteger(receipt.count) && Number(receipt.count) >= 0;
}

export async function resourceLike(request: Request, resourceId: string, failure: Failure): Promise<Response> {
  if (!['GET', 'PUT', 'DELETE'].includes(request.method)) return failure('METHOD_NOT_ALLOWED', 405);
  if (!uuid.test(resourceId) || new URL(request.url).search) return failure('INVALID_INPUT', 422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev', 'test', 'production'].includes(environment)) return failure('SERVICE_UNAVAILABLE', 503);
  let actor;
  try { actor = await principal(request); }
  catch (error) { return failure(error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID', error instanceof Error && error.message === 'SERVICE_UNAVAILABLE' ? 503 : 401); }
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID', 401);
  const authenticatedActor = actor;
  if (request.method === 'GET') {
    try {
      return await database().begin(async tx => {
        await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
        if (!await outputIsOpen(tx)) return failure('SERVICE_UNAVAILABLE',503);
        const [row] = await tx`SELECT core.read_resource_like_result(${authenticatedActor.account}::uuid,
          ${authenticatedActor.session}::uuid,${environment},${resourceId}::uuid) AS result`;
        if (row.result?.code !== 'OK') {
          const code = knownErrors.has(row.result?.code) ? row.result.code : 'SERVICE_UNAVAILABLE';
          return failure(code,status(code));
        }
        const receipt=row.result.data;
        if (!validReceipt(receipt,resourceId)) return failure('SERVICE_UNAVAILABLE',503);
        return Response.json({request_id:crypto.randomUUID(),config_version:await responseConfigVersion(tx),data:receipt},
          {status:200,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      });
    } catch { return failure('SERVICE_UNAVAILABLE',503); }
  }
  let input;
  try { input = await readCommandJson(request, 2048); }
  catch { return failure('INVALID_INPUT', 422); }
  const command = likeOperationCommand(input);
  if (!command) return failure('INVALID_INPUT', 422);
  const desiredActive = request.method === 'PUT';
  const payload = JSON.stringify({ operation_id: command.operation_id, target_id: resourceId.toLowerCase(), active: desiredActive });
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))]
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const row: { result: { code: string; data?: unknown }; config_version?: string } = await database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(17013,1)`;
      if (!await outputIsOpen(tx)) return { result: { code: 'SERVICE_UNAVAILABLE' } };
      const [record] = await tx`SELECT core.set_resource_like_result(${authenticatedActor.account}::uuid,
        ${authenticatedActor.session}::uuid,${environment},${resourceId}::uuid,${command.operation_id}::uuid,
        ${digest},${desiredActive}) AS result`;
      if (record.result?.code !== 'OK') return record;
      if (!validReceipt(record.result.data, resourceId)) throw new Error('SERVICE_UNAVAILABLE');
      return { result: record.result, config_version: await responseConfigVersion(tx) };
    });
    if (row.result?.code !== 'OK') {
      const code = knownErrors.has(row.result?.code) ? row.result.code : 'SERVICE_UNAVAILABLE';
      if (code === 'RATE_LIMITED') return Response.json({ request_id: crypto.randomUUID(), code,
        message: '操作过于频繁，请稍后重试', retryable: true },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
      return failure(code, status(code));
    }
    if (!row.config_version || !validReceipt(row.result.data, resourceId)) return failure('SERVICE_UNAVAILABLE', 503);
    return Response.json({ request_id: crypto.randomUUID(), config_version: row.config_version, data: row.result.data },
      { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
}
