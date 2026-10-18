import type { components } from '../../../../../packages/contracts/src/generated/app';
import { FeedError } from './api';
import { isRevisionReceipt,type RevisionReceipt } from '../publishing/post-api';

type Schemas=components['schemas'];
export type CommentItem=Schemas['CommentProjection'];
export type CommentsPage=Schemas['CommentPage'];
export type CommentCreate=Schemas['CommentCreate'];
export class CommentError extends Error {
  constructor(public code:string,message:string,public unknown=false){super(message);}
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
function validComment(value:unknown,postId:string):value is CommentItem {
  if(!record(value) || typeof value.id!=='string' || !uuid.test(value.id) || !Array.isArray(value.allowed_actions) ||
      !value.allowed_actions.every(action=>typeof action==='string'))return false;
  if(value.state==='unavailable')return Object.keys(value).every(key=>['id','state','allowed_actions'].includes(key));
  return value.post_id===postId && typeof value.author_id==='string' && uuid.test(value.author_id) &&
    typeof value.body==='string' && typeof value.created_at==='string' && Number.isSafeInteger(value.display_depth) &&
    Number(value.display_depth)>=1 && Number.isSafeInteger(value.row_version) && Number(value.row_version)>0 &&
    (value.parent_comment_id===null || typeof value.parent_comment_id==='string' && uuid.test(value.parent_comment_id)) &&
    (value.reply_to_id===null || typeof value.reply_to_id==='string' && uuid.test(value.reply_to_id)) &&
    Array.isArray(value.media);
}

export function guestCommentsApi(base:string|undefined,release:string,development=false,readToken?:()=>Promise<string|undefined>) {
  return async (postId:string,cursor?:string,sort:'latest'|'hot'='latest'):Promise<CommentsPage>=>{
    let url:URL;
    try {
      url=new URL(base || '');
      if(!uuid.test(postId) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
        cursor!==undefined && !/^[A-Za-z0-9_-]{1,2048}$/.test(cursor) ||
        url.username || url.password || url.search || url.hash ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname)))) throw new Error();
    } catch { throw new FeedError('SERVICE_UNAVAILABLE','评论服务暂时不可用'); }
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const path=`/posts/${postId}/comments?sort=${sort}&limit=20${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`;
      const token=await readToken?.();
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{method:'GET',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,...(token?{Authorization:`Bearer ${token}`}:{})}});
      const raw=await response.text();
      if(raw.length>1024*1024)throw new Error();
      const envelope:unknown=JSON.parse(raw);
      if(!response.ok){
        const code=record(envelope) && typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        throw new FeedError(code,code==='NOT_FOUND'?'帖子或评论不可用':code==='INVALID_INPUT'?'评论列表已变化，请刷新':'评论暂时无法加载');
      }
      const page=record(envelope)?envelope.data:null;
      if(!record(page) || !Array.isArray(page.items) || page.items.length>20 || !page.items.every(item=>validComment(item,postId)) ||
        new Set(page.items.map(item=>item.id)).size!==page.items.length || typeof page.has_more!=='boolean' ||
        !(page.has_more?typeof page.next_cursor==='string' && /^[A-Za-z0-9_-]{1,2048}$/.test(page.next_cursor) && page.items.length>0:page.next_cursor===null))
        throw new FeedError('SERVICE_UNAVAILABLE','评论服务返回异常，请重试');
      return page as CommentsPage;
    } catch(error) {
      if(error instanceof FeedError)throw error;
      throw new FeedError('NETWORK_UNCONFIRMED','评论暂时无法加载，请检查网络后重试');
    } finally {clearTimeout(timer);}
  };
}

export function commentWriteApi(base:string|undefined,release:string,development=false) {
  return async (token:string,postId:string,input:CommentCreate):Promise<RevisionReceipt>=>{
    let url:URL;
    try {
      url=new URL(base || '');
      if(!uuid.test(postId) || !uuid.test(input.operation_id) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
        url.username || url.password || url.search || url.hash ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    } catch {throw new CommentError('SERVICE_UNAVAILABLE','评论服务暂时不可用，输入已保留');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const response=await fetch(url.toString().replace(/\/$/,'')+`/posts/${postId}/comments`,{
        method:'POST',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{'Content-Type':'application/json',Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`},
        body:JSON.stringify(input),
      });
      const raw=await response.text();
      if(raw.length>1024*1024)throw new CommentError('NETWORK_UNCONFIRMED','评论结果待确认，请查询原操作',true);
      let envelope:unknown;
      try {envelope=JSON.parse(raw);} catch {throw new CommentError('NETWORK_UNCONFIRMED','评论结果待确认，请查询原操作',true);}
      if(response.status===202){
        const receipt=record(envelope)?envelope.data:undefined;
        if(!isRevisionReceipt(receipt,input.operation_id))throw new CommentError('NETWORK_UNCONFIRMED','评论回执无法确认，请查询原操作',true);
        return receipt;
      }
      if(response.ok)throw new CommentError('NETWORK_UNCONFIRMED','评论回执无法确认，请查询原操作',true);
      const code=response.status===401?'SESSION_INVALID':record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
      const unknown=response.status>=500 || code==='NETWORK_UNCONFIRMED';
      throw new CommentError(code,response.status===401?'登录已失效，请重新登录':response.status===403?'当前账号不能评论此帖':
        response.status===404?'帖子不可用':response.status===422?'评论不符合当前要求，请修改后重试':
        response.status===429?'评论过于频繁，请稍后重试':unknown?'评论结果待确认，请查询原操作':'评论提交失败，输入已保留',unknown);
    } catch(error){
      if(error instanceof CommentError)throw error;
      throw new CommentError('NETWORK_UNCONFIRMED','网络中断，评论结果待确认，请查询原操作',true);
    } finally {clearTimeout(timer);}
  };
}
