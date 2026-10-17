// Official SendSms and ACS3 signing contracts:
// https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-sendsms
// https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature
export type AliyunSmsInput = { phone:string;otp:string;requestId:string };
export type AliyunSmsConfig = { accessKeyId:string;accessKeySecret:string;signName:string;templateCode:string };
export class SmsError extends Error {
  readonly code:'SERVICE_UNAVAILABLE'|'SMS_UNCONFIRMED';
  constructor(code:'SERVICE_UNAVAILABLE'|'SMS_UNCONFIRMED') {
    super(code); this.name='SmsError'; this.code=code;
  }
}

const endpoint='https://dysmsapi.aliyuncs.com/';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder=new TextEncoder();
const hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer),value=>value.toString(16).padStart(2,'0')).join('');
const digest=async(value:string)=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const encode=(value:string)=>encodeURIComponent(value).replace(/[!'()*]/g,value=>'%'+value.charCodeAt(0).toString(16).toUpperCase());
const record=(value:unknown):value is Record<string,unknown>=>value!==null && typeof value==='object' && !Array.isArray(value);
const matches=(value:unknown,pattern:RegExp):value is string=>typeof value==='string' && value.trim()===value && pattern.test(value);
function fail():never {throw new SmsError('SMS_UNCONFIRMED');}

async function boundedJson(response:Response,signal:AbortSignal):Promise<Record<string,unknown>> {
  const length=response.headers.get('content-length');
  if(signal.aborted || length!==null && (!/^\d+$/.test(length) || Number(length)>16384) ||
    !/^application\/json(?:\s*;[^\r\n]*)?$/i.test(response.headers.get('content-type')||'') || !response.body) {
    void response.body?.cancel().catch(()=>{}); fail();
  }
  const reader=response.body.getReader();
  const cancel=()=>{void reader.cancel().catch(()=>{});};
  signal.addEventListener('abort',cancel,{once:true});
  try {
    const chunks:Uint8Array[]=[]; let size=0;
    for(;;) {
      const part=await reader.read();
      if(part.done) break;
      size+=part.value.byteLength;
      if(size>16384) {cancel(); fail();}
      chunks.push(part.value);
    }
    if(signal.aborted || length!==null && Number(length)!==size) fail();
    const bytes=new Uint8Array(size); let offset=0;
    for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
    const value:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if(!record(value)) fail();
    return value;
  } finally {
    signal.removeEventListener('abort',cancel); reader.releaseLock();
  }
}

/** One provider attempt. OutId traces the operation; Aliyun does not promise deduplication.
 * An accepted response is submission acceptance, not handset delivery confirmation.
 * Once transport starts, an uncertain outcome must be reconciled, never automatically retried.
 */
export async function sendAliyunSms(input:AliyunSmsInput,config:AliyunSmsConfig,
  transport:typeof fetch=fetch,now:()=>Date=()=>new Date(),nonce:()=>string=()=>crypto.randomUUID()):Promise<{provider_ref:string}> {
  if(!record(input) || !record(config) || Object.keys(input).some(key=>!['phone','otp','requestId'].includes(key)) ||
    Object.keys(config).some(key=>!['accessKeyId','accessKeySecret','signName','templateCode'].includes(key)) ||
    !matches(input.phone,/^\+[1-9]\d{7,14}$/) || !matches(input.otp,/^\d{6}$/) || !matches(input.requestId,uuid) ||
    !matches(config.accessKeyId,/^[a-zA-Z0-9]{8,128}$/) || !matches(config.accessKeySecret,/^[a-zA-Z0-9+/_=.-]{16,128}$/) ||
    !matches(config.signName,/^[\p{L}\p{N}（）()· ._-]{2,12}$/u) || config.signName.trim()!==config.signName ||
    !matches(config.templateCode,/^SMS_\d{1,32}$/)) throw new SmsError('SERVICE_UNAVAILABLE');
  let headers:Record<string,string>; let body:string;
  try {
    const date=now(),unique=nonce();
    if(!(date instanceof Date) || !Number.isFinite(date.getTime()) || date.getUTCFullYear()<1970 || date.getUTCFullYear()>9999 ||
      !matches(unique,/^[a-zA-Z0-9-]{16,128}$/))
      throw new SmsError('SERVICE_UNAVAILABLE');
    body=Object.entries({OutId:input.requestId,PhoneNumbers:input.phone.slice(1),SignName:config.signName,
      TemplateCode:config.templateCode,TemplateParam:JSON.stringify({code:input.otp})})
      .map(([key,value])=>`${encode(key)}=${encode(value)}`).join('&');
    headers={'content-type':'application/x-www-form-urlencoded',host:'dysmsapi.aliyuncs.com',
      'x-acs-action':'SendSms','x-acs-content-sha256':await digest(body),
      'x-acs-date':date.toISOString().replace(/\.\d{3}Z$/,'Z'),'x-acs-signature-nonce':unique,'x-acs-version':'2017-05-25'};
    const names=Object.keys(headers).sort(),signedHeaders=names.join(';');
    const canonical=['POST','/','',names.map(name=>`${name}:${headers[name]}\n`).join(''),signedHeaders,headers['x-acs-content-sha256']].join('\n');
    const key=await crypto.subtle.importKey('raw',encoder.encode(config.accessKeySecret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const signature=hex(await crypto.subtle.sign('HMAC',key,encoder.encode(`ACS3-HMAC-SHA256\n${await digest(canonical)}`)));
    headers.authorization=`ACS3-HMAC-SHA256 Credential=${config.accessKeyId},SignedHeaders=${signedHeaders},Signature=${signature}`;
    headers.accept='application/json';
  } catch {throw new SmsError('SERVICE_UNAVAILABLE');}

  const controller=new AbortController(); let timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Promise<never>((_resolve,reject)=>{
    timer=setTimeout(()=>{controller.abort();reject(new SmsError('SMS_UNCONFIRMED'));},10000);
  });
  try {
    return await Promise.race([timeout,(async()=>{
      const response=await transport(endpoint,{method:'POST',headers,body,redirect:'manual',credentials:'omit',signal:controller.signal});
      if(response.redirected || response.url && response.url!==endpoint || response.status>=300 && response.status<400 || response.status>=500) {
        void response.body?.cancel().catch(()=>{}); fail();
      }
      const value=await boundedJson(response,controller.signal);
      if(!matches(value.RequestId,uuid) || !matches(value.Code,/^[a-zA-Z0-9_.-]{1,128}$/)) fail();
      if(value.Code!=='OK') throw new SmsError('SERVICE_UNAVAILABLE');
      if(!response.ok || !matches(value.BizId,/^[a-zA-Z0-9^_-]{1,128}$/)) fail();
      return {provider_ref:value.BizId};
    })()]);
  } catch(error) {
    if(error instanceof SmsError) throw error;
    throw new SmsError('SMS_UNCONFIRMED');
  } finally {clearTimeout(timer);}
}
