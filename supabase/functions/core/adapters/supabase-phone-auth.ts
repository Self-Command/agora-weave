// Fixed official Auth v2.196.0 contracts: internal/api/{otp,phone,verify}.go
// https://github.com/supabase/auth/tree/v2.196.0/internal/api
export type VerifiedPhoneActor={account:string;session:string;audience:string;expires_at:number};
export type VerifyPhoneAccess=(token:string)=>Promise<VerifiedPhoneActor|null>;
export type VerifiedPhoneSession={actor:VerifiedPhoneActor;tokens:{access_token:string;refresh_token:string;expires_at:number}};
export class AuthError extends Error {
  readonly code:'AUTH_FAILED'|'AUTH_UNCONFIRMED'|'SERVICE_UNAVAILABLE'|'RATE_LIMITED';
  constructor(code:'AUTH_FAILED'|'AUTH_UNCONFIRMED'|'SERVICE_UNAVAILABLE'|'RATE_LIMITED') {
    super(code);this.name='AuthError';this.code=code;
  }
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>value!==null && typeof value==='object' && !Array.isArray(value);
const matches=(value:unknown,pattern:RegExp):value is string=>typeof value==='string' && value.trim()===value && pattern.test(value);
function unconfirmed():never {throw new AuthError('AUTH_UNCONFIRMED');}
function failed():never {throw new AuthError('AUTH_FAILED');}
const cancel=(response:Response)=>{void response.body?.cancel().catch(()=>{});};

async function readJson(response:Response,signal:AbortSignal):Promise<Record<string,unknown>> {
  const length=response.headers.get('content-length');
  if(signal.aborted || length!==null && (!/^\d+$/.test(length) || Number(length)>16384) ||
    !/^application\/json(?:\s*;[^\r\n]*)?$/i.test(response.headers.get('content-type')||'') || !response.body) {
    cancel(response);unconfirmed();
  }
  const reader=response.body.getReader(),abort=()=>{void reader.cancel().catch(()=>{});};
  signal.addEventListener('abort',abort,{once:true});
  try {
    const parts:Uint8Array[]=[];let lengthRead=0;
    for(;;) {
      const chunk=await reader.read();if(chunk.done) break;
      lengthRead+=chunk.value.byteLength;
      if(lengthRead>16384) {abort();unconfirmed();}
      parts.push(chunk.value);
    }
    if(signal.aborted || length!==null && Number(length)!==lengthRead) unconfirmed();
    const bytes=new Uint8Array(lengthRead);let offset=0;
    for(const part of parts) {bytes.set(part,offset);offset+=part.byteLength;}
    const value:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!record(value)) unconfirmed();return value;
  } finally {signal.removeEventListener('abort',abort);reader.releaseLock();}
}

async function exchange<T>(path:'/otp'|'/verify',body:Record<string,unknown>,transport:typeof fetch,
  consume:(value:Record<string,unknown>,signal:AbortSignal)=>Promise<T>):Promise<T> {
  const endpoint='http://auth:9999'+path,controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Promise<never>((_resolve,reject)=>{
    timer=setTimeout(()=>{controller.abort();reject(new AuthError('AUTH_UNCONFIRMED'));},8000);
  });
  try {
    return await Promise.race([timeout,(async()=>{
      const response=await transport(endpoint,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},
        body:JSON.stringify(body),redirect:'manual',credentials:'omit',signal:controller.signal});
      if(response.redirected || response.url && response.url!==endpoint || response.status>=300 && response.status<400 || response.status>=500) {
        cancel(response);unconfirmed();
      }
      if(response.status>=400 && response.status<500) {
        cancel(response);
        throw new AuthError(response.status===429?'RATE_LIMITED':path==='/otp'?'SERVICE_UNAVAILABLE':'AUTH_FAILED');
      }
      if(!response.ok) {cancel(response);unconfirmed();}
      return await consume(await readJson(response,controller.signal),controller.signal);
    })()]);
  } catch(error) {
    if(error instanceof AuthError) throw error;
    throw new AuthError('AUTH_UNCONFIRMED');
  } finally {clearTimeout(timer);}
}

