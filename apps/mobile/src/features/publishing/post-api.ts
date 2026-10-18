import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas=components['schemas'];
export type CreatePostRequest=Schemas['CreatePostRequest'];
export type RevisionReceipt=Schemas['RevisionReceipt'];

export class PostError extends Error {
  constructor(public code:string,message:string,public unknown=false) { super(message); }
}
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function isRevisionReceipt(value:unknown,operationId:string):value is RevisionReceipt {
  return record(value) && value.operation_id===operationId &&
    ['resource_id','revision_id'].every(key=>typeof value[key]==='string' && uuid.test(value[key] as string)) &&
    ['pending','approved','rejected'].includes(String(value.review_state)) &&
    ['preparing','awaiting_review','published','rejected','failed','cancelled'].includes(String(value.publication_state)) &&
    Number.isSafeInteger(value.row_version) && Number(value.row_version)>0;
}

export function postApi(base:string|undefined,release:string,development=false) {
  return {
    async create(token:string,input:CreatePostRequest):Promise<RevisionReceipt> {
      let url:URL;
      try {
        url=new URL(base || '');
        if (!/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
          (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname)))) throw new Error();
      } catch { throw new PostError('SERVICE_UNAVAILABLE','发布服务暂时不可用，输入已保留'); }
      const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
      try {
        const response=await fetch(url.toString().replace(/\/$/,'')+'/posts',{
          method:'POST',credentials:'omit',cache:'no-store',signal:abort.signal,
          headers:{ 'Content-Type':'application/json',Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}` },
          body:JSON.stringify(input),
        });
        const raw=await response.text();
        if (raw.length>1024*1024) throw new PostError('NETWORK_UNCONFIRMED','响应无法确认，请先查询原操作',true);
        let envelope:unknown;
        try { envelope=JSON.parse(raw); } catch { throw new PostError('NETWORK_UNCONFIRMED','响应无法确认，请先查询原操作',true); }
        if (response.status===202) {
          const data=record(envelope)?envelope.data:undefined;
          if (!isRevisionReceipt(data,input.operation_id)) throw new PostError('NETWORK_UNCONFIRMED','发布回执无法确认，请先查询原操作',true);
          return data;
        }
        if (response.ok) throw new PostError('NETWORK_UNCONFIRMED','发布回执无法确认，请先查询原操作',true);
        const code=response.status===401?'SESSION_INVALID':record(envelope) && typeof envelope.code==='string' ? envelope.code : 'SERVICE_UNAVAILABLE';
        const unknown=response.status>=500 || code==='NETWORK_UNCONFIRMED';
        throw new PostError(code,response.status===401?'登录已失效，请重新登录':response.status===403?'当前账号不能发布此内容':
          response.status===422?'内容不符合发布要求，请修改后重试':response.status===429?'操作过于频繁，请稍后重试':
          response.status===404 || response.status===405?'发布接口尚不可用，请稍后重试':
          unknown?'发布结果待确认，请先查询原操作':'发布失败，输入已保留',unknown);
      } catch (error) {
        if (error instanceof PostError) throw error;
        throw new PostError('NETWORK_UNCONFIRMED','网络中断，发布结果待确认，请先查询原操作',true);
      } finally { clearTimeout(timer); }
    },
  };
}
