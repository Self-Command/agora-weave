import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { AccountError, normalizePhone, type AccountApi, type Challenge, type RegistrationDocuments, type SessionTokens } from './api';
import { Action, useAccountColors } from './components';
import { recoverChangedTerms } from './recovery';

export function AuthScreen({ api,onAuthenticated }: { api: AccountApi; onAuthenticated: (session: SessionTokens) => Promise<void> }) {
  const colors = useAccountColors();
  const [mode,setMode] = useState<'login'|'register'>('login');
  const [phone,setPhone] = useState('');
  const [invitation,setInvitation] = useState('');
  const [otp,setOtp] = useState('');
  const [adult,setAdult] = useState(false);
  const [consent,setConsent] = useState(false);
  const [documents,setDocuments] = useState<RegistrationDocuments | null>(null);
  const [challenge,setChallenge] = useState<Challenge | null>(null);
  const [retryAt,setRetryAt] = useState(0);
  const [now,setNow] = useState(Date.now());
  const [busy,setBusy] = useState(false);
  const [loadingDocuments,setLoadingDocuments] = useState(false);
  const [error,setError] = useState('');
  const verifyCommand = useRef<string | null>(null);
  const challengeCommand = useRef<string | null>(null);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()),1000); return () => clearInterval(timer); },[]);
  async function loadDocuments() {
    setLoadingDocuments(true); setConsent(false); setDocuments(null); setError('');
    try { setDocuments(await api.documents()); }
    catch (failure) { setError(failure instanceof Error ? failure.message : '条款暂时不可用，请重试'); }
    finally { setLoadingDocuments(false); }
  }
  function changeMode() {
    setMode(mode === 'login' ? 'register' : 'login'); setError(''); setOtp(''); setChallenge(null);
    setAdult(false); setConsent(false); verifyCommand.current = null; challengeCommand.current = null;
    if (mode === 'login') void loadDocuments();
  }
  async function sendCode() {
    const normalized = normalizePhone(phone);
    if (!normalized) { setError('请输入有效手机号，境外号码请加国家区号'); return; }
    if (mode === 'register' && (!invitation.trim() || !adult || !documents)) {
      setError('请填写邀请码，主动声明已满 18 岁，并加载当前条款'); return;
    }
    setBusy(true); setError(''); challengeCommand.current ??= randomUUID();
    try {
      const value = await api.challenge({ phone: normalized,purpose: mode,operation_id: challengeCommand.current,
        ...(mode === 'register' ? { invitation_ref: invitation.trim(),age_declaration: { version: documents!.age_declaration_version,declared: adult },
          document_set_digest: documents!.document_set_digest } : {}) });
      setChallenge(value); setRetryAt(Date.now() + value.retry_after * 1000); setOtp('');
      verifyCommand.current = null; challengeCommand.current = null;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '验证码发送失败，请重试');
      if (failure instanceof AccountError && failure.retryAfter > 0) setRetryAt(Date.now() + failure.retryAfter * 1000);
      if (await recoverChangedTerms(failure,() => { setConsent(false); challengeCommand.current = null; },loadDocuments)) {
        setError('条款已更新，请查看当前版本并重新确认');
      }
    } finally { setBusy(false); }
  }
  async function verify() {
    if (!challenge || !/^\d{6}$/.test(otp)) { setError('请输入短信中的 6 位验证码'); return; }
    if (Date.parse(challenge.expires_at) <= Date.now()) { setError('验证码已过期，请重新获取'); return; }
    if (mode === 'register' && (!adult || !consent || !documents)) { setError('请主动声明年龄资格并明确同意当前条款'); return; }
    setBusy(true); setError(''); verifyCommand.current ??= randomUUID();
    try {
      const result = await api.verify({ challenge_id: challenge.challenge_id,otp,operation_id: verifyCommand.current,
        ...(mode === 'register' ? { age_declaration: { version: documents!.age_declaration_version,declared: adult },
          document_set_digest: documents!.document_set_digest,consents: documents!.documents.map(doc => ({ release_id: doc.release_id,digest: doc.digest,decision: 'consented' })) } : {}) });
      if (!result.account?.admitted) throw new Error('账号尚未完成加入，请重试');
      await onAuthenticated(result.session);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '验证失败，请重试');
      if (await recoverChangedTerms(failure,() => {
        setConsent(false); setChallenge(null); setOtp(''); verifyCommand.current = null; challengeCommand.current = null;
      },loadDocuments)) setError('条款已更新，请查看当前版本并重新获取验证码');
    } finally { setBusy(false); }
  }
  const remaining = Math.max(0,Math.ceil((retryAt-now)/1000));
  const input = [styles.input,{ color: colors.fg,borderColor: colors.line,backgroundColor: colors.surface }];
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
    <Text accessibilityRole="header" style={[styles.brand,{ color: colors.fg }]}>AgoraWeave</Text>
    <Text accessibilityRole="header" style={[styles.title,{ color: colors.fg }]}>{mode === 'login' ? '手机号登录' : '邀请加入'}</Text>
    <Text style={[styles.body,{ color: colors.secondary }]}>{mode === 'login' ? '已有账号通过短信验证码登录。' : '使用邀请码加入，并完成手机号验证与年龄资格声明。'}</Text>
    <Text style={{ color: colors.fg }}>手机号</Text>
    <TextInput accessibilityLabel="手机号" editable={!busy && !challenge} value={phone} onChangeText={value => { setPhone(value); challengeCommand.current = null; }}
      keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" style={input} placeholder="手机号或 +国家区号" placeholderTextColor={colors.secondary} />
    {mode === 'register' && <>
      <Text style={{ color: colors.fg }}>邀请码</Text>
      <TextInput accessibilityLabel="邀请码" editable={!busy && !challenge} value={invitation} onChangeText={value => { setInvitation(value); challengeCommand.current = null; }} autoCapitalize="none" autoCorrect={false} style={input} />
      <View style={styles.choice}><Switch accessibilityLabel="我主动声明已满 18 岁" value={adult} disabled={busy || !!challenge} onValueChange={value => { setAdult(value); challengeCommand.current = null; }} />
        <Text style={[styles.choiceText,{ color: colors.fg }]}>我主动声明已满 18 岁</Text></View>
      <Text style={[styles.body,{ color: colors.secondary }]}>此声明不代表平台已核验实际年龄。</Text>
      {loadingDocuments && <ActivityIndicator accessibilityLabel="加载当前条款" />}
      {documents?.documents.map(doc => <View key={doc.release_id} style={[styles.document,{ borderColor: colors.line }]}>
        <Text accessibilityRole="header" style={[styles.documentTitle,{ color: colors.fg }]}>{doc.title}</Text>
        <Text selectable style={[styles.body,{ color: colors.fg }]}>{doc.body}</Text>
      </View>)}
      {!documents && !loadingDocuments && <Action title="重试加载条款" onPress={() => void loadDocuments()} disabled={busy} />}
      <View style={styles.choice}><Switch accessibilityLabel="我明确同意以上当前条款" value={consent} disabled={busy || !documents} onValueChange={setConsent} />
        <Text style={[styles.choiceText,{ color: colors.fg }]}>我明确同意以上当前条款</Text></View>
    </>}
    {challenge && <>
      <Text style={{ color: colors.fg }}>短信验证码</Text>
      <TextInput accessibilityLabel="短信验证码" value={otp} editable={!busy} onChangeText={value => { setOtp(value.replace(/\D/g,'').slice(0,6)); verifyCommand.current = null; }}
        keyboardType="number-pad" autoComplete="sms-otp" textContentType="oneTimeCode" maxLength={6} style={input} />
      <Text accessibilityLiveRegion="polite" style={{ color: colors.secondary }}>{Date.parse(challenge.expires_at) <= now ? '验证码已过期，请重新获取' : '验证码已发送，请在有效期内填写'}</Text>
      <Action title={busy ? '验证中…' : mode === 'login' ? '登录' : '同意并加入'} onPress={() => void verify()} disabled={busy} />
    </>}
    {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.body,{ color: colors.error }]}>{error}</Text>}
    <Action title={remaining ? `${remaining} 秒后可重发` : busy ? '处理中…' : challenge ? '重新获取验证码' : '获取验证码'} onPress={() => void sendCode()} disabled={busy || remaining > 0 || loadingDocuments} />
    {challenge && <Action title="更换手机号或邀请码" disabled={busy} onPress={() => { setChallenge(null); setOtp(''); verifyCommand.current = null; challengeCommand.current = null; }} />}
    <Action title={mode === 'login' ? '有邀请码，去加入' : '已有账号，去登录'} disabled={busy} onPress={changeMode} />
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: 24,gap: 12,paddingBottom: 48 },brand: { fontSize: 24,fontWeight: '600',marginBottom: 20 },
  title: { fontSize: 22,fontWeight: '700' },body: { fontSize: 16,lineHeight: 26 },input: { minHeight: 52,padding: 14,borderWidth: 1,borderRadius: 12,fontSize: 17 },
  choice: { flexDirection: 'row',alignItems: 'center',gap: 12 },choiceText: { flex: 1,fontSize: 16,lineHeight: 24 },document: { borderWidth: 1,borderRadius: 12,padding: 16,gap: 8 },documentTitle: { fontSize: 17,fontWeight: '600' } });
