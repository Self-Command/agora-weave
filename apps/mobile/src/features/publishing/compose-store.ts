import * as SecureStore from 'expo-secure-store';
import type { RevisionReceipt } from './post-api';
import type { UploadImage } from './image-upload';

export type ComposeDraft={
  body:string;visibility:'public'|'followers'|'self';replyScope:'all_readers'|'author_follows'|'mentioned'|'closed';
  operationId:string;phase:'editing'|'failed'|'unknown'|'accepted';receipt:RevisionReceipt|null;images:UploadImage[];
};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function decodeBase64Url(input:string) {
  let bits=0,value=0,result='';
  for(const character of input.replace(/-/g,'+').replace(/_/g,'/').replace(/=+$/,'')) {
    const digit=alphabet.indexOf(character);
    if(digit<0)return '';
    value=(value<<6)|digit;bits+=6;
    if(bits>=8){bits-=8;result+=String.fromCharCode((value>>bits)&255);}
  }
  return result;
}
/** JWT subject only partitions encrypted local drafts; it never grants server authority. */
export function localDraftOwner(accessToken:string):string|null {
  try {
    const value:unknown=JSON.parse(decodeBase64Url(accessToken.split('.')[1] || ''));
    const sub=value && typeof value==='object' && 'sub' in value ? value.sub : null;
    return typeof sub==='string' && uuid.test(sub) ? sub : null;
  } catch { return null; }
}
const key=(owner:string)=>`agoraweave.compose.v1.${owner}`;
const chunkSize=400;
let tail:Promise<unknown>=Promise.resolve();
function ordered<T>(action:()=>Promise<T>):Promise<T> {
  const next=tail.then(action,action);tail=next.catch(()=>undefined);return next;
}
export function readComposeDraft(owner:string):Promise<ComposeDraft|null> { return ordered(async()=>{
  const prefix=key(owner),head=await SecureStore.getItemAsync(`${prefix}.head`);
  if(!head)return null;
  let metadata:unknown;
  try { metadata=JSON.parse(head); } catch { return null; }
  if(!metadata || typeof metadata!=='object' || !('slot' in metadata) || !('count' in metadata))return null;
  const slot=(metadata as {slot:unknown}).slot,count=(metadata as {count:unknown}).count;
  if((slot!==0 && slot!==1) || !Number.isSafeInteger(count) || Number(count)<1 || Number(count)>128)return null;
  const chunks=await Promise.all(Array.from({length:Number(count)},(_,index)=>SecureStore.getItemAsync(`${prefix}.${slot}.${index}`)));
  if(chunks.some(chunk=>chunk===null))return null;
  let data:unknown;
  try { data=JSON.parse(chunks.join('')); } catch { return null; }
  if(!data || typeof data!=='object')return null;
  const draft=data as ComposeDraft;
  if(draft.images===undefined)draft.images=[];
  return typeof draft.body==='string' && uuid.test(draft.operationId) && Array.isArray(draft.images) && draft.images.length<=9 &&
    draft.images.every(image=>image && typeof image==='object' && uuid.test(image.id) &&
      typeof image.uri==='string' && image.uri.startsWith('file://') &&
      ['image/jpeg','image/png'].includes(image.mime) && Number.isSafeInteger(image.sizeBytes) && image.sizeBytes>0 && image.sizeBytes<=10_000_000 &&
      /^[a-f0-9]{64}$/.test(image.sha256) && ['selected','uploading','ready','failed','unknown'].includes(image.phase) &&
      [null,'create','part','complete'].includes(image.step) &&
      uuid.test(image.createOperationId) && uuid.test(image.partOperationId) && uuid.test(image.completeOperationId) &&
      (image.uploadId===null || uuid.test(image.uploadId)) && (image.mediaId===null || uuid.test(image.mediaId)) &&
      Array.isArray(image.uploadedParts) && image.uploadedParts.every(part=>Number.isSafeInteger(part) && part>=0) &&
      (image.phase!=='ready' || (uuid.test(image.uploadId || '') && uuid.test(image.mediaId || ''))) &&
      (image.phase!=='unknown' || image.step!==null)) &&
    ['public','followers','self'].includes(draft.visibility) &&
    ['all_readers','author_follows','mentioned','closed'].includes(draft.replyScope) &&
    ['editing','failed','unknown','accepted'].includes(draft.phase) ? draft : null;
}); }
export function saveComposeDraft(owner:string,draft:ComposeDraft):Promise<void> { return ordered(async()=>{
  const prefix=key(owner),raw=JSON.stringify(draft),chunks:string[]=[];
  let chunk='';
  for(const character of raw){
    if(chunk.length+character.length>chunkSize){chunks.push(chunk);chunk='';}
    chunk+=character;
  }
  if(chunk)chunks.push(chunk);
  if(chunks.length>128)throw new Error('本机草稿过长，暂时无法安全保存');
  const old=await SecureStore.getItemAsync(`${prefix}.head`);
  let slot=0;
  if(old){try { slot=JSON.parse(old).slot===0?1:0; } catch { /* Rebuild an unreadable marker. */ }}
  for(let index=0;index<chunks.length;index++)await SecureStore.setItemAsync(`${prefix}.${slot}.${index}`,chunks[index]);
  await SecureStore.setItemAsync(`${prefix}.head`,JSON.stringify({slot,count:chunks.length}));
}); }
