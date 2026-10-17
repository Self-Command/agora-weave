import { admittedOutput, jsonOutput, type Failure } from '../output.ts';
import { principal, type Principal } from '../identity.ts';
import { registrationDocuments } from '../routes/auth.ts';

const kinds = ['community_rules','privacy','terms','processing_notice','help'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Selection = { kind: string | null; locale: string; surface: string; stableKey: string | null };

function selection(request: Request,actor: Principal | null,currentSet: boolean,failure: Failure): Selection | Response {
  const query = new URL(request.url).searchParams;
  const allowed = currentSet ? ['kind','locale','surface','stable_key'] : ['kind','locale','surface'];
  if ([...query.keys()].some(key => !allowed.includes(key) || query.getAll(key).length !== 1)) return failure('INVALID_INPUT',422);
  const kind = query.get('kind') ?? (currentSet ? 'terms' : null);
  const locale = query.get('locale') ?? 'zh-CN';
  const surface = query.get('surface') ?? (actor?.audience === 'share-read' ? 'share' : 'app');
  const stableKey = query.get('stable_key');
  if (kind !== null && !kinds.includes(kind) || !/^[a-z]{2,8}(-[A-Z]{2,8})?$/.test(locale) ||
    !['app','share','admin'].includes(surface) || stableKey !== null && !/^[a-z][a-z0-9_.-]{1,127}$/i.test(stableKey)) {
    return failure('INVALID_INPUT',422);
  }
  if (surface === 'admin' || actor?.audience === 'share-read' && surface !== 'share' ||
    actor?.audience === 'authenticated' && surface !== 'app') return failure('FORBIDDEN',403);
  return { kind,locale,surface,stableKey };
}

const resultStatus = (code: string) => code === 'NOT_FOUND' ? 404 : code === 'INVALID_INPUT' ? 422 : 503;

export async function readCurrentDocuments(request: Request,failure: Failure) {
  if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED',405);
  const actor = await principal(request);
  const chosen = selection(request,actor,true,failure);
  if (chosen instanceof Response) return chosen;
  // Preserve the existing registration set and its required-terms failure semantics.
  if (chosen.stableKey === null && chosen.kind === 'terms' && chosen.surface === 'app' && chosen.locale === 'zh-CN') {
    return registrationDocuments(request,failure);
  }
  return admittedOutput(failure,async tx => {
    if (actor) {
      const [context] = await tx`SELECT core.policy_context_result(${actor.account}::uuid,${actor.session}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
      if (context.result.code !== 'OK') return failure(context.result.code,context.result.code === 'SESSION_INVALID' ? 401 : 503);
    }
    const [row] = await tx`SELECT core.document_current_set_result(${Deno.env.get('CORE_ENVIRONMENT') || ''},${chosen.stableKey},
      ${chosen.kind},${chosen.locale},${chosen.surface}) AS result`;
    if (row.result.code !== 'OK') return failure(row.result.code,resultStatus(row.result.code));
    return jsonOutput(tx,row.result.data);
  });
}

export async function readDocument(request: Request,target: string,failure: Failure,release = 'current') {
  if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED',405);
  if (release !== 'current' && !uuid.test(release)) return failure('INVALID_INPUT',422);
  const actor = await principal(request);
  const chosen = selection(request,actor,false,failure);
  if (chosen instanceof Response) return chosen;
  return admittedOutput(failure,async tx => {
    if (actor) {
      const [context] = await tx`SELECT core.policy_context_result(${actor.account}::uuid,${actor.session}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
      if (context.result.code !== 'OK') return failure(context.result.code,context.result.code === 'SESSION_INVALID' ? 401 : 503);
    }
    const [row] = await tx`SELECT core.document_release_read_result(${Deno.env.get('CORE_ENVIRONMENT') || ''},${target},
      ${release === 'current' ? null : release}::uuid,${chosen.kind},${chosen.locale},${chosen.surface}) AS result`;
    if (row.result.code !== 'OK') return failure(row.result.code,resultStatus(row.result.code));
    return jsonOutput(tx,row.result.data);
  });
}
