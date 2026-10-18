import { useCallback,useEffect,useRef,useState,useSyncExternalStore } from 'react';
import { Alert,AppState,BackHandler,Platform,Text,View } from 'react-native';
import { useRouter } from 'expo-router';
import { createNativeAccountControllers } from './native-controllers';
import type { SessionTokens } from './api';
import { AuthPages } from './AuthPages';
import { RecoveryPage,SecurityPage } from './SecurityRecoveryPages';
import { AccountButton,AccountField,AccountFrame,AccountIntro,AccountNotice } from './AccountLayout';
import { AccountError } from './api';

type NativeControllers=ReturnType<typeof createNativeAccountControllers>;
type AuthController=ReturnType<NativeControllers['auth']>;
type SecurityController=ReturnType<NativeControllers['security']>;
type RecoveryController=ReturnType<NativeControllers['recovery']>;

function GuestAccount({ bundle,onClose,error,onRestore }: {bundle:NativeControllers;onClose:()=>void;error:string;onRestore:()=>void}) {
  const [controller,setController]=useState<AuthController|null>(null);
  const [devLogin,setDevLogin]=useState(false);
  useEffect(()=>{
    const next=bundle.auth();setController(next);next.start();
    return ()=>next.dispose();
  },[bundle]);
  return devLogin && __DEV__ ? <DevTestLogin bundle={bundle} onBack={()=>setDevLogin(false)} onClose={onClose} /> :
    controller ? <AuthPages controller={controller} onClose={onClose} sessionError={error} onRestore={onRestore}
      onDevLogin={__DEV__?()=>setDevLogin(true):undefined} /> : null;
}
function DevTestLogin({ bundle,onBack,onClose }: {bundle:NativeControllers;onBack:()=>void;onClose:()=>void}) {
  const [username,setUsername]=useState(''),[password,setPassword]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const submit=async()=>{
    const name=username.trim();
    if(busy)return;
    if(!name || !password){setError('请输入测试账号用户名和密码');return;}
    setBusy(true);setError('');
    try {
      const result=await bundle.devTestLogin(name,password);
      await bundle.session.authenticated(result.session);
      setPassword('');
    } catch(failure) {
      setError(failure instanceof AccountError ? failure.message : '测试登录暂时不可用，请稍后重试');
    } finally {setBusy(false);}
  };
  return <AccountFrame title="测试账号登录" onBack={onBack} onClose={onClose}>
    <AccountIntro title="开发测试登录" copy="仅开发构建可用。请使用项目负责人提供的私密测试账号；登录会向真实开发后端验证。" />
    <View className="gap-4">
      <AccountField label="测试用户名" value={username} onChangeText={setUsername} editable={!busy} autoCapitalize="none" autoCorrect={false}
        textContentType="username" autoComplete="username" />
      <AccountField label="测试密码" value={password} onChangeText={setPassword} editable={!busy} secureTextEntry
        textContentType="password" autoComplete="off" autoCapitalize="none" autoCorrect={false} />
      {error ? <AccountNotice text={error} error /> : null}
      <AccountButton title="登录测试账号" onPress={()=>void submit()} busy={busy} disabled={!username.trim() || !password} />
      <Text className="text-center text-[12px] leading-5 text-secondary">测试登录不发送短信，不能用于正式环境。</Text>
    </View>
  </AccountFrame>;
}
function SignedInAccount({ bundle,tokens,onClose,recovery,enabled }: {
  bundle:NativeControllers;tokens:SessionTokens;onClose:()=>void;recovery:{trusted:boolean}|null;enabled:boolean;
}) {
  const initialTokens=useRef(tokens),appliedTokens=useRef(tokens);
  const [controllers,setControllers]=useState<{security:SecurityController;recovery:RecoveryController}|null>(null);
  useEffect(()=>{
    const next={security:bundle.security(initialTokens.current),recovery:bundle.recovery(initialTokens.current)};
    setControllers(next);void next.security.start();next.recovery.start();
    return ()=>{next.security.dispose();next.recovery.dispose();};
  },[bundle]);
  useEffect(()=>{
    if(!controllers||!enabled)return;
    if(appliedTokens.current!==tokens){
      appliedTokens.current=tokens;
      controllers.security.updateSession(tokens);controllers.recovery.updateSession(tokens);
      void controllers.security.load();void controllers.recovery.refresh();
    }
  },[controllers,tokens,enabled]);
  const closeRecovery=useCallback(()=>{
    void controllers?.security.load();bundle.session.closeRecovery();
  },[bundle,controllers]);
  useEffect(()=>{
    if(!enabled||!recovery)return;
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{closeRecovery();return true;});
    return ()=>back.remove();
  },[enabled,recovery,closeRecovery]);
  if(!controllers)return null;
  // Closing a page and rotating access tokens preserve the pending logical
  // operation. Only a real identity change or owner unmount disposes its state.
  return <>
    <View style={{flex:1,display:enabled&&!recovery?'flex':'none'}}>
      <SecurityPage controller={controllers.security} visible={enabled&&!recovery} onBack={onClose} onRecovery={trusted=>{
        void controllers.recovery.refresh();bundle.session.openRecovery(trusted);
      }} />
    </View>
    <View style={{flex:1,display:enabled&&recovery?'flex':'none'}}>
      <RecoveryPage controller={controllers.recovery} trusted={recovery?.trusted??controllers.security.canRequestTrustedRecovery()} onBack={closeRecovery} onClose={closeRecovery} />
    </View>
  </>;
}
function ConnectedAccount({ bundle }: {bundle:NativeControllers}) {
  const state=useSyncExternalStore(bundle.session.subscribe,bundle.session.getSnapshot);
  const router=useRouter();
  const [restoreError,setRestoreError]=useState('');
  const restore=useCallback(()=>{
    setRestoreError('');void bundle.session.restore().catch(()=>setRestoreError('暂时无法读取安全登录信息，请重试。'));
  },[bundle]);
  const close=()=>{
    if (router.canGoBack()) router.back();
    else if (Platform.OS==='android') BackHandler.exitApp();
    else Alert.alert('暂时无法返回','请稍后再试。');
  };
  const enabled=state.ready&&!!state.session&&state.session.expires_at*1000>Date.now();
  return <>
    {state.session ? <SignedInAccount key={state.accountGeneration} bundle={bundle} tokens={state.session} onClose={close} recovery={state.recovery} enabled={enabled} /> : null}
    {state.ready&&!enabled ? <GuestAccount bundle={bundle} onClose={close} error={restoreError||state.error} onRestore={restore} /> : null}
  </>;
}

export function AccountEntry() {
  const [bundle,setBundle]=useState<NativeControllers|null>(null);
  useEffect(()=>{
    const next=createNativeAccountControllers();setBundle(next);void next.session.start();
    const lifecycle=AppState.addEventListener('change',state=>{
      const current=next.session.getSnapshot().session;
      if(state==='active'&&current&&current.expires_at*1000<=Date.now())void next.session.restore();
    });
    return ()=>{lifecycle.remove();next.session.dispose();};
  },[]);
  return bundle ? <ConnectedAccount bundle={bundle} /> : null;
}
