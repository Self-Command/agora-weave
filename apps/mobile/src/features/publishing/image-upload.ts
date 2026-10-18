import { CryptoDigestAlgorithm,digest,randomUUID } from 'expo-crypto';
import { Directory,File,Paths } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas=components['schemas'];
export type UploadSession=Schemas['UploadSession'];
export type UploadImage={
  id:string;uri:string;mime:'image/jpeg'|'image/png';sizeBytes:number;sha256:string;
  phase:'selected'|'uploading'|'ready'|'failed'|'unknown';
  step:'create'|'part'|'complete'|null;
  createOperationId:string;partOperationId:string;completeOperationId:string;
  uploadId:string|null;mediaId:string|null;uploadedParts:number[];
};

export class UploadError extends Error {
  constructor(public code:string,message:string,public unknown=false) { super(message); }
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digestPattern=/^[a-f0-9]{64}$/;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const limit=10_000_000;
const hex=(bytes:Uint8Array)=>Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');

function imageMime(bytes:Uint8Array):UploadImage['mime']|null {
  if(bytes.length>=3 && bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff)return 'image/jpeg';
  if(bytes.length>=8 && [137,80,78,71,13,10,26,10].every((byte,index)=>bytes[index]===byte))return 'image/png';
  return null;
}

export async function keepSelectedImage(uri:string):Promise<UploadImage> {
  if(!uri.startsWith('file://'))throw new UploadError('INVALID_INPUT','所选图片无法读取，请重新选择');
  const source=new File(uri);
  if(!source.exists || !source.size || source.size>limit)throw new UploadError('INVALID_INPUT',source.size && source.size>limit?'图片超过 10 MB，请选择较小的 JPEG 或 PNG':'所选图片无法读取，请重新选择');
  const bytes=await source.bytes();
  if(bytes.length<1 || bytes.length>limit)throw new UploadError('INVALID_INPUT','图片大小不符合要求，请重新选择');
  const mime=imageMime(bytes);
  if(!mime)throw new UploadError('INVALID_INPUT','仅支持 JPEG 或 PNG 静态图片');
  const sha256=hex(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256,bytes)));
  const directory=new Directory(Paths.document,'compose-images');
  directory.create({ idempotent:true,intermediates:true });
  const id=randomUUID(),destination=new File(directory,`${id}.${mime==='image/jpeg'?'jpg':'png'}`);
  try {
    source.copy(destination);
    if(destination.size!==bytes.length)throw new UploadError('FILE_CHANGED','图片保存不完整，请重新选择');
    return { id,uri:destination.uri,mime,sizeBytes:bytes.length,sha256,phase:'selected',step:null,
      createOperationId:randomUUID(),partOperationId:randomUUID(),completeOperationId:randomUUID(),
      uploadId:null,mediaId:null,uploadedParts:[] };
  } catch(error) {
    if(destination.exists)destination.delete();
    throw error;
  }
}

export function discardLocalImage(image:UploadImage):void {
  try { const file=new File(image.uri);if(file.exists)file.delete(); } catch { /* Keep remote state authoritative. */ }
}

export async function imageBytes(image:UploadImage):Promise<Uint8Array> {
  const file=new File(image.uri);
  if(!file.exists || file.size!==image.sizeBytes || image.sizeBytes<1 || image.sizeBytes>limit)
    throw new UploadError('FILE_MISSING','本机图片已不可用，请重新选择');
  const bytes=await file.bytes();
  if(bytes.length!==image.sizeBytes || imageMime(bytes)!==image.mime ||
    hex(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256,bytes)))!==image.sha256)
    throw new UploadError('FILE_CHANGED','本机图片已变化，请重新选择');
  return bytes;
}

export function validUploadSession(value:unknown):value is UploadSession {
  return record(value) && typeof value.id==='string' && uuid.test(value.id) &&
    typeof value.media_id==='string' && uuid.test(value.media_id) &&
    ['allocated','uploading','uploaded','validated','failed','quarantined'].includes(String(value.state)) &&
    typeof value.expires_at==='string' && Number.isFinite(Date.parse(value.expires_at)) &&
    Array.isArray(value.uploaded_parts) && value.uploaded_parts.every((part:unknown)=>Number.isSafeInteger(part) && Number(part)>=0) &&
    Array.isArray(value.reusable_refs) && value.reusable_refs.every((ref:unknown)=>typeof ref==='string' && uuid.test(ref));
}

