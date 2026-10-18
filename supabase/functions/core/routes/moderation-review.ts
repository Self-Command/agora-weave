import { database } from '../database.ts';
import type { Principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';
import { admittedOutput, jsonOutput, responseConfigVersion, type Failure } from '../output.ts';
import { adminDigest, adminEnvironment, adminFailure, adminKeys, adminReason, adminUuid } from '../identity/admin-policy.ts';

const validDecision = (value: unknown): value is 'approve' | 'reject' => value === 'approve' || value === 'reject';
const validVersion = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;

function directOutput(data: unknown, configVersion: string): Response {
  return Response.json({ request_id: crypto.randomUUID(), config_version: configVersion, data },
    { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff' } });
}

/** Only the current management principal reaches these database entry points. */
export async function moderationReview(request: Request, path: string, actor: Principal | null,
  failure: Failure): Promise<Response> {
  if (!actor || actor.audience !== 'authenticated') return adminFailure('SESSION_INVALID');
  const env = adminEnvironment();
  if (!env) return adminFailure('SERVICE_UNAVAILABLE');
  const url = new URL(request.url);
  if (path === '/admin/contents' || path === '/admin/cases') {
    if (request.method !== 'GET') return adminFailure('METHOD_NOT_ALLOWED');
    const limit = url.searchParams.get('limit') ?? '20';
    const cursor = url.searchParams.get('cursor');
    if ([...url.searchParams.keys()].some(key => !['limit', 'cursor'].includes(key)) ||
        url.searchParams.getAll('limit').length > 1 || url.searchParams.getAll('cursor').length > 1 ||
        !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || (cursor !== null && !adminUuid.test(cursor)))
      return adminFailure('INVALID_INPUT');
    return admittedOutput(failure, async tx => {
      const [row] = path === '/admin/contents'
        ? await tx`SELECT core.admin_review_page_result(${actor.account}::uuid,
          ${actor.session}::uuid,${env},${actor.aal},${Number(limit)},${cursor}::uuid) AS result`
        : await tx`SELECT core.admin_cases_page_result(${actor.account}::uuid,
          ${actor.session}::uuid,${env},${actor.aal},${Number(limit)},${cursor}::uuid) AS result`;
      return row.result?.code === 'OK' ? jsonOutput(tx, row.result.data) : adminFailure(row.result?.code || 'SERVICE_UNAVAILABLE');
    });
  }
  const previewMatch = /^\/admin\/revisions\/([0-9a-f-]+)\/decision-previews$/i.exec(path);
  const decisionMatch = /^\/admin\/revisions\/([0-9a-f-]+)\/decision$/i.exec(path);
  const revision = previewMatch?.[1] || decisionMatch?.[1];
  if (!revision || !adminUuid.test(revision)) return adminFailure('NOT_FOUND');
  if (request.method !== 'POST') return adminFailure('METHOD_NOT_ALLOWED');
  if (url.search) return adminFailure('INVALID_INPUT');
  let input: Record<string, unknown>;
  try { input = await readCommandJson(request, 4096); }
  catch { return adminFailure('INVALID_INPUT'); }
  if (typeof input.operation_id !== 'string' || !adminUuid.test(input.operation_id) ||
      !validDecision(input.decision) || !adminReason(input.reason)) return adminFailure('INVALID_INPUT');
  const operation = input.operation_id;
  if (previewMatch) {
    if (!adminKeys(input, ['operation_id', 'decision', 'reason'])) return adminFailure('INVALID_INPUT', operation);
    try {
      return await database().begin(async tx => {
        const [row] = await tx`SELECT core.admin_review_preview_result(${actor.account}::uuid,
          ${actor.session}::uuid,${env},${actor.aal},${revision}::uuid,${operation}::uuid,
          ${input.decision as string},${input.reason as string}) AS result`;
        if (row.result?.code !== 'OK') return adminFailure(row.result?.code || 'SERVICE_UNAVAILABLE', operation);
        return directOutput(row.result.data, await responseConfigVersion(tx));
      });
    } catch { return adminFailure('SERVICE_UNAVAILABLE', operation); }
  }
  if (!adminKeys(input, ['operation_id', 'decision', 'reason', 'base_version', 'preview_id',
    'preview_digest', 'stepup_id']) || !validVersion(input.base_version) ||
    typeof input.preview_id !== 'string' || !adminUuid.test(input.preview_id) ||
    typeof input.preview_digest !== 'string' || !adminDigest.test(input.preview_digest) ||
    typeof input.stepup_id !== 'string' || !adminUuid.test(input.stepup_id))
    return adminFailure('INVALID_INPUT', operation);
  try {
    return await database().begin(async tx => {
      const [row] = await tx`SELECT core.admin_review_decision_result(${actor.account}::uuid,
        ${actor.session}::uuid,${env},${actor.aal},${revision}::uuid,${operation}::uuid,
        ${input.decision as string},${input.reason as string},${input.base_version as number}::bigint,
        ${input.preview_id}::uuid,${input.preview_digest},${input.stepup_id}::uuid) AS result`;
      if (row.result?.code !== 'OK') return adminFailure(row.result?.code || 'SERVICE_UNAVAILABLE', operation);
      return directOutput(row.result.data, await responseConfigVersion(tx));
    });
  } catch { return adminFailure('SERVICE_UNAVAILABLE', operation); }
}
