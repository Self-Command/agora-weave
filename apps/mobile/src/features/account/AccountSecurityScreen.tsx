import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { AccountError, type AccountApi, type DeviceSession, type SessionTokens } from './api';
import { Action, useAccountColors } from './components';
import { confirmRevocation } from './recovery';

export function AccountSecurityScreen({ api,session,onSignedOut }: { api: AccountApi; session: SessionTokens; onSignedOut: () => Promise<void> }) {
  const colors = useAccountColors();
  const [items,setItems] = useState<DeviceSession[]>([]);
  const [next,setNext] = useState<string | null>(null);
  const [loading,setLoading] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const logoutCommand = useRef<string | null>(null);
  const revocations = useRef(new Map<string,{ id: string; version: number }>());
  const generation = useRef(0);
  const handleFailure = useCallback(async (failure: unknown) => {
    if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') { setItems([]); setNext(null); await onSignedOut(); return; }
    setError(failure instanceof Error ? failure.message : '加载失败，请重试');
  },[onSignedOut]);
  const load = useCallback(async (cursor?: string) => {
    const ticket = ++generation.current;
    setLoading(true); setError(''); if (!cursor) { setItems([]); setNext(null); }
    try {
      const page = await api.sessions(session.access_token,cursor);
      if (ticket !== generation.current || AppState.currentState !== 'active') return;
      setItems(previous => cursor ? [...previous,...page.items.filter(item => !previous.some(old => old.id === item.id))] : page.items);
      setNext(page.next_cursor);
    } catch (failure) { if (ticket === generation.current) await handleFailure(failure); }
    finally { if (ticket === generation.current) setLoading(false); }
  },[api,session.access_token,handleFailure]);
  useEffect(() => { void load(); return () => { generation.current++; }; },[load]);
  useEffect(() => {
    const listener = AppState.addEventListener('change',state => { generation.current++; setItems([]); setNext(null); if (state === 'active') void load(); });
    return () => listener.remove();
  },[load]);
  async function revoke(item: DeviceSession) {
    setBusy(true); setError(''); let command = revocations.current.get(item.id);
    if (!command) { command = { id: randomUUID(),version: item.row_version }; revocations.current.set(item.id,command); }
    try { await api.revoke(session.access_token,item.id,command.version,command.id); revocations.current.delete(item.id); await load(); }
    catch (failure) {
      try {
        if (await confirmRevocation(api,session.access_token,command.id,failure)) { revocations.current.delete(item.id); await load(); return; }
      } catch (lookupFailure) { await handleFailure(lookupFailure); return; }
      if (failure instanceof AccountError && failure.code === 'CONFLICT') { revocations.current.delete(item.id); await load(); }
      await handleFailure(failure);
    } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError(''); logoutCommand.current ??= randomUUID();
    try { await api.logout(session.access_token,logoutCommand.current); setItems([]); setNext(null); await onSignedOut(); }
    catch (failure) { await handleFailure(failure); } finally { setBusy(false); }
  }
  return <ScrollView contentContainerStyle={styles.container}>
    <Text accessibilityRole="header" style={[styles.title,{ color: colors.fg }]}>账号安全</Text>
    <Text style={[styles.body,{ color: colors.secondary }]}>查看当前有效设备，或撤销其他设备的登录。</Text>
    <Action title="刷新设备列表" onPress={() => void load()} disabled={loading || busy} />
    {loading && <ActivityIndicator accessibilityLabel="加载设备列表" />}
    {!loading && !error && items.length === 0 && <Text style={{ color: colors.secondary }}>当前没有可显示的设备</Text>}
    {items.map(item => <View key={item.id} style={[styles.device,{ borderColor: colors.line }]}>
      <Text style={[styles.deviceTitle,{ color: colors.fg }]}>{item.device_label || '未命名设备'}{item.current ? ' · 当前设备' : ''}</Text>
      <Text style={{ color: colors.secondary }}>登录于 {new Date(item.created_at).toLocaleString()}</Text>
      {!item.current && <Action title="撤销此设备登录" disabled={busy || loading} onPress={() => Alert.alert('撤销设备登录','此设备后续访问将被拒绝，需要重新登录。',
        [{ text: '取消',style: 'cancel' },{ text: '撤销登录',style: 'destructive',onPress: () => void revoke(item) }])} />}
    </View>)}
    {next && <Action title="加载更多设备" onPress={() => void load(next)} disabled={loading || busy} />}
    {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.body,{ color: colors.error }]}>{error}</Text>}
    <Action title={busy ? '处理中…' : '退出当前登录'} disabled={busy || loading} onPress={() => Alert.alert('退出登录','将撤销当前会话并清除本机登录信息。',
      [{ text: '取消',style: 'cancel' },{ text: '退出',style: 'destructive',onPress: () => void logout() }])} />
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: 24,gap: 16,paddingBottom: 48 },title: { fontSize: 22,fontWeight: '700' },body: { fontSize: 16,lineHeight: 26 },
  device: { borderBottomWidth: 1,paddingVertical: 16,gap: 10 },deviceTitle: { fontSize: 17,fontWeight: '600' } });