export function uploadApi(base:string|undefined,release:string,development=false,intent:'post'|'profile'='post') {
  let root:string;
  try {
    const url=new URL(base || '');
    if(!/^[A-Za-z0-9_.-]{1,128}$/.test(release) || url.username || url.password || url.search || url.hash ||
      (url.protocol!=='https:' && !(development && url.protocol==='http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    root=url.toString().replace(/\/$/,'');
  } catch { root=''; }
  async function call<T>(path:string,method:'POST'|'PUT',token:string,operationId:string,body:object|File,
    valid:(data:unknown)=>data is T):Promise<T> {
    if(!root)throw new UploadError('SERVICE_UNAVAILABLE','上传服务暂时不可用');
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),30000);
    try {
      const binary=body instanceof File;
      const response=await expoFetch(root+path,{ method,credentials:'omit',signal:abort.signal,
        headers:{ 'Content-Type':binary?'application/octet-stream':'application/json',Accept:'application/json',
          'X-Client-Release':release,'X-Operation-Id':operationId,Authorization:`Bearer ${token}` },
        body:binary?body:JSON.stringify(body) });
      const raw=await response.text();
      if(raw.length>1024*1024)throw new UploadError('NETWORK_UNCONFIRMED','上传结果无法确认，请查询原操作',true);
      let envelope:unknown;
      try { envelope=JSON.parse(raw); } catch { throw new UploadError('NETWORK_UNCONFIRMED','上传结果无法确认，请查询原操作',true); }
      if(response.status===200) {
        const data=record(envelope)?envelope.data:undefined;
        if(!valid(data))throw new UploadError('NETWORK_UNCONFIRMED','上传回执无法确认，请查询原操作',true);
        return data;
      }
      if(response.ok)throw new UploadError('NETWORK_UNCONFIRMED','上传回执无法确认，请查询原操作',true);
      const code=response.status===401?'SESSION_INVALID':record(envelope) && typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
      const unknown=response.status>=500 || code==='NETWORK_UNCONFIRMED';
      throw new UploadError(code,response.status===401?'登录已失效，请重新登录':response.status===403?'当前账号不能上传此图片':
        response.status===422?'图片不符合上传要求，请重新选择':response.status===429?'上传过于频繁，请稍后重试':
        unknown?'上传结果待确认，请查询原操作':'图片上传失败，正文和图片已保留',unknown);
    } catch(error) {
      if(error instanceof UploadError)throw error;
      throw new UploadError('NETWORK_UNCONFIRMED','网络中断，上传结果待确认，请查询原操作',true);
    } finally {clearTimeout(timer);}
  }
  return {
    create:(token:string,image:UploadImage)=>call('/uploads','POST',token,image.createOperationId,
      { operation_id:image.createOperationId,intent,kind:'image',size_bytes:image.sizeBytes,sha256:image.sha256 },validUploadSession),
    part:(token:string,image:UploadImage)=>{
      if(!image.uploadId || !uuid.test(image.uploadId))throw new UploadError('INVALID_INPUT','上传会话丢失，请重新选择');
      return call(`/uploads/${encodeURIComponent(image.uploadId)}/parts/0`,'PUT',token,image.partOperationId,new File(image.uri),
        (data):data is Schemas['UploadedPart']=>record(data) && data.upload_id===image.uploadId && data.part===0 &&
          Array.isArray(data.uploaded_parts) && data.uploaded_parts.includes(0));
    },
    complete:(token:string,image:UploadImage)=>{
      if(!image.uploadId || !uuid.test(image.uploadId) || !digestPattern.test(image.sha256))throw new UploadError('INVALID_INPUT','上传会话丢失，请重新选择');
      return call(`/uploads/${encodeURIComponent(image.uploadId)}/complete`,'POST',token,image.completeOperationId,
        { operation_id:image.completeOperationId,sha256:image.sha256 },validUploadSession);
    },
  };
}
