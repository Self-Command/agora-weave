import * as SecureStore from 'expo-secure-store';

export type AppealDraft={owner:string;sanctionId:string;statement:string;operationId:string;
  phase:'editing'|'unknown'|'accepted'};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const key=(owner:string)=>`agoraweave.appeal.v1.${owner}`;
let tail:Promise<unknown>=Promise.resolve();
function ordered<T>(action:()=>Promise<T>):Promise<T>{const next=tail.then(action,action);tail=next.catch(()=>undefined);return next;}
export function readAppealDraft(owner:string):Promise<AppealDraft|null>{return ordered(async()=>{
  const prefix=key(owner),head=await SecureStore.getItemAsync(`${prefix}.head`);
  if(!head)return null;
  try{
    const meta:unknown=JSON.parse(head);
    if(!meta || typeof meta!=='object' || !('slot' in meta) || !('count' in meta))return null;
    const {slot,count}=meta as {slot:unknown;count:unknown};
    if((slot!==0 && slot!==1) || !Number.isSafeInteger(count) || Number(count)<1 || Number(count)>128)return null;
    const chunks=await Promise.all(Array.from({length:Number(count)},(_,index)=>SecureStore.getItemAsync(`${prefix}.${slot}.${index}`)));
    if(chunks.some(chunk=>chunk===null))return null;
    const value:unknown=JSON.parse(chunks.join(''));
    if(!value || typeof value!=='object')return null;
    const draft=value as AppealDraft;
    return draft.owner===owner && uuid.test(draft.sanctionId) && uuid.test(draft.operationId) &&
      typeof draft.statement==='string' && draft.statement.length<=20000 &&
      ['editing','unknown','accepted'].includes(draft.phase)?draft:null;
  }catch{return null;}
});}
export function saveAppealDraft(draft:AppealDraft):Promise<void>{return ordered(async()=>{
  const prefix=key(draft.owner),raw=JSON.stringify(draft),chunks:string[]=[];
  for(let index=0;index<raw.length;index+=400)chunks.push(raw.slice(index,index+400));
  if(chunks.length>128)throw new Error('申诉说明过长，暂时无法安全保存');
  let slot=0;
  const old=await SecureStore.getItemAsync(`${prefix}.head`);
  if(old){try{slot=JSON.parse(old).slot===0?1:0;}catch{/* Rebuild unreadable marker. */}}
  for(let index=0;index<chunks.length;index++)await SecureStore.setItemAsync(`${prefix}.${slot}.${index}`,chunks[index]);
  await SecureStore.setItemAsync(`${prefix}.head`,JSON.stringify({slot,count:chunks.length}));
});}
