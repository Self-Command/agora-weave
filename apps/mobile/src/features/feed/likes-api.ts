import type {components} from '../../../../../packages/contracts/src/generated/app';

export type LikeReceipt=components['schemas']['ReactionReceipt'];
export class LikeError extends Error {
  constructor(public code:string,message:string,public uncertain=false){super(message);}
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[0-9a-f]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
export function validLikeReceipt(value:unknown,targetId:string):value is LikeReceipt {
  return record(value) && Object.keys(value).length===3 && value.target_id===targetId.toLowerCase() &&
    typeof value.active==='boolean' && Number.isSafeInteger(value.count) && Number(value.count)>=0;
}
export function resourceLikeApi(base:string|undefined,release:string,development=false){
  return async (token:string,targetId:string,operationId:string,active:boolean):Promise<LikeReceipt>=>{
    let root:URL;
    try{
      root=new URL(base || '');
      if(!uuid.test(targetId) || !uuid.test(operationId) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) ||
        root.username || root.password || root.search || root.hash ||
        (root.protocol!=='https:' && !(development && root.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(root.hostname))))throw new Error();
    }catch{throw new LikeError('SERVICE_UNAVAILABLE','点赞服务暂时不可用');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch(root.toString().replace(/\/$/,'')+`/resources/${targetId}/likes`,{
        method:active?'PUT':'DELETE',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','Content-Type':'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`},
        body:JSON.stringify({operation_id:operationId})});
      const raw=await response.text();
      if(raw.length>1024*1024)throw new LikeError('NETWORK_UNCONFIRMED','点赞结果待确认，请重试查询',true);
      let envelope:unknown;
      try{envelope=JSON.parse(raw);}catch{throw new LikeError('NETWORK_UNCONFIRMED','点赞结果待确认，请重试查询',true);}
      if(!response.ok){
        const code=record(envelope) && typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        const uncertain=response.status>=500;
        throw new LikeError(code,response.status===401?'请重新登录':response.status===403?'当前账号不能操作此帖':
          response.status===404?'帖子不可用':response.status===429?'操作太频繁，请稍后重试':
          uncertain?'点赞结果待确认，请重试查询':'点赞操作失败',uncertain);
      }
      const receipt=record(envelope)?envelope.data:null;
      if(response.status!==200 || !validLikeReceipt(receipt,targetId))throw new LikeError('NETWORK_UNCONFIRMED','点赞回执无法确认，请重试查询',true);
      return receipt;
    }catch(error){
      if(error instanceof LikeError)throw error;
      throw new LikeError('NETWORK_UNCONFIRMED','网络中断，点赞结果待确认，请重试查询',true);
    }finally{clearTimeout(timer);}
  };
}

export function resourceLikeStateApi(base:string|undefined,release:string,development=false){
  return async (token:string,targetId:string):Promise<LikeReceipt>=>{
    let root:URL;
    try{root=new URL(base||'');if(!uuid.test(targetId)||!/^[A-Za-z0-9_.-]{1,128}$/.test(release)||
      root.username||root.password||root.search||root.hash||
      (root.protocol!=='https:'&&!(development&&root.protocol==='http:'&&['localhost','127.0.0.1','10.0.2.2'].includes(root.hostname))))throw new Error();}
    catch{throw new LikeError('SERVICE_UNAVAILABLE','点赞状态暂时不可用');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch(root.toString().replace(/\/$/,'')+`/resources/${targetId}/likes`,{
        method:'GET',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`}});
      const raw=await response.text();if(raw.length>1024*1024)throw new Error();
      const envelope:unknown=JSON.parse(raw);
      if(!response.ok){const code=record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        throw new LikeError(code,response.status===404?'帖子不可用':response.status===401?'请重新登录':'点赞状态暂时不可用');}
      const receipt=record(envelope)?envelope.data:null;
      if(!validLikeReceipt(receipt,targetId))throw new LikeError('SERVICE_UNAVAILABLE','点赞状态返回异常');
      return receipt;
    }catch(error){if(error instanceof LikeError)throw error;throw new LikeError('NETWORK_UNCONFIRMED','点赞状态暂时无法读取');}
    finally{clearTimeout(timer);}
  };
}
