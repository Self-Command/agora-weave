import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { trustedClientIp } from '../identity/ingress.ts';
import { readCommandJson } from '../request-body.ts';
import { admittedOutput,jsonOutput,type Failure } from '../output.ts';
import { passwordGrant,PasswordAuthError } from '../adapters/supabase-admin-password.ts';

const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const hex=/^[a-f0-9]{64}$/;
const username=/^[a-z0-9][a-z0-9_.-]{2,63}$/;
const reject=(code:string,operation?:string)=>{
  const status=['SERVICE_UNAVAILABLE','AUTH_UNCONFIRMED','CONFIG_UNAVAILABLE'].includes(code)?503:code==='AUTH_FAILED'||code==='SESSION_INVALID'?401:code==='FORBIDDEN'?403:code==='RATE_LIMITED'?429:422;
  return Response.json({request_id:crypto.randomUUID(),code,message:code==='AUTH_FAILED'?'登录信息或图形验证码有误，请重试':'备用登录暂时不可用，请稍后重试',retryable:status===503,...(operation?{operation_id:operation}:{})},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
};
const keyBytes=(value:string)=>Uint8Array.from(value.match(/../g)!,part=>parseInt(part,16));
async function digest(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function sourceDigest(request:Request,env:string){
  const ip=trustedClientIp(request,Deno.env.get('CORE_INGRESS_TOKEN'));if(!ip)return null;
  const secret=Deno.env.get('CORE_INGRESS_TOKEN');if(!secret||!hex.test(secret))return null;
  const signature=await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',keyBytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']),new TextEncoder().encode(`${env}\n${ip}`));
  return [...new Uint8Array(signature)].map(v=>v.toString(16).padStart(2,'0')).join('');
}
async function proof(request:Request,path:string,body:unknown){
  const secret=Deno.env.get('CORE_ADMIN_PASSWORD_BFF_KEY'),timestamp=request.headers.get('X-Admin-Password-Time')||'',nonce=request.headers.get('X-Admin-Password-Nonce')||'',signature=request.headers.get('X-Admin-Password-Signature')||'';
  if(!secret||!hex.test(secret)||!/^\d{10}$/.test(timestamp)||!uuid.test(nonce)||!hex.test(signature))return false;
  const now=Math.floor(Date.now()/1000),at=Number(timestamp);if(Math.abs(now-at)>60)return false;
  const bodyDigest=await digest(JSON.stringify(body));
  const expected=await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',keyBytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']),new TextEncoder().encode(`${timestamp}\n${nonce}\nPOST\n${path}\n${bodyDigest}`));
  const actual=Uint8Array.from(signature.match(/../g)!,part=>parseInt(part,16)),bytes=new Uint8Array(expected);let different=0;
  for(let index=0;index<actual.length;index++)different|=actual[index]^bytes[index];return different===0;
}
function valid(value:Record<string,unknown>,purpose:'captcha'|'login'|'forgot'){
  if(purpose==='captcha')return Object.keys(value).length===2&&uuid.test(String(value.captcha_id))&&typeof value.expires_at==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.expires_at)&&Number.isFinite(Date.parse(value.expires_at));
  const fields=purpose==='forgot'||value.captcha_valid===false?['username','captcha_id','operation_id','captcha_valid']:['username','captcha_id','operation_id','captcha_valid','password'];
  return Object.keys(value).length===fields.length&&Object.keys(value).every(key=>fields.includes(key))&&typeof value.username==='string'&&username.test(value.username)&&typeof value.captcha_id==='string'&&uuid.test(value.captcha_id)&&typeof value.operation_id==='string'&&uuid.test(value.operation_id)&&typeof value.captcha_valid==='boolean'&&(purpose==='forgot'||value.captcha_valid===false||typeof value.password==='string'&&new TextEncoder().encode(value.password).length>=14&&new TextEncoder().encode(value.password).length<=72&&!Array.from(value.password).some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127));
}
export async function adminPassword(request:Request,path:string,failure:Failure):Promise<Response>{
  if(request.method!=='POST')return failure('METHOD_NOT_ALLOWED',405);
  if(new URL(request.url).search)return reject('INVALID_INPUT');
  if(Deno.env.get('CORE_ADMIN_PASSWORD_AUTH_ENABLED')!=='true')return reject('SERVICE_UNAVAILABLE');
  let input;try{input=await readCommandJson(request,16384);}catch{return reject('INVALID_INPUT');}
  if(!await proof(request,path,input))return reject('FORBIDDEN');
  const env=Deno.env.get('CORE_ENVIRONMENT');if(!env||!['dev','test','production'].includes(env))return reject('SERVICE_UNAVAILABLE');
  const source=await sourceDigest(request,env);if(!source)return reject('FORBIDDEN');
  const purpose=path==='/auth/password/forgot'?'forgot':path==='/auth/password'?'login':'captcha';
  if(!valid(input,purpose))return reject('INVALID_INPUT',typeof input.operation_id==='string'?input.operation_id:undefined);
  const sql=database();
  if(purpose==='captcha'){
    const [row]=await sql`SELECT core.admin_password_captcha_result(${input.captcha_id}::uuid,${env},${input.expires_at}::timestamptz,${source}) AS result`;
    return row.result.code==='OK'?Response.json({request_id:crypto.randomUUID(),data:{registered:true}},{headers:{'Cache-Control':'no-store'}}):reject('AUTH_FAILED');
  }
  const [target]=await sql`SELECT core.admin_password_target_result(${input.username},${input.captcha_id}::uuid,${env},${source},${input.operation_id}::uuid,${purpose}) AS result`;
  const targetResult=target.result;
  if(input.captcha_valid!==true){if(targetResult.attempt_id)await sql`SELECT core.admin_password_failure_result(${targetResult.attempt_id}::uuid,${env})`;return reject('AUTH_FAILED',input.operation_id as string);}
  if(purpose==='forgot')return targetResult.code==='OK'?Response.json({request_id:crypto.randomUUID(),data:{accepted:true}},{headers:{'Cache-Control':'no-store'}}):reject('AUTH_FAILED',input.operation_id as string);
  if(targetResult.code!=='OK'||typeof targetResult.attempt_id!=='string'||typeof targetResult.phone!=='string'||typeof targetResult.account_id!=='string')return reject('AUTH_FAILED',input.operation_id as string);
  let session;
  try{session=await passwordGrant('+'+targetResult.phone.replace(/^\+/,''),input.password as string,targetResult.account_id,token=>principal(new Request(request.url,{headers:{Authorization:`Bearer ${token}`}})));}
  catch(error){await sql`SELECT core.admin_password_failure_result(${targetResult.attempt_id}::uuid,${env})`;return reject(error instanceof PasswordAuthError?error.code:'AUTH_UNCONFIRMED',input.operation_id as string);}
  const [finished]=await sql`SELECT core.admin_password_finish_result(${targetResult.attempt_id}::uuid,${session.actor.account}::uuid,${session.actor.session}::uuid,${env},${input.operation_id}::uuid) AS result`;
  if(finished.result.code!=='OK')return reject('AUTH_FAILED',input.operation_id as string);
  return admittedOutput(failure,async tx=>{
    const [row]=await tx`SELECT core.admin_session_result(${session.actor.account}::uuid,${session.actor.session}::uuid,${env},${session.actor.aal}) AS result`;
    if(row.result.code!=='OK')return reject(row.result.code,input.operation_id as string);
    return jsonOutput(tx,{session:session.tokens,administrator:row.result.data});
  });
}
