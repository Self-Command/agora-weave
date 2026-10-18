import type {components} from '../../../../../packages/contracts/src/generated/app';
import {ProfileError} from './api';

type Schemas=components['schemas'];
export type ProfilePost=Schemas['Post'] & {type:'text'|'images'};
export type ProfilePostPage=Omit<Schemas['PostPage'],'items'> & {items:ProfilePost[]};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
function validPost(value:unknown):value is ProfilePost {
  return record(value) && ['id','author_id','revision_id'].every(key=>typeof value[key]==='string' && uuid.test(value[key] as string)) &&
    ['text','images'].includes(String(value.type)) && ['public','followers','self'].includes(String(value.visibility)) &&
    typeof value.body==='string' && typeof value.created_at==='string' &&
    Number.isSafeInteger(value.row_version) && Number(value.row_version)>0 &&
    Array.isArray(value.tags) && Array.isArray(value.mentions) && Array.isArray(value.media) &&
    value.media.every(item=>record(item) && typeof item.media_id==='string' && uuid.test(item.media_id) &&
      item.kind==='image' && typeof item.mime==='string' && Number.isSafeInteger(item.size_bytes)) &&
    Array.isArray(value.allowed_actions) && value.allowed_actions.every(action=>typeof action==='string');
}
export function profileContentsApi(base:string|undefined,release:string,development=false) {
  return async(accountId:string,type:'posts'|'media',token?:string,cursor?:string):Promise<ProfilePostPage>=>{
    let url:URL;
    try {
      url=new URL(base || '');
      if(!uuid.test(accountId) || cursor!==undefined && !/^[A-Za-z0-9_-]{1,2048}$/.test(cursor) ||
        url.username || url.password || url.search || url.hash || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' &&
          ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    }catch{throw new ProfileError('SERVICE_UNAVAILABLE','内容列表暂时不可用');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const path=`/profiles/${encodeURIComponent(accountId)}/contents?type=${type}&limit=20${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`;
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{method:'GET',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,...(token?{Authorization:`Bearer ${token}`}:{})}});
      const raw=await response.text();if(raw.length>1024*1024)throw new Error();
      const envelope:unknown=JSON.parse(raw);
      if(!response.ok){
        const code=record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        throw new ProfileError(code,response.status===404?'内容不可用':response.status===422?'内容列表已变化，请刷新':'内容列表暂时不可用');
      }
      const page=record(envelope)?envelope.data:null;
      if(!record(page) || !Array.isArray(page.items) || page.items.length>50 || !page.items.every(validPost) ||
        typeof page.has_more!=='boolean' ||
        !(page.has_more?typeof page.next_cursor==='string' && /^[A-Za-z0-9_-]{1,2048}$/.test(page.next_cursor):
          page.next_cursor===null))throw new Error();
      return page as ProfilePostPage;
    }catch(error){
      if(error instanceof ProfileError)throw error;
      throw new ProfileError('NETWORK_UNCONFIRMED','内容列表暂时无法加载');
    }finally{clearTimeout(timer);}
  };
}
