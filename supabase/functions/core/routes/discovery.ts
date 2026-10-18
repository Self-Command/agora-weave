import { principal } from '../identity.ts';
import { admittedOutput,jsonOutput,type Failure } from '../output.ts';
import { readFeedCursor,writeFeedCursor,type FeedCursor,type FeedScope } from './discovery-cursor.ts';

/** The first discovery slice exposes only the currently public post subset, ordered by creation time. */
export async function latestFeed(request: Request,failure: Failure): Promise<Response> {
  if (request.method!=='GET') return failure('METHOD_NOT_ALLOWED',405);
  const url = new URL(request.url),limit = url.searchParams.get('limit') ?? '20';
  const release = request.headers.get('X-Client-Release') || '';
  if ([...url.searchParams.keys()].some(name=>!['limit','cursor'].includes(name)) ||
      url.searchParams.getAll('limit').length>1 || url.searchParams.getAll('cursor').length>1 ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release)) return failure('INVALID_INPUT',422);
  const environment = Deno.env.get('CORE_ENVIRONMENT') || '',secret = Deno.env.get('JWT_SECRET') || '';
  if (!['dev','test','production'].includes(environment) || !secret) return failure('SERVICE_UNAVAILABLE',503);
  return admittedOutput(failure,async tx=>{
    let actor;
    try { actor = await principal(request); }
    catch (error) { return failure(error instanceof Error && error.message==='SERVICE_UNAVAILABLE' ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID',
      error instanceof Error && error.message==='SERVICE_UNAVAILABLE' ? 503 : 401); }
    if (actor?.audience==='share-read') return failure('FORBIDDEN',403);
    const scope: FeedScope = { scope:'public-latest-created-v1',subject:actor?.account ?? null,session:actor?.session ?? null,
      environment,limit:Number(limit),client_release:release };
    let cursor: FeedCursor | undefined;
    if (url.searchParams.has('cursor')) {
      try { cursor = await readFeedCursor(url.searchParams.get('cursor')!,scope,secret); }
      catch { return failure('INVALID_INPUT',422); }
    }
    const [row] = await tx`SELECT core.latest_public_feed_result(${actor?.account ?? null}::uuid,${actor?.session ?? null}::uuid,
      ${environment},${release},${Number(limit)},${cursor?.position ?? null}::uuid,${cursor?.created_at ?? null}::timestamptz,
      ${cursor?.config_version ?? null}) AS result`;
    const result = row.result;
    if (result.code!=='OK') return failure(result.code,result.code==='SESSION_INVALID' ? 401 : result.code==='INVALID_INPUT' ? 422 : 503);
    const next_cursor = result.has_more ? await writeFeedCursor({ ...scope,position:result.next_id,
      created_at:result.next_created_at,config_version:result.config_version },secret) : null;
    return jsonOutput(tx,{ items:result.items,next_cursor,has_more:result.has_more });
  });
}
