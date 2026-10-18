import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, responseConfigVersion, type Failure } from '../output.ts';
import { readFeedCursor, writeFeedCursor, type FeedCursor, type FeedScope } from './discovery-cursor.ts';

/** This private list is separate from published-only profile/feed reads. */
export async function listOwnedContents(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED',405);
  const url=new URL(request.url),limit=url.searchParams.get('limit') || '20';
  const release=request.headers.get('X-Client-Release') || '';
  if ([...url.searchParams.keys()].some(key=>!['limit','cursor'].includes(key)) ||
      ['limit','cursor'].some(key=>url.searchParams.getAll(key).length>1) ||
      !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release))
    return failure('INVALID_INPUT',422);
  const environment=Deno.env.get('CORE_ENVIRONMENT') || '',secret=Deno.env.get('JWT_SECRET') || '';
  if (!['dev','test','production'].includes(environment) || !secret) return failure('SERVICE_UNAVAILABLE',503);
  let actor;
  try { actor=await principal(request); }
  catch(error) { return failure(error instanceof Error && error.message==='SERVICE_UNAVAILABLE'?'SERVICE_UNAVAILABLE':'SESSION_INVALID',
    error instanceof Error && error.message==='SERVICE_UNAVAILABLE'?503:401); }
  if (!actor || actor.audience!=='authenticated') return failure('SESSION_INVALID',401);
  const scope:FeedScope={scope:'owned-posts-created-v1',subject:actor.account,session:actor.session,
    environment,limit:Number(limit),client_release:release};
  let cursor:FeedCursor|undefined;
  if (url.searchParams.has('cursor')) {
    try { cursor=await readFeedCursor(url.searchParams.get('cursor')!,scope,secret); }
    catch { return failure('INVALID_INPUT',422); }
  }
  return admittedOutput(failure,async tx=>{
    const [row]=await tx`SELECT core.list_owned_contents_result(${actor.account}::uuid,${actor.session}::uuid,
      ${environment},${Number(limit)},${cursor?.position ?? null}::uuid,${cursor?.created_at ?? null}::timestamptz) AS result`;
    const result=row.result;
    if (result?.code!=='OK') {
      const code=['SESSION_INVALID','FORBIDDEN','INVALID_INPUT','CONFIG_UNAVAILABLE'].includes(result?.code)?result.code:'SERVICE_UNAVAILABLE';
      return failure(code,code==='SESSION_INVALID'?401:code==='FORBIDDEN'?403:code==='INVALID_INPUT'?422:503);
    }
    const next_cursor=result.has_more?await writeFeedCursor({...scope,position:result.next_id,
      created_at:result.next_created_at,config_version:await responseConfigVersion(tx)},secret):null;
    return jsonOutput(tx,{items:result.items,next_cursor,has_more:result.has_more});
  });
}
