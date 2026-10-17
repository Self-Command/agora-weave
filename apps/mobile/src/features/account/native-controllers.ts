import { AppState } from 'react-native';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { accountApi,type SessionTokens } from './api';
import { clearSession,readSession,saveSession } from './session-store';
import { createSessionController } from './session-controller';
import { createAuthController } from './auth-controller';
import { createSecurityController } from './security-controller';
import { createRecoveryController } from './recovery-controller';

/** Native dependencies are created only when an approved account page needs them. */
export function createNativeAccountControllers() {
  const api = accountApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
  const lifecycle = {
    isActive: () => AppState.currentState === 'active',
    subscribe(listener: () => void) { const subscription = AppState.addEventListener('change',listener); return () => subscription.remove(); },
  };
  const session = createSessionController(api,{ clearSession,readSession,saveSession });
  return {
    session,
    auth: () => createAuthController(api,session.authenticated,randomUUID),
    security: (tokens: SessionTokens) => createSecurityController(api,tokens,session.signedOut,lifecycle,randomUUID),
    recovery: (tokens: SessionTokens) => createRecoveryController(api,tokens,session.signedOut,lifecycle,randomUUID),
  };
}
