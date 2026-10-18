import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas = components['schemas'];
export type PublicPost = Schemas['ReadPost'] & { visibility:'public' };
export type LatestPost = Schemas['LatestPost'];
export type LatestPage = Schemas['LatestPage'] & { config_version:string };
export class FeedError extends Error {
  code:string;
  constructor(code:string,message:string) { super(message);this.code=code; }
}
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const record = (value:unknown):value is Record<string,unknown>=>Boolean(value) && typeof value==='object' && !Array.isArray(value);
function post(value:unknown,latest:true):value is LatestPost;
function post(value:unknown,latest?:false):value is PublicPost;
function post(value:unknown,latest=false):value is PublicPost {
  return record(value) && ['id','author_id','revision_id'].every(name=>typeof value[name]==='string' && uuid.test(value[name] as string)) &&
    value.visibility==='public' && typeof value.body==='string' && Number.isSafeInteger(value.row_version) && Number(value.row_version)>0 &&
    (value.type==='text' || value.type==='images') && Array.isArray(value.media_refs) && value.media_refs.length<10 &&
    value.media_refs.every(id=>typeof id==='string' && uuid.test(id)) &&
    (value.type==='text' ? value.body.length>0 && value.media_refs.length===0 : value.media_refs.length>0) &&
    Object.keys(value).every(name=>['id','author_id','visibility','revision_id','type','media_refs','body','row_version',...(latest ? ['created_at'] : [])].includes(name)) &&
    (!latest || typeof value.created_at==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(value.created_at));
}
export function guestMediaUrl(id:string,base:string|undefined,development=false):string|null {
  if(!uuid.test(id)) return null;
  try {
    const url=new URL(base || '');
    if(url.username || url.password || url.search || url.hash ||
      url.protocol!=='https:' && !(development && url.protocol==='http:' &&
        ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))) return null;
    return url.toString().replace(/\/$/,'')+'/media/'+encodeURIComponent(id)+'?variant=original';
  } catch {return null;}
}
/** Anonymous reads intentionally have no token, refresh, cookie, or authentication dependency. */
export function guestFeedApi(base:string|undefined,release:string,development=false) {
  async function call(path:string):Promise<{ data:unknown; config_version:string }> {
    let url:URL;
    try {
      url=new URL(base || '');
      if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
          url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))) throw new Error();
    } catch { throw new FeedError('SERVICE_UNAVAILABLE','内容服务暂时不可用，请稍后重试'); }
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{ method:'GET',credentials:'omit',cache:'no-store',
        signal:abort.signal,headers:{ Accept:'application/json','X-Client-Release':release } });
      const body=await response.text();
      if (body.length>1024*1024) throw new Error();
      const envelope:unknown=JSON.parse(body);
      if (!response.ok) {
        const code=record(envelope) && typeof envelope.code==='string' ? envelope.code : 'SERVICE_UNAVAILABLE';
        throw new FeedError(code,code==='NOT_FOUND' ? '内容不可用' : code==='INVALID_INPUT' ? '内容列表已变化，请刷新重试' : '暂时无法加载，请稍后重试');
      }
      if (!record(envelope) || !('data' in envelope) || typeof envelope.config_version!=='string' || !envelope.config_version.length) throw new Error();
      return { data:envelope.data,config_version:envelope.config_version };
    } catch (error) {
      if (error instanceof FeedError) throw error;
      throw new FeedError('NETWORK_UNCONFIRMED','暂时无法加载，请检查网络后重试');
    } finally { clearTimeout(timer); }
  }
  return {
    async latest(cursor?:string):Promise<LatestPage> {
      if (cursor!==undefined && (!/^[A-Za-z0-9_-]{1,2048}$/.test(cursor))) throw new FeedError('INVALID_INPUT','请刷新内容列表');
      const result=await call('/feeds/latest'+(cursor ? '?cursor='+encodeURIComponent(cursor) : '')),page=result.data;
      if (!record(page) || Object.keys(page).some(name=>!['items','next_cursor','has_more'].includes(name)) ||
          !Array.isArray(page.items) || page.items.length>50 || !page.items.every(item=>post(item,true)) ||
          new Set(page.items.map(item=>item.id)).size!==page.items.length || typeof page.has_more!=='boolean' ||
          !(page.has_more ? typeof page.next_cursor==='string' && /^[A-Za-z0-9_-]{1,2048}$/.test(page.next_cursor) && page.items.length>0 : page.next_cursor===null)) {
        throw new FeedError('SERVICE_UNAVAILABLE','内容服务返回异常，请重试');
      }
      return { items:page.items,next_cursor:page.next_cursor as string|null,has_more:page.has_more,config_version:result.config_version };
    },
    async post(id:string):Promise<PublicPost> {
      if (!uuid.test(id)) throw new FeedError('INVALID_INPUT','内容地址有误');
      const result=await call('/posts/'+encodeURIComponent(id));
      if (!post(result.data) || result.data.id!==id) throw new FeedError('SERVICE_UNAVAILABLE','内容服务返回异常，请重试');
      return result.data;
    },
  };
}
export type GuestFeedApi=ReturnType<typeof guestFeedApi>;
