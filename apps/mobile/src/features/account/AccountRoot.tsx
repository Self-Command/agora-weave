import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { accountApi, AccountError, type SessionTokens } from './api';
import { clearSession, readSession, saveSession } from './session-store';
import { AuthScreen } from './AuthScreen';
import { AccountSecurityScreen } from './AccountSecurityScreen';
import { RecoveryScreen } from './RecoveryScreen';
import { Action, useAccountColors } from './components';

export default function AccountRoot() {
  const colors = useAccountColors();
  const [session,setSession] = useState<SessionTokens | null>(null);
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');
  const [recovery,setRecovery] = useState<{ trusted: boolean } | null>(null);
  const api = useMemo(() => accountApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__),[]);
  const restore = useCallback(async () => {
    setReady(false); setSession(null); setError('');
    try {
      let value = await readSession();
      if (value && value.expires_at <= Date.now()/1000) {
        value = (await api.refresh(value.refresh_token)).session; await saveSession(value);
      }
      setSession(value);
    } catch (failure) {
      if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') await clearSession();
      else setError(failure instanceof Error ? failure.message : '无法读取安全登录信息，请重试');
    } finally { setReady(true); }
  },[api]);
  useEffect(() => { void restore(); },[restore]);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => void restore(),Math.max(0,session.expires_at*1000-Date.now()));
    return () => clearTimeout(timer);
  },[session,restore]);
  const signedOut = useCallback(async () => { setRecovery(null); setSession(null); await clearSession(); },[]);
  const authenticated = useCallback(async (value: SessionTokens) => { await saveSession(value); setSession(value); },[]);
  return <SafeAreaView style={{ flex: 1,backgroundColor: colors.bg }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {!ready ? <ActivityIndicator accessibilityLabel="读取登录状态" style={{ padding: 32 }} /> : error ? <>
        <Text accessibilityRole="alert" style={{ color: colors.error,padding: 24 }}>{error}</Text><Action title="重试" onPress={() => void restore()} />
      </> : session ? recovery ? <RecoveryScreen api={api} session={session} trusted={recovery.trusted} onBack={() => setRecovery(null)} onSignedOut={signedOut} />
        : <AccountSecurityScreen api={api} session={session} onSignedOut={signedOut} onRecovery={trusted => setRecovery({ trusted })} />
        : <AuthScreen api={api} onAuthenticated={authenticated} />}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