/** Request only the official phone SMS operation; client metadata and headers have no forwarding path. */
export async function requestPhoneOtp(phone:string,purpose:'login'|'register',transport:typeof fetch=fetch):Promise<void> {
  if(!matches(phone,/^\+[1-9]\d{7,14}$/) || !['login','register'].includes(purpose)) throw new AuthError('SERVICE_UNAVAILABLE');
  await exchange('/otp',{phone,channel:'sms',create_user:purpose==='register'},transport,async value=>{
    if(Object.keys(value).some(key=>key!=='message_id') || value.message_id!==undefined &&
      (typeof value.message_id!=='string' || value.message_id.length>256 ||
        Array.from(value.message_id).some(character=>character.charCodeAt(0)<32 || character.charCodeAt(0)===127))) unconfirmed();
  });
}

function samePhone(value:unknown,phone:string):boolean {
  return matches(value,/^\+?[1-9]\d{7,14}$/) && (value.startsWith('+')?value:'+'+value)===phone;
}
function confirmedAt(value:unknown):boolean {
  if(typeof value!=='string' || value.trim()!==value) return false;
  const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if(!match) return false;
  const [year,month,day,hour,minute,second]=match.slice(1,7).map(Number),zone=match[7];
  if(year<1970 || month<1 || month>12 || day<1 || day>new Date(Date.UTC(year,month,0)).getUTCDate() ||
    hour>23 || minute>59 || second>59 || zone!=='Z' && (Number(zone.slice(1,3))>23 || Number(zone.slice(4))>59)) return false;
  const timestamp=Date.parse(value);return Number.isFinite(timestamp) && timestamp<=Date.now();
}

/** Signature validation is mandatory and injected by the production caller. Decoding
 * claims below only cross-checks that validated token against the actual Auth user.
 */
export async function verifyPhoneOtp(phone:string,otp:string,verifyAccess:VerifyPhoneAccess,
  transport:typeof fetch=fetch):Promise<VerifiedPhoneSession> {
  if(!matches(phone,/^\+[1-9]\d{7,14}$/) || !matches(otp,/^\d{6}$/)) failed();
  if(typeof verifyAccess!=='function') throw new AuthError('SERVICE_UNAVAILABLE');
  return await exchange('/verify',{phone,token:otp,type:'sms'},transport,async(value,signal)=>{
    if(value.token_type!=='bearer' || !matches(value.access_token,/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/) ||
      value.access_token.length>8185 || !matches(value.refresh_token,/^[A-Za-z0-9._~+/=-]{12,4096}$/) || !record(value.user)) unconfirmed();
    const access=value.access_token,refresh=value.refresh_token,user=value.user;
    let actor:VerifiedPhoneActor|null;
    try {actor=await verifyAccess(access);} catch {failed();}
    if(signal.aborted) unconfirmed();
    if(!record(actor) || !matches(actor.account,uuid) || !matches(actor.session,uuid) || actor.audience!=='authenticated' ||
      !Number.isSafeInteger(actor.expires_at) || actor.expires_at<=Math.floor(Date.now()/1000)) failed();
    let claims:unknown;
    try {
      const payload=atob(access.split('.')[1].replaceAll('-','+').replaceAll('_','/'));
      claims=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(payload,value=>value.charCodeAt(0))));
    } catch {failed();}
    if(!record(claims) || claims.role!=='authenticated' || claims.sub!==actor.account || claims.session_id!==actor.session ||
      claims.aud!==actor.audience || claims.exp!==actor.expires_at || !samePhone(claims.phone,phone) ||
      user.id!==actor.account || !samePhone(user.phone,phone) || !confirmedAt(user.phone_confirmed_at) ||
      user.role!==undefined && user.role!=='authenticated' || user.aud!==undefined && user.aud!=='authenticated') failed();
    return {actor:{account:actor.account,session:actor.session,audience:actor.audience,expires_at:actor.expires_at},
      tokens:{access_token:access,refresh_token:refresh,expires_at:actor.expires_at}};
  });
}
