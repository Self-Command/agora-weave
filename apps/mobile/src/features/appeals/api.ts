import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas=components['schemas'];
export type Sanction=Schemas['Sanction'];
export type Appeal=Schemas['Appeal'];
export type AppealRequest=Schemas['AppealRequest'];
export type SanctionPage=Schemas['SanctionPage'];
export type AppealPage=Schemas['AppealPage'];
export class AppealError extends Error {
  constructor(public code:string,message:string,public uncertain=false){super(message);}
}
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function validSanction(value:unknown):value is Sanction {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) &&
    ['function','temporary','permanent'].includes(String(value.type)) &&
    Array.isArray(value.functions) && value.functions.every(item=>typeof item==='string') &&
    typeof value.starts_at==='string' && !Number.isNaN(Date.parse(value.starts_at)) &&
    (value.ends_at===null || typeof value.ends_at==='string' && !Number.isNaN(Date.parse(value.ends_at))) &&
    typeof value.reason==='string' && ['active','revoked','expired'].includes(String(value.state)) &&
    Array.isArray(value.allowed_actions) && value.allowed_actions.every(item=>typeof item==='string');
}
export function validAppeal(value:unknown):value is Appeal {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) &&
    typeof value.sanction_id==='string' && uuid.test(value.sanction_id) && typeof value.statement==='string' &&
    ['awaiting_independent_review','reviewing','decided'].includes(String(value.state)) &&
    (value.decision===null || value.decision==='uphold' || value.decision==='overturn') &&
    ['pending','succeeded','failed'].includes(String(value.execution_state)) &&
    typeof value.created_at==='string' && !Number.isNaN(Date.parse(value.created_at)) &&
    Array.isArray(value.allowed_actions) && value.allowed_actions.every(item=>typeof item==='string');
}
function validPage<T>(value:unknown,valid:(item:unknown)=>item is T):value is {items:T[];next_cursor:string|null;has_more:boolean}{
  return record(value) && Array.isArray(value.items) && value.items.length<=50 && value.items.every(valid) &&
    typeof value.has_more==='boolean' && (value.next_cursor===null || typeof value.next_cursor==='string');
}
export function appealApi(base:string|undefined,release:string,development=false){
  async function call(path:string,token:string,input?:AppealRequest):Promise<unknown>{
    let url:URL;
    try{
      url=new URL(base || '');
      if(!/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    }catch{throw new AppealError('SERVICE_UNAVAILABLE','申诉服务暂时不可用');}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{method:input?'POST':'GET',credentials:'omit',cache:'no-store',signal:controller.signal,
        headers:{Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`,...(input?{'Content-Type':'application/json'}:{})},
        ...(input?{body:JSON.stringify(input)}:{})});
      const raw=await response.text();
      if(raw.length>1024*1024)throw new AppealError('NETWORK_UNCONFIRMED','服务响应无法确认',!!input);
      let envelope:unknown;
      try{envelope=JSON.parse(raw);}catch{throw new AppealError('NETWORK_UNCONFIRMED','服务响应无法确认',!!input);}
      if(!response.ok){
        const code=record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        const uncertain=!!input && response.status>=500;
        throw new AppealError(code,response.status===401?'登录已失效，请重新登录':
          response.status===403?'当前无权查看或申诉此处罚':response.status===404?'处罚不可用':
          response.status===409?'申诉已存在或操作号冲突，请刷新查看':response.status===422?'申诉内容不符合要求，请检查后重试':
          response.status===429?'操作过于频繁，请稍后再试':
          uncertain?'申诉结果待确认，请查询原操作':'申诉服务暂时不可用',uncertain);
      }
      if(response.status!==200 || !record(envelope) || !('data' in envelope))
        throw new AppealError('NETWORK_UNCONFIRMED','服务回执无法确认',!!input);
      return envelope.data;
    }catch(error){
      if(error instanceof AppealError)throw error;
      throw new AppealError('NETWORK_UNCONFIRMED',input?'网络中断，申诉结果待确认':'网络中断，无法读取处罚与申诉',!!input);
    }finally{clearTimeout(timer);}
  }
  return {
    async sanctions(token:string,cursor?:string):Promise<SanctionPage>{
      const data=await call('/me/sanctions?limit=20'+(cursor?'&cursor='+encodeURIComponent(cursor):''),token);
      if(!validPage(data,validSanction))throw new AppealError('SERVICE_UNAVAILABLE','处罚记录返回异常');
      return data;
    },
    async appeals(token:string,cursor?:string):Promise<AppealPage>{
      const data=await call('/appeals?limit=20'+(cursor?'&cursor='+encodeURIComponent(cursor):''),token);
      if(!validPage(data,validAppeal))throw new AppealError('SERVICE_UNAVAILABLE','申诉进度返回异常');
      return data;
    },
    async create(token:string,input:AppealRequest):Promise<Appeal>{
      const data=await call('/appeals',token,input);
      if(!validAppeal(data) || data.sanction_id!==input.sanction_id)
        throw new AppealError('NETWORK_UNCONFIRMED','申诉回执无法确认，请查询原操作',true);
      return data;
    },
  };
}
