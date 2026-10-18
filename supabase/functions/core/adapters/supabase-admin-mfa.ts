// Official Auth v2.196.0: internal/api/mfa.go and token.go. This adapter only
// submits TOTP operations; callers retain current grant and factor-ownership checks.
export type MfaActor={account:string;session:string;audience:string;expires_at:number;aal:'aal1'|'aal2'};
export type MfaTokens={access_token:string;refresh_token:string;expires_at:number};
export class MfaError extends Error {
  readonly code:'MFA_INVALID'|'MFA_UNCONFIRMED'|'SERVICE_UNAVAILABLE'|'RATE_LIMITED';
  constructor(code:'MFA_INVALID'|'MFA_UNCONFIRMED'|'SERVICE_UNAVAILABLE'|'RATE_LIMITED') {
    super(code);this.name='MfaError';this.code=code;
  }
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>value!==null && typeof value==='object' && !Array.isArray(value);
const matches=(value:unknown,pattern:RegExp):value is string=>typeof value==='string' && value.trim()===value && pattern.test(value);
function invalid():never {throw new MfaError('MFA_INVALID');}
function unconfirmed():never {throw new MfaError('MFA_UNCONFIRMED');}
const cancel=(response:Response)=>{void response.body?.cancel().catch(()=>{});};
function claimsOf(access:string):Record<string,unknown> {
  if(!matches(access,/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)||access.length>8185) invalid();
  try {
    const decoded=atob(access.split('.')[1].replaceAll('-','+').replaceAll('_','/'));
    const claims:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(decoded,value=>value.charCodeAt(0))));
    if(!record(claims)||claims.role!=='authenticated'||claims.aud!=='authenticated'||!matches(claims.sub,uuid)||
      !matches(claims.session_id,uuid)||!['aal1','aal2'].includes(String(claims.aal))||
      !Number.isSafeInteger(claims.exp)||Number(claims.exp)<=Math.floor(Date.now()/1000)) invalid();
    return claims;
  } catch {invalid();}
}
async function readJson(response:Response,signal:AbortSignal,limit:number):Promise<Record<string,unknown>> {
  const declared=response.headers.get('content-length');
  if(signal.aborted||declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>limit)||
    !/^application\/json(?:\s*;[^\r\n]*)?$/i.test(response.headers.get('content-type')||'')||!response.body) {cancel(response);unconfirmed();}
  const reader=response.body.getReader(),abort=()=>{void reader.cancel().catch(()=>{});};
  signal.addEventListener('abort',abort,{once:true});
  try {
    const parts:Uint8Array[]=[];let size=0;
    for(;;) {const chunk=await reader.read();if(chunk.done) break;size+=chunk.value.byteLength;
      if(size>limit) {abort();unconfirmed();}parts.push(chunk.value);}
    if(signal.aborted||declared!==null&&Number(declared)!==size) unconfirmed();
    const bytes=new Uint8Array(size);let offset=0;for(const part of parts) {bytes.set(part,offset);offset+=part.byteLength;}
    const value:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!record(value)) unconfirmed();return value;
  } finally {signal.removeEventListener('abort',abort);reader.releaseLock();}
}
async function exchange<T>(access:string,path:string,body:Record<string,unknown>,transport:typeof fetch,
  consume:(value:Record<string,unknown>,signal:AbortSignal)=>Promise<T>):Promise<T> {
  const endpoint='http://auth:9999'+path,controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new MfaError('MFA_UNCONFIRMED'));},8000);});
  try {
    return await Promise.race([timeout,(async()=>{
      const response=await transport(endpoint,{method:'POST',headers:{'content-type':'application/json',accept:'application/json',authorization:`Bearer ${access}`},
        body:JSON.stringify(body),redirect:'manual',credentials:'omit',signal:controller.signal});
      if(response.redirected||response.url&&response.url!==endpoint||response.status>=300&&response.status<400||response.status>=500) {cancel(response);unconfirmed();}
      if(response.status>=400&&response.status<500) {cancel(response);throw new MfaError(response.status===429?'RATE_LIMITED':'MFA_INVALID');}
      if(!response.ok) {cancel(response);unconfirmed();}
      return await consume(await readJson(response,controller.signal,path==='/factors'?1048576:65536),controller.signal);
    })()]);
  } catch(error) {if(error instanceof MfaError) throw error;throw new MfaError('MFA_UNCONFIRMED');}
  finally {clearTimeout(timer);}
}

