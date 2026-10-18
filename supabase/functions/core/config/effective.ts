import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, type Failure } from '../output.ts';
import Ajv from 'npm:ajv@8.20.0';
import { createConfigurationResolver } from '../../../../packages/config/src/resolve-core.ts';
const resolveConfiguration=createConfigurationResolver(new Ajv({ strict:true,allErrors:false,coerceTypes:false,useDefaults:false,removeAdditional:false }));

/** Resolve the same active bundle for an API command and its read projection. */
export async function resolveCurrentConfiguration(
  tx: any, actor: string, session: string, environment: string, consumer: string, release: string,
): Promise<{ version: string; values: Record<string, unknown> } | null> {
  const [row] = await tx`SELECT core.configuration_snapshot(${actor}::uuid,${session}::uuid,
    ${environment},${consumer},'authenticated') AS result`;
  if (row.result?.code !== 'OK') return null;
  const resolved=resolveConfiguration({ ...row.result.input,client_release:release });
  if (resolved.state !== 'resolved' || typeof resolved.version !== 'string' ||
      !resolved.values || typeof resolved.values !== 'object' || Array.isArray(resolved.values)) return null;
  return { version: resolved.version, values: resolved.values as Record<string, unknown> };
}

export async function effectiveConfig(request: Request,failure: Failure) {
  if (request.method!=='GET') return failure('METHOD_NOT_ALLOWED',405);
  const url = new URL(request.url),consumer = url.searchParams.get('consumer') || 'mobile';
  if ([...url.searchParams].some(([key])=>key!=='consumer') || url.searchParams.getAll('consumer').length>1 || !['mobile','share'].includes(consumer)) return failure('INVALID_INPUT',422);
  return admittedOutput(failure,async tx => {
    const actor = await principal(request),environment = Deno.env.get('CORE_ENVIRONMENT') || '';
    if (actor?.audience==='share-read' && consumer!=='share') return failure('FORBIDDEN',403);
    if (actor?.audience==='authenticated' && consumer==='share') return failure('FORBIDDEN',403);
    if (!actor && consumer!=='share') return failure('SESSION_INVALID',401);
    const clientRelease=request.headers.get('X-Client-Release') || '0.0.0';
    if (!/^[A-Za-z0-9_.-]{1,128}$/.test(clientRelease)) return failure('INVALID_INPUT',422);
    const [row] = await tx`SELECT core.configuration_snapshot(${actor?.audience==='authenticated'?actor.account:null}::uuid,
      ${actor?.audience==='authenticated'?actor.session:null}::uuid,${environment},${consumer},${actor?.audience || 'share-read'}) AS result`;
    if (row.result.code!=='OK') return failure(row.result.code,row.result.code==='SESSION_INVALID'?401:503);
    const resolved=resolveConfiguration({ ...row.result.input,client_release:clientRelease });
    if (resolved.state!=='resolved') return failure('CONFIG_UNAVAILABLE',503);
    return jsonOutput(tx,{ version:resolved.version,values:resolved.values });
  });
}
