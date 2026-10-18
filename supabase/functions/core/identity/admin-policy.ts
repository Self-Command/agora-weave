import type { Principal } from '../identity.ts';

export const adminUuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const adminDigest=/^[a-f0-9]{64}$/;
export const adminObject=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export const adminKeys=(value:Record<string,unknown>,allowed:string[])=>Object.keys(value).every(key=>allowed.includes(key));
export const adminReason=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=1000&&
  !Array.from(value).some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127);
export const adminEnvironment=()=>{
  const value=Deno.env.get('CORE_ENVIRONMENT');return value&&['dev','test','production'].includes(value)?value:null;
};
export function adminLifetime() {
  const value=Deno.env.get('CORE_AUTH_SMS_OTP_EXP_SECONDS');
  return value&&/^[1-9]\d{0,8}$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):null;
}
export function adminAccess(request:Request,actor:Principal|null):string|null {
  const header=request.headers.get('Authorization');
  return actor?.audience==='authenticated'&&header&&/^Bearer [A-Za-z0-9_.-]+$/i.test(header)?header.slice(7):null;
}
const messages:Record<string,string>={SESSION_INVALID:'登录已失效，请重新登录',FORBIDDEN:'当前账号没有此管理权限',
  MFA_REQUIRED:'请完成当前账号的多因素验证',MFA_INVALID:'多因素验证码有误或已过期，请重新验证',
  MFA_UNCONFIRMED:'多因素验证结果尚未确认，请重新登录核查',RATE_LIMITED:'请求过于频繁，请稍后重试',
  INVALID_INPUT:'请求内容有误，请检查后重试',CONFLICT:'操作内容或版本已变化，输入已保留，请重新预览',
  CONFIG_CONFLICT:'配置版本已变化，输入已保留，请重新预览',CONFIG_UNAVAILABLE:'当前配置不可用，请稍后重试',
  PREVIEW_EXPIRED:'本次预览已过期，输入已保留，请重新预览',AUTH_LIFETIME_EXCEEDED:'验证码有效期超过当前认证服务上限，请调整后重试',
  SERVICE_UNAVAILABLE:'管理服务暂时不可用，请稍后重试',PRODUCTION_CONFIRMATION_REQUIRED:'生产启用需要部署负责人确认具体版本和范围',
  SENSITIVE_COOLDOWN:'账号处于换号保护期，当前操作暂不可用',NOT_FOUND:'结果不可用',
  STEPUP_REQUIRED:'请重新完成本次操作的多因素验证',STEPUP_INVALID:'本次验证已过期或不匹配，请重新预览并验证',
  METHOD_NOT_ALLOWED:'不支持此操作'};
export function adminFailure(code:string,operation?:string) {
  const status=code==='SESSION_INVALID'?401:code==='NOT_FOUND'?404:code==='METHOD_NOT_ALLOWED'?405:
    code==='RATE_LIMITED'?429:['CONFLICT','CONFIG_CONFLICT','PREVIEW_EXPIRED'].includes(code)?409:
    ['SERVICE_UNAVAILABLE','CONFIG_UNAVAILABLE','MFA_UNCONFIRMED','PRODUCTION_CONFIRMATION_REQUIRED'].includes(code)?503:
      ['FORBIDDEN','MFA_REQUIRED','SENSITIVE_COOLDOWN','STEPUP_REQUIRED','STEPUP_INVALID'].includes(code)?403:422;
  return Response.json({request_id:crypto.randomUUID(),code,message:messages[code]||'管理操作未完成，请检查当前资格后重试',
    retryable:status===503||status===429,...(operation?{operation_id:operation}:{})},
  {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
