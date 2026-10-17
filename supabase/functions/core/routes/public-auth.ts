import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { trustedClientIp } from '../identity/ingress.ts';
import { challengeInput,verifyInput } from '../identity/public-input.ts';
import { authLifetimeCompatible } from '../identity/auth-lifetime.ts';
import { readCommandJson } from '../request-body.ts';
import { admittedOutput,jsonOutput,type Failure } from '../output.ts';
import { sendAliyunSms,SmsError } from '../adapters/aliyun-sms.ts';
import { requestPhoneOtp,verifyPhoneOtp,AuthError } from '../adapters/supabase-phone-auth.ts';

type Result={code:string;retry_after?:number};
const messages:Record<string,string>={AUTH_UNCONFIRMED:'结果尚未确认，请查询原操作或稍后重试，输入已保留',
  AUTH_FAILED:'验证未完成，请重新获取验证码',SMS_FAILED:'短信发送失败，请稍后重新获取验证码',
  RATE_LIMITED:'请求过于频繁，请等待后重试',OTP_INVALID:'验证码有误或已不可用',OTP_EXPIRED:'验证码已过期，请重新获取',
  INVITATION_INVALID:'邀请码已失效或不可用',CONSENT_REQUIRED:'请主动声明年龄资格并明确同意当前条款',
  TERMS_CHANGED:'条款已更新，请重新阅读并确认',SERVICE_UNAVAILABLE:'账号服务暂时不可用，请稍后重试',
  CONFIG_UNAVAILABLE:'配置暂时不可用，请稍后重试',INVALID_INPUT:'请求内容有误，请检查后重试',
  CONFLICT:'操作内容或状态已变化，请保留输入并重新确认',FORBIDDEN:'当前入口不支持此操作',
  SESSION_INVALID:'登录已失效，请重新登录',NOT_FOUND:'操作结果不可用'};
