import type { components } from '../../../../../packages/contracts/src/generated/app';
import { isRevisionReceipt,PostError,type RevisionReceipt } from './post-api';

type Schemas=components['schemas'];
export type ContentPatch=Schemas['ContentPatch'];
export type VisibilityPatch=Schemas['VisibilityPatch'];
export type ReplyPolicyPatch=Schemas['ReplyPolicyPatch'];
export type ImpactPreview=Schemas['ImpactPreview'];
export type ActionReceipt=Schemas['ActionReceipt'];
export type Deletion=Schemas['Deletion'];
export type RevisionPage=Schemas['RevisionPage'];
export type DeletionPage=Schemas['DeletionPage'];
export type VersionedCommand={operation_id:string;base_version:number};

const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const cursorPattern=/^[A-Za-z0-9_-]{1,2048}$/;
const version=(value:unknown)=>Number.isSafeInteger(value) && Number(value)>0;
export function isActionReceipt(value:unknown,operationId:string):value is ActionReceipt {
  return record(value) && value.operation_id===operationId &&
    ['pending','succeeded','failed','unknown'].includes(String(value.state)) &&
    (value.target_ref===undefined || typeof value.target_ref==='string' && uuid.test(value.target_ref)) &&
    Array.isArray(value.allowed_actions) && value.allowed_actions.every(item=>typeof item==='string');
}
export function isDeletion(value:unknown):value is Deletion {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) &&
    typeof value.target_id==='string' && uuid.test(value.target_id) && version(value.row_version) &&
    ['deleted','restored','physical_removed'].includes(String(value.state)) &&
    ['deleted_at','undo_until','restore_until'].every(key=>typeof value[key]==='string' && !Number.isNaN(Date.parse(String(value[key])))) &&
    ['pending','running','failed','cancelled','physical_removed'].includes(String(value.purge_state)) &&
    Array.isArray(value.allowed_actions) && value.allowed_actions.every(item=>typeof item==='string');
}
function revision(value:unknown):boolean {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) && typeof value.resource_id==='string' && uuid.test(value.resource_id) &&
    version(value.row_version) && version(value.revision_no) && typeof value.body==='string' &&
    Array.isArray(value.tags) && value.tags.every(item=>typeof item==='string') &&
    Array.isArray(value.alt_text) && value.alt_text.every(item=>typeof item==='string') &&
    Array.isArray(value.mentions) && value.mentions.every(item=>typeof item==='string' && uuid.test(item)) &&
    Array.isArray(value.media_refs) && value.media_refs.every(item=>typeof item==='string' && uuid.test(item)) &&
    ['public','followers','self'].includes(String(value.visibility)) &&
    ['all_readers','author_follows','mentioned','closed'].includes(String(value.reply_scope)) &&
    ['pending','approved','rejected'].includes(String(value.review_state)) &&
    ['awaiting_review','published','rejected','restricted'].includes(String(value.publication_state)) && typeof value.submitted_at==='string';
}
function page(value:unknown,item:(value:unknown)=>boolean):value is {items:unknown[];next_cursor:string|null;has_more:boolean} {
  return record(value) && Array.isArray(value.items) && value.items.length<=50 && value.items.every(item) &&
    typeof value.has_more==='boolean' && (value.has_more?typeof value.next_cursor==='string' && cursorPattern.test(value.next_cursor):value.next_cursor===null);
}
function preview(value:unknown):value is ImpactPreview {
  return record(value) && typeof value.preview_id==='string' && uuid.test(value.preview_id) &&
    typeof value.preview_digest==='string' && /^[a-f0-9]{64}$/.test(value.preview_digest) &&
    typeof value.expires_at==='string' && !Number.isNaN(Date.parse(value.expires_at)) &&
    version(value.base_version) && Array.isArray(value.affected_refs) && value.affected_refs.every(item=>typeof item==='string' && uuid.test(item)) &&
    Array.isArray(value.impacts) && value.impacts.every(item=>typeof item==='string');
}
export function lifecycleApi(base:string|undefined,release:string,development=false) {
  let root:string;
  try {
    const url=new URL(base || '');
    if(url.username || url.password || url.search || url.hash || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
      (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    root=url.toString().replace(/\/$/,'');
  } catch { root=''; }
  async function request<T>(token:string,method:string,path:string,validate:(value:unknown)=>value is T,input?:unknown,accepted=[200]):Promise<T> {
    if(!root)throw new PostError('SERVICE_UNAVAILABLE','内容管理暂时不可用');
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const response=await fetch(root+path,{method,credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`,...(input===undefined?{}:{'Content-Type':'application/json'})},
        ...(input===undefined?{}:{body:JSON.stringify(input)})});
      const raw=await response.text();
      if(raw.length>1024*1024)throw method==='GET'?new PostError('SERVICE_UNAVAILABLE','读取结果暂时无法确认，请刷新重试'):
        new PostError('NETWORK_UNCONFIRMED','响应无法确认，请查询原操作',true);
      let envelope:unknown;
      try {envelope=JSON.parse(raw);} catch {throw method==='GET'?new PostError('SERVICE_UNAVAILABLE','读取结果暂时无法确认，请刷新重试'):
        new PostError('NETWORK_UNCONFIRMED','响应无法确认，请查询原操作',true);}
      if(!response.ok || !accepted.includes(response.status)){
        const code=response.status===401?'SESSION_INVALID':record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        const unknown=response.status>=500 || code==='NETWORK_UNCONFIRMED';
        throw new PostError(code,response.status===401?'登录已失效，请重新登录':response.status===409?'版本已变化，请刷新后重新选择':
          response.status===403 || response.status===404?'当前不可操作此内容':response.status===422?'输入不符合要求，请修改后重试':
          unknown?'结果待确认，请查询原操作':'操作暂时失败，请重试',unknown);
      }
      const data=record(envelope)?envelope.data:undefined;
      if(!validate(data))throw method==='GET'?new PostError('SERVICE_UNAVAILABLE','读取结果暂时无法确认，请刷新重试'):
        new PostError('NETWORK_UNCONFIRMED','回执无法确认，请查询原操作',true);
      return data;
    } catch(error) {
      if(error instanceof PostError)throw error;
      throw method==='GET'?new PostError('SERVICE_UNAVAILABLE','网络中断，暂时无法读取，请刷新重试'):
        new PostError('NETWORK_UNCONFIRMED','网络中断，结果待确认，请查询原操作',true);
    } finally {clearTimeout(timer);}
  }
  const id=(value:string)=>{if(!uuid.test(value))throw new PostError('INVALID_INPUT','内容编号无效');return value;};
  const query=(cursor?:string)=>{if(cursor && !cursorPattern.test(cursor))throw new PostError('INVALID_INPUT','分页位置无效');return `?limit=20${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`;};
  return {
    patch:(token:string,postId:string,input:ContentPatch)=>request(token,'PATCH',`/posts/${id(postId)}`, (value):value is RevisionReceipt=>
      isRevisionReceipt(value,input.operation_id) && value.resource_id===postId,input,[202]),
    visibilityPreview:(token:string,postId:string,input:VisibilityPatch)=>request(token,'POST',`/posts/${id(postId)}/visibility-previews`,preview,input),
    visibility:(token:string,postId:string,input:VisibilityPatch)=>request(token,'PATCH',`/posts/${id(postId)}/visibility`,(value):value is ActionReceipt=>
      isActionReceipt(value,input.operation_id) && value.target_ref===postId,input),
    replyPolicy:(token:string,postId:string,input:ReplyPolicyPatch)=>request(token,'PATCH',`/posts/${id(postId)}/reply-policy`,(value):value is ActionReceipt=>
      isActionReceipt(value,input.operation_id) && value.target_ref===postId,input),
    remove:(token:string,resourceId:string,input:VersionedCommand)=>request(token,'POST',`/resources/${id(resourceId)}/deletion`,
      (value):value is Deletion=>isDeletion(value) && value.target_id===resourceId,input),
    restore:(token:string,deletionId:string,input:VersionedCommand)=>request(token,'POST',`/deletions/${id(deletionId)}/restore`,
      (value):value is Deletion=>isDeletion(value) && value.id===deletionId,input),
    revisions:(token:string,postId:string,cursor?:string)=>request(token,'GET',`/posts/${id(postId)}/revisions${query(cursor)}`,(value):value is RevisionPage=>page(value,revision)),
    recentlyDeleted:(token:string,cursor?:string)=>request(token,'GET',`/me/recently-deleted${query(cursor)}`,(value):value is DeletionPage=>page(value,isDeletion)),
  };
}
