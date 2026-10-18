/** Official Supabase Auth password grant adapter for the explicitly enabled
 * admin fallback. It never creates a session or upgrades assurance itself. */
export type PasswordActor = { account:string; session:string; audience:string; expires_at:number; aal:'aal1'|'aal2' };
export type PasswordSession = { actor:PasswordActor; tokens:{access_token:string;refresh_token:string;expires_at:number} };
export type VerifyPasswordAccess=(token:string)=>Promise<PasswordActor|null>;
export class PasswordAuthError extends Error {
  readonly code:'AUTH_FAILED'|'AUTH_UNCONFIRMED'|'RATE_LIMITED';
  constructor(code:'AUTH_FAILED'|'AUTH_UNCONFIRMED'|'RATE_LIMITED'){super(code);this.name='PasswordAuthError';this.code=code;}
}
const jwt=/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text=(value:unknown,pattern:RegExp,max:number):value is string=>typeof value==='string'&&value===value.trim()&&value.length>0&&value.length<=max&&pattern.test(value);
const record=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function fail():never {throw new PasswordAuthError('AUTH_FAILED');}
function unconfirmed():never {throw new PasswordAuthError('AUTH_UNCONFIRMED');}
async function responseJson(response:Response,signal:AbortSignal){
  const length=response.headers.get('content-length');
  if(signal.aborted||length!==null&&(!/^\d+$/.test(length)||Number(length)>65536)||!/^application\/json(?:\s*;[^\r\n]*)?$/i.test(response.headers.get('content-type')||'')||!response.body){void response.body?.cancel();unconfirmed();}
  const reader=response.body.getReader(),cancel=()=>{void reader.cancel().catch(()=>{});};signal.addEventListener('abort',cancel,{once:true});
  try{const parts:Uint8Array[]=[];let size=0;
    for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>65536){cancel();unconfirmed();}parts.push(part.value);}
    if(signal.aborted||length!==null&&Number(length)!==size)unconfirmed();
    const bytes=new Uint8Array(size);let at=0;for(const part of parts){bytes.set(part,at);at+=part.byteLength;}
    const value:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!record(value))unconfirmed();return value;
  }finally{signal.removeEventListener('abort',cancel);reader.releaseLock();}
}
export async function passwordGrant(phone:string,password:string,expectedAccount:string,verifyAccess:VerifyPasswordAccess,transport:typeof fetch=fetch):Promise<PasswordSession>{
  if(!text(phone,/^\+[1-9][0-9]{7,14}$/,32)||!uuid.test(expectedAccount)||typeof password!=='string'||new TextEncoder().encode(password).length<14||new TextEncoder().encode(password).length>72||Array.from(password).some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127)||typeof verifyAccess!=='function')fail();
  const endpoint='http://auth:9999/token?grant_type=password',controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new PasswordAuthError('AUTH_UNCONFIRMED'));},8000);});
  try{
    return await Promise.race([timeout,(async()=>{
    const response=await transport(endpoint,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({phone,password}),redirect:'manual',credentials:'omit',signal:controller.signal});
    if(response.redirected||response.url&&response.url!==endpoint||response.status>=300&&response.status<400||response.status>=500){void response.body?.cancel();unconfirmed();}
    if(response.status===429){await response.body?.cancel();throw new PasswordAuthError('RATE_LIMITED');}
    if(!response.ok){await response.body?.cancel();throw new PasswordAuthError('AUTH_FAILED');}
    const result=await responseJson(response,controller.signal);
    if(result.token_type!=='bearer'||!text(result.access_token,jwt,8185)||!text(result.refresh_token,/^[A-Za-z0-9._~+/=-]{12,2048}$/,2048)||!record(result.user))unconfirmed();
    let actor:PasswordActor|null;try{actor=await verifyAccess(result.access_token);}catch{fail();}
    if(controller.signal.aborted)unconfirmed();
    if(!actor||actor.account!==expectedAccount||!uuid.test(actor.session)||actor.audience!=='authenticated'||actor.aal!=='aal1'||!Number.isSafeInteger(actor.expires_at)||actor.expires_at<=Math.floor(Date.now()/1000))fail();
    let claims:unknown;try{claims=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(result.access_token.split('.')[1].replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));}catch{fail();}
    const user=result.user,confirmed=typeof user.phone_confirmed_at==='string'?Date.parse(user.phone_confirmed_at):NaN;
    if(!record(claims)||claims.sub!==actor.account||claims.session_id!==actor.session||claims.exp!==actor.expires_at||claims.aal!==actor.aal||claims.role!=='authenticated'||claims.aud!=='authenticated'||String(claims.phone).replace(/^\+/,'')!==phone.slice(1)||!Array.isArray(claims.amr)||!claims.amr.some(entry=>record(entry)&&entry.method==='password'&&Number.isSafeInteger(entry.timestamp)&&Number(entry.timestamp)>0&&Number(entry.timestamp)<=Math.floor(Date.now()/1000))||user.id!==actor.account||String(user.phone).replace(/^\+/,'')!==phone.slice(1)||!Number.isFinite(confirmed)||confirmed>Date.now()||user.role!==undefined&&user.role!=='authenticated'||user.aud!==undefined&&user.aud!=='authenticated')fail();
    return {actor,tokens:{access_token:result.access_token,refresh_token:result.refresh_token,expires_at:actor.expires_at}};
    })()]);
  }catch(error){if(error instanceof PasswordAuthError)throw error;unconfirmed();}
  finally{clearTimeout(timer);}
}
