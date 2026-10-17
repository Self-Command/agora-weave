import { useEffect,useState,useSyncExternalStore } from 'react';
import { ActivityIndicator,BackHandler,Platform,Pressable,Text,View,useColorScheme } from 'react-native';
import { normalizePhone } from './api';
import type { createAuthController } from './auth-controller';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { AccountButton,AccountCheck,AccountField,AccountFootnote,AccountFrame,AccountIntro,AccountNotice,AccountSheet,AccountTextAction } from './AccountLayout';

type Props = {
  controller: ReturnType<typeof createAuthController>;
  onClose: () => void;
  sessionError?: string;
  onRestore?: () => void;
};

function maskedPhone(value: string) {
  const normalized = normalizePhone(value);
  if (!normalized) return '';
  if (normalized.startsWith('+86') && normalized.length === 14) return `+86 ${normalized.slice(3,6)} **** ${normalized.slice(-4)}`;
  return `${normalized.slice(0,3)} **** ${normalized.slice(-4)}`;
}

export function AuthPages({ controller,onClose,sessionError='',onRestore }: Props) {
  const state = useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
  const colors = themeFor(useColorScheme());
  const [termsOpen,setTermsOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress',() => {
      if (termsOpen) return false;
      if (state.step === 'otp') { controller.changeDetails(); return true; }
      if (state.mode === 'register') { controller.changeMode(); return true; }
      return false;
    });
    return () => listener.remove();
  },[controller,state.step,state.mode,termsOpen]);
  const registering = state.mode === 'register',otp = state.step === 'otp';
  const remaining = controller.remaining();
  const termsChanged = state.errorCode === 'TERMS_CHANGED';
  const rateLimited = state.errorCode === 'RATE_LIMITED' && remaining > 0;
  const expiresAt = state.challenge ? Date.parse(state.challenge.expires_at) : NaN;
  const expired = !!state.challenge && (!Number.isFinite(expiresAt) || expiresAt <= state.now) || state.errorCode === 'OTP_EXPIRED';
  const locked = state.errorCode === 'OTP_LOCKED';
  const documents = state.documents?.documents || [];
  const mainDocument = documents.find(document => document.kind === 'terms') || documents[0];
  const documentUnavailable = registering && !state.documents && !state.loadingDocuments;
  const inputDisabled = state.busy;
  const consentDisabled = state.busy || !state.documents || state.loadingDocuments;
  const sendDisabled = state.busy || remaining > 0 || registering && (!state.adult || !state.consent || !state.documents || state.loadingDocuments);
  const otpError = termsChanged ? '' : rateLimited ? `请求过于频繁，请在 ${remaining} 秒后重试。` :
    state.error || (expired ? '验证码已过期，请重新获取。' : '');
  const otpInvalid = state.errorCode === 'OTP_INVALID' && !!state.fieldErrors.otp;
  const title = otp ? '验证码' : registering ? '邀请加入' : '登录';
  const onBack = () => {
    if (termsOpen) setTermsOpen(false);
    else if (otp) controller.changeDetails();
    else if (registering) controller.changeMode();
    else onClose();
  };
  const phone = maskedPhone(state.phone);
  const sessionNotice = sessionError ? <View className="gap-2">
    <AccountNotice text={sessionError} error />
    {onRestore ? <AccountTextAction title="重新连接账号服务" onPress={onRestore} disabled={state.busy} /> : null}
  </View> : null;

  return <>
    <AccountFrame title={title} onBack={onBack} onClose={onClose} bodyClassName={!otp && registering ? 'pt-6 gap-[22px]' : ''}>
      <AccountIntro compact={!otp && registering} title={otp ? '输入验证码' : registering ? '加入社区' : '欢迎回来'}
        copy={otp ? phone ? `请输入发送至 ${phone} 的验证码。` : '请输入已发送短信中的验证码。' :
          registering ? '用一个有效邀请码，开启新的交流。' : '使用手机号和短信验证码登录。'} />
      {sessionNotice}
      {otp ? <>
        <View className="gap-[21px]">
          <View>
            <AccountField testID="account-otp" label="6 位短信验证码" code value={state.otp} placeholder="······"
              onChangeText={controller.setOtp} editable={!state.busy && !expired && !locked && !termsChanged}
              error={otpInvalid ? otpError : undefined} keyboardType="number-pad" textContentType="oneTimeCode"
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'} autoCorrect={false} maxLength={6}
              returnKeyType="done" onSubmitEditing={() => { if (!state.busy && !expired && !locked && !termsChanged && !rateLimited) void controller.verify(); }} />
            {!otpInvalid && otpError ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" className="mt-2 text-[12px] leading-5 text-error">{otpError}</Text> : null}
            <View className="mt-[10px] min-h-12 flex-row flex-wrap items-center justify-between gap-x-[10px]">
              <Text className="text-[12px] leading-[22px] text-secondary">{termsChanged ? '验证码已失效' : expired ? '验证码已过期' : locked || !state.challenge ? '请重新获取验证码' :
                `验证码 ${Math.max(1,Math.ceil((expiresAt-state.now)/60000))} 分钟内有效`}</Text>
              <AccountTextAction title={state.pending === 'send' ? '正在获取验证码' : remaining ? `${remaining} 秒后重发` : '重新获取'}
                onPress={() => void controller.sendCode()} disabled={state.busy || remaining > 0 || termsChanged} />
            </View>
          </View>
          {termsChanged ? <>
            <AccountNotice text="社区条款已更新，本次注册尚未完成。请返回阅读并重新同意。" />
            <AccountButton title="阅读当前条款" onPress={controller.changeDetails} />
          </> : <AccountButton testID="account-verify" title={state.pending === 'verify' ? '正在验证' : registering ? '验证并加入' : '登录'}
            busy={state.pending === 'verify'} disabled={state.busy || expired || locked || rateLimited || !/^\d{6}$/.test(state.otp)}
            onPress={() => void controller.verify()} />}
          <AccountTextAction title="更换手机号" onPress={controller.changeDetails} disabled={state.busy} />
        </View>
        <AccountFootnote>请勿向他人透露短信验证码。</AccountFootnote>
      </> : <>
        <View className={registering ? 'gap-[17px]' : 'gap-[21px]'}>
          <AccountField testID="account-phone" label="手机号" value={state.phone} prefix={state.phone.trimStart().startsWith('+') ? undefined : '+86'}
            placeholder="请输入手机号" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" autoCorrect={false}
            maxLength={20} onChangeText={controller.setPhone} editable={!inputDisabled} error={state.fieldErrors.phone}
            returnKeyType="done" onSubmitEditing={() => { if (!sendDisabled) void controller.sendCode(); }} />
          {registering ? <>
            <AccountField testID="account-invitation" label="邀请码" value={state.invitation} placeholder="输入你的邀请码"
              autoCapitalize="none" autoCorrect={false} onChangeText={controller.setInvitation} editable={!inputDisabled}
              error={state.fieldErrors.invitation} returnKeyType="done" onSubmitEditing={() => { if (!sendDisabled) void controller.sendCode(); }} />
            <View>
              <View className="flex-row items-start gap-[10px]">
                <View className="w-[18px]"><AccountCheck label="我主动声明已满 18 岁" checked={state.adult} disabled={state.busy} onChange={controller.setAdult} /></View>
                <Pressable accessible={false}
                  onPress={() => controller.setAdult(!state.adult)} disabled={state.busy} className="min-h-12 flex-1 py-[9px]">
                  <Text className="text-[12px] leading-[22px] text-fg">我主动声明已满 18 岁</Text>
                  <Text className="mt-[2px] text-[11px] leading-5 text-secondary">此声明不代表平台已核验实际年龄。</Text>
                </Pressable>
              </View>
              <View className="flex-row items-start gap-[10px]">
                <Pressable accessibilityRole="checkbox" accessibilityLabel="我已阅读并同意当前版本的条款"
                  accessibilityState={{ checked:state.consent,disabled:consentDisabled }} disabled={consentDisabled}
                  onPress={() => controller.setConsent(!state.consent)} className="mr-[-30px] min-h-12 w-12">
                  <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <AccountCheck label="我已阅读并同意当前版本的条款" checked={state.consent} disabled={consentDisabled} onChange={controller.setConsent} />
                  </View>
                </Pressable>
                <View className="min-w-0 flex-1 pb-[9px]">
                  <View className="flex-row flex-wrap items-start">
                    <Pressable accessibilityRole="checkbox" accessibilityLabel="我已阅读并同意当前版本的条款"
                      accessibilityState={{ checked:state.consent,disabled:consentDisabled }} disabled={consentDisabled}
                      onPress={() => controller.setConsent(!state.consent)} className="min-h-12 justify-start pt-[9px]">
                      <Text className="text-[12px] leading-[22px] text-fg">我已阅读并同意当前版本的</Text>
                    </Pressable>
                    <Pressable accessibilityRole="link" onPress={() => setTermsOpen(true)} className="min-h-12 max-w-full justify-start pt-[9px]">
                      <Text className="text-[12px] leading-[22px] text-fg underline">{documents.length ? documents.map(document => `《${document.title}》`).join('、') : '《社区条款》'}</Text>
                    </Pressable>
                  </View>
                  <Text className="mt-[-15px] text-[11px] leading-5 text-secondary">{mainDocument ? `条款版本 · ${mainDocument.release_id.slice(0,8)}` :
                    state.loadingDocuments ? '正在读取当前版本' : '当前条款尚未加载'}</Text>
                </View>
              </View>
            </View>
            {state.loadingDocuments ? <View accessibilityRole="progressbar" accessibilityLabel="正在读取当前条款" className="flex-row items-center gap-[9px] py-3">
              <ActivityIndicator size="small" color={colors.secondary} /><Text className="text-[12px] text-secondary">正在读取当前条款</Text>
            </View> : documentUnavailable ? <>
              <AccountNotice text="当前条款未能加载，请重试。加载前无法完成同意。" error />
              <AccountTextAction title="重新加载条款" onPress={() => void controller.loadDocuments()} />
            </> : termsChanged ? <AccountNotice text="社区条款已更新，请阅读当前版本并重新决定是否同意。手机号与邀请码已保留。" /> : null}
          </> : null}
          {state.error && !Object.keys(state.fieldErrors).length && !termsChanged && !documentUnavailable && !state.loadingDocuments ?
            <AccountNotice error text={rateLimited ? `获取验证码过于频繁，请在 ${remaining} 秒后重试。` : state.error} /> : null}
          <View className="mt-[2px]">
            <AccountButton testID="account-send-code" title={state.pending === 'send' ? '正在获取验证码' : '获取验证码'}
              busy={state.pending === 'send'} disabled={sendDisabled} onPress={() => void controller.sendCode()} />
          </View>
        </View>
        <View className="flex-row flex-wrap items-center justify-center gap-x-1">
          <Text className="text-[12px] leading-5 text-secondary">{registering ? '已有账号？' : '还没有账号？'}</Text>
          <AccountTextAction title={registering ? '去登录' : '使用邀请码加入'} onPress={controller.changeMode} disabled={state.busy} />
        </View>
        {!registering ? <AccountFootnote>验证码登录，无需设置密码。</AccountFootnote> : null}
      </>}
    </AccountFrame>
    <AccountSheet visible={termsOpen} title={mainDocument?.title || '社区条款'} onClose={() => setTermsOpen(false)}
      copy={mainDocument ? `当前发布版本 · ${mainDocument.release_id.slice(0,8)}。阅读不会自动勾选同意，请返回后由你主动选择。` : undefined}>
      {documents.length ? <View className="mb-[22px] mt-4 border-y border-line pt-4 pb-[10px]">
        {documents.map(document => <View key={document.release_id}>
          <Text accessibilityRole="header" className="text-[14px] font-medium leading-6 text-fg">{document.title}</Text>
          <Text selectable className="mt-2 mb-[18px] text-[13px] leading-[25px] text-secondary">{document.body}</Text>
        </View>)}
      </View> : state.loadingDocuments ? <Text className="my-[18px] text-[13px] leading-6 text-secondary">正在读取当前条款</Text> : <View className="my-[18px] gap-3">
        <AccountNotice text="当前条款未能加载，请重试。加载前无法完成同意。" error />
        <AccountTextAction title="重新加载条款" onPress={() => void controller.loadDocuments()} />
      </View>}
      <AccountButton secondary title="返回注册" onPress={() => setTermsOpen(false)} />
    </AccountSheet>
  </>;
}
