import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas=components['schemas'];
export type Report=Schemas['Report'];
export type ReportRequest=Schemas['ReportRequest'];
export type ReportPage=Schemas['ReportPage'];
export class ReportError extends Error {
  constructor(public code:string,message:string,public uncertain=false){super(message);}
}
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function validReport(value:unknown):value is Report {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) &&
    typeof value.target_ref==='string' && uuid.test(value.target_ref) &&
    ['pending','reviewing','processed','not_actionable'].includes(String(value.state)) &&
    (value.public_feedback===null || typeof value.public_feedback==='string') &&
    typeof value.created_at==='string' && !Number.isNaN(Date.parse(value.created_at));
}
export function reportApi(base:string|undefined,release:string,development=false){
  async function call(path:string,token:string,input?:ReportRequest):Promise<unknown>{
    let url:URL;
    try {
      url=new URL(base || '');
      if(!/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    }catch{throw new ReportError('SERVICE_UNAVAILABLE','举报服务暂时不可用');}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{method:input?'POST':'GET',credentials:'omit',cache:'no-store',signal:controller.signal,
        headers:{Accept:'application/json','X-Client-Release':release,Authorization:`Bearer ${token}`,...(input?{'Content-Type':'application/json'}:{})},
        ...(input?{body:JSON.stringify(input)}:{})});
      const raw=await response.text();
      if(raw.length>1024*1024)throw new ReportError('NETWORK_UNCONFIRMED','服务响应无法确认',!!input);
      let envelope:unknown;
      try{envelope=JSON.parse(raw);}catch{throw new ReportError('NETWORK_UNCONFIRMED','服务响应无法确认',!!input);}
      if(!response.ok){
        const code=record(envelope) && typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        const uncertain=!!input && response.status>=500;
        throw new ReportError(code,response.status===401?'登录已失效，请重新登录':response.status===403?'当前无权举报此对象':
          response.status===404?'对象不可用或举报接口尚未接通':response.status===409?'操作号已用于其他内容，请保留输入':
          response.status===422?'举报内容不符合要求，请检查后重试':response.status===429?'操作过于频繁，请稍后再试':
          uncertain?'举报结果待确认，请查询原操作':'举报服务暂时不可用',uncertain);
      }
      if(response.status!==200 || !record(envelope) || !('data' in envelope))
        throw new ReportError('NETWORK_UNCONFIRMED','服务回执无法确认',!!input);
      return envelope.data;
    }catch(error){
      if(error instanceof ReportError)throw error;
      throw new ReportError('NETWORK_UNCONFIRMED',input?'网络中断，举报结果待确认':'网络中断，无法读取举报进度',!!input);
    }finally{clearTimeout(timer);}
  }
  return {
    async create(token:string,input:ReportRequest):Promise<Report>{
      const data=await call('/reports',token,input);
      if(!validReport(data) || data.target_ref!==input.target_id)
        throw new ReportError('NETWORK_UNCONFIRMED','举报回执无法确认，请查询原操作',true);
      return data;
    },
    async own(token:string,cursor?:string):Promise<ReportPage>{
      const data=await call('/me/reports?limit=20'+(cursor?'&cursor='+encodeURIComponent(cursor):''),token);
      if(!record(data) || !Array.isArray(data.items) || data.items.some(item=>!validReport(item)) ||
        typeof data.has_more!=='boolean' || !(data.next_cursor===null || typeof data.next_cursor==='string'))
        throw new ReportError('SERVICE_UNAVAILABLE','举报进度返回异常');
      return {items:data.items as Report[],next_cursor:data.next_cursor as string|null,has_more:data.has_more};
    },
  };
}
