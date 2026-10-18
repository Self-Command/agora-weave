import * as SecureStore from 'expo-secure-store';
import type { Profile } from './api';
import type { UploadImage } from '../publishing/image-upload';

export type ProfileEditDraft={
  accountId:string;baseVersion:number;operationId:string;
  original:{nickname:string;username:string;bio:string};
  nickname:string;username:string;bio:string;
  avatar?:UploadImage|null;
  background?:UploadImage|null;
  phase:'editing'|'conflict'|'unknown'|'accepted';
};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const key=(accountId:string)=>`agoraweave.profile-edit.v1.${accountId}`;
let tail:Promise<unknown>=Promise.resolve();
function ordered<T>(action:()=>Promise<T>):Promise<T>{const next=tail.then(action,action);tail=next.catch(()=>undefined);return next;}
export function initialProfileDraft(profile:Profile,operationId:string):ProfileEditDraft {
  return {accountId:profile.account_id,baseVersion:profile.row_version,operationId,
    original:{nickname:profile.nickname,username:profile.username,bio:profile.bio},
    nickname:profile.nickname,username:profile.username,bio:profile.bio,avatar:null,background:null,phase:'editing'};
}
export function blankProfileDraft(accountId:string,operationId:string):ProfileEditDraft {
  return {accountId,baseVersion:1,operationId,original:{nickname:'',username:'',bio:''},
    nickname:'',username:'',bio:'',avatar:null,background:null,phase:'editing'};
}
export function readProfileDraft(accountId:string):Promise<ProfileEditDraft|null>{return ordered(async()=>{
  const raw=await SecureStore.getItemAsync(key(accountId));
  if(!raw)return null;
  try {
    const value:unknown=JSON.parse(raw);
    if(!value || typeof value!=='object')return null;
    const draft=value as ProfileEditDraft;
    if(draft.accountId!==accountId || !uuid.test(draft.operationId) || !Number.isSafeInteger(draft.baseVersion) || draft.baseVersion<1 ||
      !['editing','conflict','unknown','accepted'].includes(draft.phase) ||
      [draft.avatar,draft.background].some(image=>image!==undefined && image!==null && (!uuid.test(image.id) ||
        !['selected','uploading','ready','failed','unknown'].includes(image.phase) ||
        !['create','part','complete',null].includes(image.step) ||
        typeof image.uri!=='string' || !image.uri.startsWith('file://') ||
        !Number.isSafeInteger(image.sizeBytes) || image.sizeBytes<1 || image.sizeBytes>10_000_000 ||
        !/^[a-f0-9]{64}$/.test(image.sha256))) ||
      ['nickname','username','bio'].some(field=>typeof draft[field as keyof ProfileEditDraft]!=='string' ||
        !draft.original || typeof draft.original[field as keyof typeof draft.original]!=='string'))return null;
    return draft;
  }catch{return null;}
});}
export function saveProfileDraft(draft:ProfileEditDraft):Promise<void>{return ordered(async()=>{
  await SecureStore.setItemAsync(key(draft.accountId),JSON.stringify(draft),{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
});}
