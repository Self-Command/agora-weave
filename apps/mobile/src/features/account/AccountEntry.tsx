import { useCallback,useEffect,useRef,useState,useSyncExternalStore } from 'react';
import { Alert,AppState,BackHandler,Platform,View } from 'react-native';
import { useRouter } from 'expo-router';
import { createNativeAccountControllers } from './native-controllers';
import type { SessionTokens } from './api';
import { AuthPages } from './AuthPages';
import { RecoveryPage,SecurityPage } from './SecurityRecoveryPages';

type NativeControllers=ReturnType<typeof createNativeAccountControllers>;
type AuthController=ReturnType<NativeControllers['auth']>;
type SecurityController=ReturnType<NativeControllers['security']>;
type RecoveryController=ReturnType<NativeControllers['recovery']>;

function GuestAccount({ bundle,onClose,error,onRestore }: {bundle:NativeControllers;onClose:()=>void;error:string;onRestore:()=>void}) {
  const [controller,setController]=useState<AuthController|null>(null);
  useEffect(()=>{
    const next=bundle.auth();setController(next);next.start();
    return ()=>next.dispose();
  },[bundle]);
  return controller ? <AuthPages controller={controller} onClose={onClose} sessionError={error} onRestore={onRestore} /> : null;
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
