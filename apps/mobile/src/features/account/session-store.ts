import * as SecureStore from 'expo-secure-store';
import type { SessionTokens } from './api';
import { storedSession, validTokens } from './session-policy';

const key = 'agoraweave.session.v1';
export async function readSession(): Promise<SessionTokens | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  const value = storedSession(raw);
  if (!value) { await clearSession(); return null; }
  return value;
}
export async function saveSession(value: SessionTokens) {
  if (!validTokens(value) || value.expires_at <= Date.now() / 1000) throw new Error('登录信息无效，请重试');
  await SecureStore.setItemAsync(key,JSON.stringify(value),{ keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}
export const clearSession = () => SecureStore.deleteItemAsync(key);
