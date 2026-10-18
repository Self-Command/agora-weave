import * as SecureStore from 'expo-secure-store';

export type ReportDraft={owner:string;targetKind:'post'|'account'|'comment';targetId:string;reason:string;
  operationId:string;phase:'editing'|'unknown'|'accepted';};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const key=(owner:string)=>`agoraweave.report.v1.${owner}`;
let tail:Promise<unknown>=Promise.resolve();
function ordered<T>(action:()=>Promise<T>):Promise<T>{const next=tail.then(action,action);tail=next.catch(()=>undefined);return next;}
export function readReportDraft(owner:string):Promise<ReportDraft|null>{return ordered(async()=>{
  const prefix=key(owner),head=await SecureStore.getItemAsync(`${prefix}.head`);
  if(!head)return null;
  try{
    const meta:unknown=JSON.parse(head);
    if(!meta || typeof meta!=='object' || !('slot' in meta) || !('count' in meta))return null;
    const {slot,count}=meta as {slot:unknown;count:unknown};
    if((slot!==0 && slot!==1) || !Number.isSafeInteger(count) || Number(count)<1 || Number(count)>64)return null;
    const chunks=await Promise.all(Array.from({length:Number(count)},(_,index)=>SecureStore.getItemAsync(`${prefix}.${slot}.${index}`)));
    if(chunks.some(chunk=>chunk===null))return null;
    const value:unknown=JSON.parse(chunks.join(''));
    if(!value || typeof value!=='object')return null;
    const draft=value as ReportDraft;
    return draft.owner===owner && ['post','account','comment'].includes(draft.targetKind) && uuid.test(draft.targetId) &&
      uuid.test(draft.operationId) && typeof draft.reason==='string' && draft.reason.length<=8000 &&
      ['editing','unknown','accepted'].includes(draft.phase)?draft:null;
  }catch{return null;}
});}
export function saveReportDraft(draft:ReportDraft):Promise<void>{return ordered(async()=>{
  const prefix=key(draft.owner),raw=JSON.stringify(draft),chunks:string[]=[];
  for(let index=0;index<raw.length;index+=400)chunks.push(raw.slice(index,index+400));
  if(chunks.length>64)throw new Error('举报说明过长，暂时无法安全保存');
  let slot=0;
  const old=await SecureStore.getItemAsync(`${prefix}.head`);
  if(old){try{slot=JSON.parse(old).slot===0?1:0;}catch{/* Rebuild unreadable marker. */}}
  for(let index=0;index<chunks.length;index++)await SecureStore.setItemAsync(`${prefix}.${slot}.${index}`,chunks[index]);
  await SecureStore.setItemAsync(`${prefix}.head`,JSON.stringify({slot,count:chunks.length}));
});}
