import {randomUUID} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type {components} from '../../../../../packages/contracts/src/generated/app';
import {AccountError,accountApi} from '../account/api';
import {currentProfileSession} from './session';

type Receipt=components['schemas']['ActionReceipt'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==='object' && !Array.isArray(value);
const valid=(value:unknown,id:string,target:string):value is Receipt=>record(value)&&value.operation_id===id&&
  value.target_ref===target&&value.state==='succeeded'&&Array.isArray(value.allowed_actions)&&value.allowed_actions.length===0;
const key=(owner:string,target:string)=>`agoraweave.block.v1.${owner}.${target}`;
export class BlockError extends Error{constructor(public code:string,message:string){super(message);}}
export function blockApi(base:string|undefined,release:string,development=false){
  let root:string;
  try{const url=new URL(base||'');if(url.username||url.password||url.search||url.hash||
    !/^[A-Za-z0-9_.-]{1,128}$/.test(release)||
    (url.protocol!=='https:'&&!(development&&url.protocol==='http:'&&['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))))throw new Error();
    root=url.toString().replace(/\/$/,'');}catch{root='';}
  const accounts=accountApi(base,release,development);
  return async (target:string):Promise<string>=>{
    if(!uuid.test(target)||!root)throw new BlockError('INVALID_INPUT','账号地址无效');
    const current=await currentProfileSession();
    if(!current)throw new BlockError('SESSION_INVALID','请先登录');
    if(current.accountId===target)throw new BlockError('INVALID_INPUT','不能拉黑自己的账号');
    const storageKey=key(current.accountId,target);
    let pending=await SecureStore.getItemAsync(storageKey);
    if(pending && uuid.test(pending)){
      try{
        const operation=await accounts.operation(current.session.access_token,pending);
        if(operation.operation_id!==pending||operation.action!=='block.put')throw new BlockError('CONFLICT','原操作记录不匹配');
        if(operation.state==='succeeded'&&valid(operation.result,pending,target)){
          await SecureStore.deleteItemAsync(storageKey);return '已拉黑此账号';
        }
        if(operation.state==='pending'||operation.state==='unknown')throw new BlockError('NETWORK_UNCONFIRMED','原操作仍待确认，请稍后查询');
        if(operation.state==='failed'){await SecureStore.deleteItemAsync(storageKey);pending=null;}
      }catch(error){if(!(error instanceof AccountError && error.code==='NOT_FOUND'))throw error;}
    }
    const operationId=pending&&uuid.test(pending)?pending:randomUUID();
    if(!pending)await SecureStore.setItemAsync(storageKey,operationId);
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch(root+`/me/blocks/${target}`,{method:'PUT',credentials:'omit',cache:'no-store',signal:abort.signal,
        headers:{'Content-Type':'application/json',Accept:'application/json','X-Client-Release':release,
          Authorization:`Bearer ${current.session.access_token}`},body:JSON.stringify({operation_id:operationId})});
      const raw=await response.text();if(raw.length>1024*1024)throw new BlockError('NETWORK_UNCONFIRMED','拉黑结果待确认，请再次查询');
      let envelope:unknown;try{envelope=JSON.parse(raw);}catch{throw new BlockError('NETWORK_UNCONFIRMED','拉黑结果待确认，请再次查询');}
      if(!response.ok){const code=record(envelope)&&typeof envelope.code==='string'?envelope.code:'SERVICE_UNAVAILABLE';
        if(response.status<500&&response.status!==429)await SecureStore.deleteItemAsync(storageKey);
        throw new BlockError(code,response.status===401?'请重新登录':response.status===404?'账号不可用':
          response.status>=500?'拉黑结果待确认，请再次查询':'拉黑失败，请稍后重试');}
      const receipt=record(envelope)?envelope.data:null;
      if(response.status!==200||!valid(receipt,operationId,target))throw new BlockError('NETWORK_UNCONFIRMED','拉黑回执无法确认，请再次查询');
      await SecureStore.deleteItemAsync(storageKey);return '已拉黑此账号';
    }catch(error){if(error instanceof BlockError)throw error;throw new BlockError('NETWORK_UNCONFIRMED','网络中断，拉黑结果待确认，请再次查询');}
    finally{clearTimeout(timer);}
  };
}
