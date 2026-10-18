import type { components } from '../../../../../packages/contracts/src/generated/app';
import { PostError } from './post-api';

type RevisionPage=components['schemas']['RevisionPage'];
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function validRevision(value:unknown):boolean {
  return record(value) && ['id','resource_id'].every(key=>typeof value[key]==='string' && uuid.test(value[key] as string)) &&
    Number.isSafeInteger(value.revision_no) && Number(value.revision_no)>0 && typeof value.body==='string' &&
    Array.isArray(value.tags) && value.tags.every(item=>typeof item==='string') &&
    Array.isArray(value.mentions) && value.mentions.every(item=>typeof item==='string' && uuid.test(item)) &&
    Array.isArray(value.alt_text) && value.alt_text.every(item=>typeof item==='string') &&
    Array.isArray(value.media_refs) && value.media_refs.length<=9 && value.media_refs.every(item=>typeof item==='string' && uuid.test(item)) &&
    ['pending','approved','rejected'].includes(String(value.review_state)) &&
    ['awaiting_review','published','rejected','restricted'].includes(String(value.publication_state)) && typeof value.submitted_at==='string' &&
    Number.isSafeInteger(value.row_version) && Number(value.row_version)>0 &&
    ['public','followers','self'].includes(String(value.visibility)) &&
    ['all_readers','author_follows','mentioned','closed'].includes(String(value.reply_scope));
}
export function ownedContentsApi(base:string|undefined,release:string,development=false) {
  return async(token:string,cursor?:string):Promise<RevisionPage>=>{
    let url:URL;
    try {
      url=new URL(base || '');
      if(url.username || url.password || url.search || url.hash || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
        cursor!==undefined && !/^[A-Za-z0-9_-]{1,2048}$/.test(cursor) ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' &&
          ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    } catch {throw new PostError('SERVICE_UNAVAILABLE','我的内容暂时不可用');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const response=await fetch(url.toString().replace(/\/$/,'')+`/me/contents?limit=20${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`,{
        method:'GET',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`}});
      const raw=await response.text();if(raw.length>1024*1024)throw new Error();
      const envelope:unknown=JSON.parse(raw);
      if(!response.ok)throw new PostError(response.status===401?'SESSION_INVALID':record(envelope)?String(envelope.code):'SERVICE_UNAVAILABLE',
        response.status===401?'请重新登录后查看我的内容':'我的内容暂时无法读取，请刷新重试');
      const page=record(envelope)?envelope.data:null;
      if(!record(page) || !Array.isArray(page.items) || page.items.length>50 || !page.items.every(validRevision) ||
        typeof page.has_more!=='boolean' || !(page.has_more?typeof page.next_cursor==='string' &&
          /^[A-Za-z0-9_-]{1,2048}$/.test(page.next_cursor):page.next_cursor===null))throw new Error();
      return page as RevisionPage;
    } catch(error) {
      if(error instanceof PostError)throw error;
      throw new PostError('SERVICE_UNAVAILABLE','我的内容暂时无法读取，请刷新重试');
    } finally {clearTimeout(timer);}
  };
}
