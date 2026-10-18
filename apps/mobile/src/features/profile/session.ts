import Constants from 'expo-constants';
import { accountApi,type SessionTokens } from '../account/api';
import { readSession,saveSession } from '../account/session-store';
import { localDraftOwner } from '../publishing/compose-store';

const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
export async function currentProfileSession():Promise<{accountId:string;session:SessionTokens}|null> {
  let session=await readSession();
  if(!session)return null;
  if(session.expires_at*1000<=Date.now()){
    session=(await accounts.refresh(session.refresh_token)).session;
    await saveSession(session);
  }
  const accountId=localDraftOwner(session.access_token);
  if(!accountId)throw new Error('登录信息无法识别，请重新登录');
  return {accountId,session};
}