function reject(result:Result,operation?:string) {
  const status=result.code==='RATE_LIMITED'?429:['AUTH_UNCONFIRMED','SMS_FAILED','SERVICE_UNAVAILABLE','CONFIG_UNAVAILABLE','TERMS_UNAVAILABLE'].includes(result.code)?503:
    result.code==='SESSION_INVALID'||result.code==='AUTH_FAILED'?401:result.code==='FORBIDDEN'?403:result.code==='NOT_FOUND'?404:
      ['CONFLICT','TERMS_CHANGED'].includes(result.code)?409:422;
  return Response.json({request_id:crypto.randomUUID(),code:result.code,message:messages[result.code] || '账号服务暂时不可用，请稍后重试',
    retryable:status===503||status===429,...(operation?{operation_id:operation}:{}),
    ...(typeof result.retry_after==='number'&&Number.isSafeInteger(result.retry_after)&&result.retry_after>0?{retry_after_seconds:result.retry_after}:{})},
  {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
function environment() { const v=Deno.env.get('CORE_ENVIRONMENT'); return ['dev','test','production'].includes(v || '')?v!:null; }
function smsConfiguration() {
  if (Deno.env.get('CORE_PHONE_AUTH_ENABLED')!=='true') return null;
  const config={accessKeyId:Deno.env.get('ALIYUN_SMS_ACCESS_KEY_ID') || '',accessKeySecret:Deno.env.get('ALIYUN_SMS_ACCESS_KEY_SECRET') || '',
    signName:Deno.env.get('ALIYUN_SMS_SIGN_NAME') || '',templateCode:Deno.env.get('ALIYUN_SMS_TEMPLATE_CODE') || ''};
  return Object.values(config).every(v=>v.length>0&&v.length<=2048&&!Array.from(v).some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127))?config:null;
}
export async function publicChallenge(request:Request,failure:Failure):Promise<Response> {
  if (request.method!=='POST') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search) return reject({code:'INVALID_INPUT'});
  let raw; try {raw=await readCommandJson(request,16384);} catch {return reject({code:'INVALID_INPUT'});}
  const input=challengeInput(raw); if (!input) return reject({code:'INVALID_INPUT'});
  const env=environment(),secret=Deno.env.get('CORE_INGRESS_TOKEN');
  if (!env||!secret) return reject({code:'SERVICE_UNAVAILABLE'},input.operation_id);
  const ip=trustedClientIp(request,secret); if (!ip) return reject({code:'FORBIDDEN'},input.operation_id);
  const config=smsConfiguration(); if (!config) return reject({code:'SERVICE_UNAVAILABLE'},input.operation_id);
  const sql=database();
  const [reserved]=await sql`SELECT core.reserve_public_otp(${input.phone},${ip},${input.purpose},${input.operation_id}::uuid,
    ${sql.json(input.context)},${env}) AS result`;
  const result=reserved.result;
  if (result.code!=='OK') return reject(result,input.operation_id);
  if (result.reused && result.dispatch_state!=='sent') return reject({code:result.dispatch_state==='failed'?'SMS_FAILED':'AUTH_UNCONFIRMED',retry_after:result.retry_after},input.operation_id);
  if (!result.reused) {
    try { await requestPhoneOtp(input.phone,input.purpose); }
    catch(error) {
      const unknown=!(error instanceof AuthError)||error.code==='AUTH_UNCONFIRMED';
      await sql`SELECT core.finish_public_sms(${result.challenge_id}::uuid,${result.lease}::uuid,${unknown?'unknown':'failed'},${env})`;
      return reject({code:unknown?'AUTH_UNCONFIRMED':error instanceof AuthError&&error.code==='RATE_LIMITED'?'RATE_LIMITED':'SMS_FAILED',retry_after:result.retry_after},input.operation_id);
    }
    const [claim]=await sql`SELECT core.claim_public_sms(${result.challenge_id}::uuid,${result.lease}::uuid,${env}) AS result`;
    if (claim.result.code!=='OK') return reject(claim.result,input.operation_id);
    if (!authLifetimeCompatible(claim.result.expires_at,claim.result.auth_issued_at,Deno.env.get('CORE_AUTH_SMS_OTP_EXP_SECONDS'))) {
      await sql`SELECT core.finish_public_sms(${result.challenge_id}::uuid,${result.lease}::uuid,'failed',${env})`;
      return reject({code:'CONFIG_UNAVAILABLE'},input.operation_id);
    }
    let outcome='sent';
    try { await sendAliyunSms({phone:claim.result.phone,otp:claim.result.otp,requestId:claim.result.request_id},config); }
    catch(error) {outcome=error instanceof SmsError&&error.code==='SERVICE_UNAVAILABLE'?'failed':'unknown';}
    const [finished]=await sql`SELECT core.finish_public_sms(${result.challenge_id}::uuid,${result.lease}::uuid,${outcome},${env}) AS result`;
    if (finished.result.code!=='OK') return reject(finished.result,input.operation_id);
    if (outcome!=='sent') return reject({code:outcome==='failed'?'SMS_FAILED':'AUTH_UNCONFIRMED',retry_after:result.retry_after},input.operation_id);
  }
  return admittedOutput(failure,async tx=>{
    // Recheck current qualification and delivery after the external call, before the public success DTO.
    const [current]=await tx`SELECT core.read_public_challenge(${input.phone},${ip},${input.purpose},${input.operation_id}::uuid,
      ${tx.json(input.context)},${env}) AS result`;
    if (current.result.code!=='OK') return reject(current.result,input.operation_id);
    return jsonOutput(tx,{challenge_id:current.result.challenge_id,expires_at:current.result.expires_at,retry_after:current.result.retry_after});
  });
}

export async function publicVerify(request:Request,failure:Failure,queryOperation?:string):Promise<Response> {
  if (request.method!=='POST') return failure('METHOD_NOT_ALLOWED',405);
  if (new URL(request.url).search) return reject({code:'INVALID_INPUT'});
  let raw; try {raw=await readCommandJson(request,16384);} catch {return reject({code:'INVALID_INPUT'});}
  const input=verifyInput(raw); if (!input||queryOperation&&input.operation_id!==queryOperation) return reject({code:'INVALID_INPUT'});
  const env=environment(),secret=Deno.env.get('CORE_INGRESS_TOKEN');
  if (!env||!secret) return reject({code:'SERVICE_UNAVAILABLE'},input.operation_id);
  if (!trustedClientIp(request,secret)) return reject({code:'FORBIDDEN'},input.operation_id);
  const sql=database();
  const [prepared]=await sql`SELECT core.prepare_public_verify(${input.challenge_id}::uuid,${input.otp},${input.operation_id}::uuid,
    ${sql.json(input.verification)},${env},${Boolean(queryOperation)}) AS result`;
  let result=prepared.result;
  if (result.code!=='OK') {
    if (queryOperation && result.code==='AUTH_UNCONFIRMED') return admittedOutput(failure,tx=>jsonOutput(tx,{operation_id:input.operation_id,state:result.state==='pending'?'pending':'unknown'}));
    return reject(result,input.operation_id);
  }
  if (result.action==='verify' && !queryOperation) {
    let verified;
    try {
      verified=await verifyPhoneOtp(result.phone,input.otp,async token=>principal(new Request(request.url,{headers:{Authorization:`Bearer ${token}`}})));
    } catch(error) {
      const unknown=!(error instanceof AuthError)||error.code==='AUTH_UNCONFIRMED';
      const [failed]=await sql`SELECT core.fail_public_verify(${input.challenge_id}::uuid,${result.lease}::uuid,${unknown},${env}) AS result`;
      return reject(failed.result,input.operation_id);
    }
    try {
      const [finished]=await sql`SELECT core.finish_public_verify(${input.challenge_id}::uuid,${result.lease}::uuid,
        ${verified.actor.account}::uuid,${verified.actor.session}::uuid,${sql.json(verified.tokens)},${env}) AS result`;
      result=finished.result;
    } catch {return reject({code:'AUTH_UNCONFIRMED'},input.operation_id);}
    if (result.code!=='OK') return reject(result,input.operation_id);
  }
  return admittedOutput(failure,async tx=>{
    // Never hand a cached token to a revoked identity; read the exact durable receipt under output admission.
    const [current]=await tx`SELECT core.read_public_verify(${input.challenge_id}::uuid,${input.otp},${input.operation_id}::uuid,
      ${tx.json(input.verification)},${env}) AS result`;
    if (current.result.code!=='OK') return reject(current.result,input.operation_id);
    return jsonOutput(tx,current.result.data);
  });
}
