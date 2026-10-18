import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas=components['schemas'];
export type Profile=Schemas['Profile'];
export type ProfilePatch=Schemas['ProfilePatch'];
export class ProfileError extends Error {
  constructor(public code:string,message:string,public uncertain=false){super(message);}
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
export function validProfile(value:unknown,accountId:string):value is Profile {
  return record(value) && value.account_id===accountId &&
    ['nickname','username','bio','registered_at'].every(key=>typeof value[key]==='string') &&
    ['avatar_media_ref','background_media_ref'].every(key=>value[key]===null || typeof value[key]==='string' && uuid.test(value[key] as string)) &&
    ['followers_count','following_count','row_version'].every(key=>Number.isSafeInteger(value[key]) && Number(value[key])>=0) &&
    Number(value.row_version)>0 && Array.isArray(value.allowed_actions) && value.allowed_actions.every(action=>typeof action==='string');
}

export function profileApi(base:string|undefined,release:string,development=false) {
  async function request(path:string,accountId:string,token?:string,patch?:ProfilePatch):Promise<Profile> {
    let url:URL;
    try {
      url=new URL(base || '');
      if(!uuid.test(accountId) || !/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
        (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname)))) throw new Error();
    } catch {throw new ProfileError('SERVICE_UNAVAILABLE','资料服务暂时不可用');}
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try {
      const response=await fetch(url.toString().replace(/\/$/,'')+path,{method:patch?'PATCH':'GET',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{Accept:'application/json','X-Client-Release':release,...(token?{Authorization:`Bearer ${token}`}:{}) ,...(patch?{'Content-Type':'application/json'}:{})},
        ...(patch?{body:JSON.stringify(patch)}:{})});
      const raw=await response.text();
      if(raw.length>1024*1024)throw new ProfileError('NETWORK_UNCONFIRMED','保存结果暂时无法确认',!!patch);
      let envelope:unknown;
      try {envelope=JSON.parse(raw);}catch{throw new ProfileError('NETWORK_UNCONFIRMED','服务响应无法确认',!!patch);}
      if(!response.ok){
        const code=record(envelope) && typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        const uncertain=!!patch && response.status>=500;
        throw new ProfileError(code,response.status===401?'登录已失效，请重新登录':response.status===403?'当前无权查看或修改资料':
          response.status===404?'资料不可用或无权访问':response.status===409?'资料已在别处更新，请保留输入并重新加载':
          response.status===422?'输入不符合资料要求，请修改后重试':response.status===429?'请求过于频繁，请稍后重试':
          response.status===405?'资料接口尚未接通':uncertain?'保存结果待确认，请勿重复提交':'资料服务暂时不可用',uncertain);
      }
      if(response.status!==200 || !record(envelope) || !validProfile(envelope.data,accountId))
        throw new ProfileError('NETWORK_UNCONFIRMED',patch?'保存回执无法确认，请勿重复提交':'资料服务返回异常',!!patch);
      return envelope.data;
    }catch(error){
      if(error instanceof ProfileError)throw error;
      throw new ProfileError('NETWORK_UNCONFIRMED',patch?'网络中断，保存结果待确认':'网络中断，资料暂时无法加载',!!patch);
    }finally{clearTimeout(timer);}
  }
  return {
    get:(accountId:string,token?:string)=>request(`/profiles/${encodeURIComponent(accountId)}`,accountId,token),
    update:(accountId:string,token:string,patch:ProfilePatch)=>request('/me/profile',accountId,token,patch),
  };
}