// Official goqrsvg/svgo emit an XML declaration, comment, svg namespace and inert
// rect/style geometry. Return only as an image data URI; never insert raw HTML.
function inertQr(value:unknown):value is string {
  if(typeof value!=='string'||value.length<10||value.length>786432) return false;
  const svg=value.replace(/^\s*<\?xml\s+version="1\.0"(?:\s+encoding="UTF-8")?\s*\?>/,'').replace(/<!--[\s\S]*?-->/g,'').trim();
  if(!/^<svg\s[^>]*>[\s\S]*<\/svg>$/.test(svg)||/[&]|<!|<\?/.test(svg)||svg.includes(String.fromCharCode(0))) return false;
  let found=false;
  for(const tag of svg.matchAll(/<([^>]+)>/g)) {
    const match=/^(\/?)(svg|rect|path|g)([\s\S]*?)(\/?)$/.exec(tag[1]);if(!match) return false;
    const attributes=match[3];if(match[1]&&attributes.trim()) return false;
    if(match[2]==='rect'||match[2]==='path') found=true;
    let rest=attributes;
    for(const attribute of attributes.matchAll(/\s+([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) {
      const [,name,content]=attribute;
      if(!['xmlns','xmlns:xlink','width','height','viewBox','x','y','fill','stroke','style','d','transform'].includes(name)) return false;
      if(name==='xmlns'&&content!=='http://www.w3.org/2000/svg'||name==='xmlns:xlink'&&content!=='http://www.w3.org/1999/xlink') return false;
      if(name==='style'&&!/^fill:(?:black|white);stroke:none$/.test(content)) return false;
      if(!name.startsWith('xmlns')&&name!=='style'&&!/^[A-Za-z0-9#.,()\s+-]*$/.test(content)) return false;
      rest=rest.replace(attribute[0],'');
    }
    if(rest.trim()) return false;
  }
  return found;
}
function enrollment(value:Record<string,unknown>) {
  if(!matches(value.id,uuid)||value.type!=='totp'||!record(value.totp)||!matches(value.totp.secret,/^[A-Z2-7]{32,128}$/)||
    value.totp.secret.length%8!==0||!inertQr(value.totp.qr_code)||typeof value.totp.uri!=='string'||value.totp.uri.length>2048) unconfirmed();
  const totp=value.totp;
  try {
    const uri=new URL(totp.uri as string),keys=[...uri.searchParams.keys()];
    if(uri.protocol!=='otpauth:'||uri.hostname!=='totp'||uri.username||uri.password||uri.port||uri.hash||
      !decodeURIComponent(uri.pathname).startsWith('/AgoraWeave:')||decodeURIComponent(uri.pathname).length<13||
      keys.some(key=>!['secret','issuer','algorithm','digits','period'].includes(key)||uri.searchParams.getAll(key).length!==1)||
      uri.searchParams.get('secret')!==totp.secret||uri.searchParams.get('issuer')!=='AgoraWeave'||
      uri.searchParams.has('algorithm')&&uri.searchParams.get('algorithm')!=='SHA1'||
      uri.searchParams.has('digits')&&uri.searchParams.get('digits')!=='6'||
      uri.searchParams.has('period')&&uri.searchParams.get('period')!=='30') unconfirmed();
  } catch {unconfirmed();}
  return {id:value.id,type:'totp' as const,totp:{qr_code:totp.qr_code as string,secret:totp.secret as string,uri:totp.uri as string}};
}

export async function enrollTotp(access:string,friendlyName:string,transport:typeof fetch=fetch):Promise<{id:string;type:'totp';totp:{qr_code:string;secret:string;uri:string}}> {
  claimsOf(access);
  if(typeof friendlyName!=='string'||friendlyName.trim()!==friendlyName||friendlyName.length<1||friendlyName.length>128||
    Array.from(friendlyName).some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127)) throw new MfaError('SERVICE_UNAVAILABLE');
  return await exchange(access,'/factors',{factor_type:'totp',friendly_name:friendlyName,issuer:'AgoraWeave'},transport,async value=>enrollment(value));
}
export async function challengeTotp(access:string,factorId:string,transport:typeof fetch=fetch):Promise<{id:string;type:'totp';expires_at:number}> {
  claimsOf(access);if(!matches(factorId,uuid)) invalid();
  return await exchange(access,`/factors/${factorId}/challenge`,{},transport,async value=>{
    const now=Math.floor(Date.now()/1000);
    if(!matches(value.id,uuid)||value.type!=='totp'||!Number.isSafeInteger(value.expires_at)||Number(value.expires_at)<=now||Number(value.expires_at)>now+3600) unconfirmed();
    return {id:value.id,type:'totp' as const,expires_at:value.expires_at as number};
  });
}
function normalizedPhone(value:unknown):string|null {return matches(value,/^\+?[1-9]\d{7,14}$/)?value.replace(/^\+/,''):null;}
function phoneConfirmed(value:unknown):boolean {
  if(!matches(value,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/)) return false;
  const time=Date.parse(value);if(!Number.isFinite(time)||time>Date.now()) return false;
  const day=Number(value.slice(8,10)),month=Number(value.slice(5,7)),year=Number(value.slice(0,4));
  const zone=/(Z|[+-]\d{2}:\d{2})$/.exec(value)![1];
  return year>=1970&&month>=1&&month<=12&&day>=1&&day<=new Date(Date.UTC(year,month,0)).getUTCDate()&&
    Number(value.slice(11,13))<24&&Number(value.slice(14,16))<60&&Number(value.slice(17,19))<60&&
    (zone==='Z'||Number(zone.slice(1,3))<24&&Number(zone.slice(4))<60);
}
export async function verifyTotp(access:string,factorId:string,challengeId:string,code:string,expected:{account:string;session:string},
  verifyAccess:(token:string)=>Promise<MfaActor|null>,transport:typeof fetch=fetch):Promise<{actor:MfaActor;tokens:MfaTokens}> {
  const original=claimsOf(access);
  if(!matches(factorId,uuid)||!matches(challengeId,uuid)||!matches(code,/^\d{6}$/)||!record(expected)||
    !matches(expected.account,uuid)||!matches(expected.session,uuid)||original.sub!==expected.account||original.session_id!==expected.session) invalid();
  if(typeof verifyAccess!=='function') throw new MfaError('SERVICE_UNAVAILABLE');
  return await exchange(access,`/factors/${factorId}/verify`,{challenge_id:challengeId,code},transport,async(value,signal)=>{
    if(value.token_type!=='bearer'||!matches(value.access_token,/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)||value.access_token.length>8185||
      !matches(value.refresh_token,/^[A-Za-z0-9._~+/=-]{12,4096}$/)||!record(value.user)) unconfirmed();
    let actor:MfaActor|null;try {actor=await verifyAccess(value.access_token);} catch {invalid();}
    if(signal.aborted) unconfirmed();
    if(!record(actor)||actor.account!==expected.account||actor.session!==expected.session||actor.audience!=='authenticated'||actor.aal!=='aal2'||
      !Number.isSafeInteger(actor.expires_at)||actor.expires_at<=Math.floor(Date.now()/1000)) invalid();
    const claims=claimsOf(value.access_token),user=value.user,phone=normalizedPhone(claims.phone);
    if(claims.sub!==actor.account||claims.session_id!==actor.session||claims.aud!==actor.audience||claims.aal!==actor.aal||claims.exp!==actor.expires_at||
      !Array.isArray(claims.amr)||!claims.amr.some(entry=>record(entry)&&entry.method==='totp'&&Number.isSafeInteger(entry.timestamp)&&Number(entry.timestamp)<=Math.floor(Date.now()/1000)&&Number(entry.timestamp)>0)||
      user.id!==actor.account||!phone||normalizedPhone(user.phone)!==phone||normalizedPhone(original.phone)!==phone||!phoneConfirmed(user.phone_confirmed_at)||
      user.role!==undefined&&user.role!=='authenticated'||user.aud!==undefined&&user.aud!=='authenticated') invalid();
    return {actor:{account:actor.account,session:actor.session,audience:actor.audience,aal:actor.aal,expires_at:actor.expires_at},
      tokens:{access_token:value.access_token,refresh_token:value.refresh_token,expires_at:actor.expires_at}};
  });
}
