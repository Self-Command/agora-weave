import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { AccountError, type AccountApi, type RecoveryCase, type SessionTokens } from './api';
import { Action, useAccountColors } from './components';
import { submitRecoveryRequest } from './recovery';

const states: Record<RecoveryCase['state'],string> = { received: '已受理',reviewing: '核验中',approved: '核验已通过',
  rejected: '未通过核验',need_evidence: '需要补充证据' };
export function RecoveryScreen({ api,session,trusted,onBack,onSignedOut }: {
  api: AccountApi; session: SessionTokens; trusted: boolean; onBack: () => void; onSignedOut: () => Promise<void>;
}) {
  const colors = useAccountColors();
  const [record,setRecord] = useState<RecoveryCase | null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const caseId = useRef<string | null>(null);
  const mounted = useRef(true);
  const generation = useRef(0);
  const commands = useRef(new Map<string,string>());
  const handleFailure = useCallback(async (failure: unknown) => {
    if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') { setRecord(null); await onSignedOut(); return; }
    setError(failure instanceof Error ? failure.message : '申请状态暂时不可用，请重试');
  },[onSignedOut]);
  const refresh = useCallback(async () => {
    if (!caseId.current) return;
    const ticket = ++generation.current;
    setBusy(true); setError(''); setRecord(null);
    try {
      const result = await api.recoveryCase(session.access_token,caseId.current);
      if (ticket === generation.current && AppState.currentState === 'active') setRecord(result);
    } catch (failure) { if (ticket === generation.current) await handleFailure(failure); }
    finally { if (ticket === generation.current) setBusy(false); }
  },[api,session.access_token,handleFailure]);
  useEffect(() => {
    mounted.current = true;
    const listener = AppState.addEventListener('change',state => {
      generation.current++; setRecord(null); setBusy(false);
      if (state === 'active') void refresh();
    });
    return () => { mounted.current = false; generation.current++; listener.remove(); };
  },[refresh]);
  async function submit(mode: 'trusted'|'manual') {
    const ticket = ++generation.current;
    setBusy(true); setError('');
    let command = commands.current.get(mode);
    if (!command) { command = randomUUID(); commands.current.set(mode,command); }
    try {
      await submitRecoveryRequest(() => api.requestRecovery(session.access_token,mode,command),{
        mounted: () => mounted.current,active: () => AppState.currentState === 'active',current: () => ticket === generation.current,
        remember: result => { caseId.current = result.id; commands.current.delete(mode); },show: setRecord,refresh,
      });
    } catch (failure) { if (ticket === generation.current) await handleFailure(failure); }
    finally { if (ticket === generation.current) setBusy(false); }
  }
  return <ScrollView contentContainerStyle={styles.container}>
    <Text accessibilityRole="header" style={[styles.title,{ color: colors.fg }]}>账号恢复申请</Text>
    <Text style={[styles.body,{ color: colors.secondary }]}>无法使用原手机号时，可申请核验账号归属。申请受理不代表恢复成功，资料不足可能无法找回账号。</Text>
    {record && <>
      <Text accessibilityLiveRegion="polite" style={[styles.state,{ color: colors.fg }]}>{states[record.state]}</Text>
      <Text selectable style={[styles.body,{ color: colors.secondary }]}>申请编号：{record.id}</Text>
      <Text style={[styles.body,{ color: colors.secondary }]}>更新于 {new Date(record.updated_at).toLocaleString()}</Text>
      {record.state === 'need_evidence' && <Text style={[styles.body,{ color: colors.fg }]}>请按受控核验流程补充证据，勿公开验证码或登录凭据。</Text>}
      {record.state === 'approved' && <Text style={[styles.body,{ color: colors.fg }]}>请继续按核验流程确认恢复结果，账号与手机号状态以实际执行结果为准。</Text>}
    </>}
    {busy && <ActivityIndicator accessibilityLabel="读取恢复申请状态" />}
    {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.body,{ color: colors.error }]}>{error}</Text>}
    {caseId.current && <Action title="刷新申请状态" disabled={busy} onPress={() => void refresh()} />}
    {!record && !caseId.current && <Action title="申请人工核验" disabled={busy} onPress={() => void submit('manual')} />}
    {!record && !caseId.current && trusted && <Action title="使用可信会话申请" disabled={busy} onPress={() => void submit('trusted')} />}
    <Action title="返回账号安全" onPress={onBack} disabled={busy} />
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: 24,gap: 16,paddingBottom: 48 },title: { fontSize: 22,fontWeight: '700' },
  state: { fontSize: 20,fontWeight: '600' },body: { fontSize: 16,lineHeight: 26 } });
