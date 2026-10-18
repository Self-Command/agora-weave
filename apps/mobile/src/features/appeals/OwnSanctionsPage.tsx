import { useCallback,useRef,useState } from 'react';
import { ScrollView,Text,View } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppButton,AppEmpty,AppFrame,PageStatus } from '../../components/AppChrome';
import { currentProfileSession } from '../profile/session';
import { appealApi,type Appeal,type Sanction } from './api';

const api=appealApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const sanctionLabel:Record<Sanction['type'],string>={function:'功能限制',temporary:'临时封禁',permanent:'永久封禁'};
const sanctionState:Record<Sanction['state'],string>={active:'生效中',revoked:'已撤销',expired:'已到期'};
const appealState:Record<Appeal['state'],string>={awaiting_independent_review:'等待独立复核',reviewing:'复核中',decided:'已决定'};
export function OwnSanctionsPage(){
  const router=useRouter();
  const [status,setStatus]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [sanctions,setSanctions]=useState<Sanction[]>([]),[appeals,setAppeals]=useState<Appeal[]>([]);
  const [sanctionCursor,setSanctionCursor]=useState<string|null>(null),[appealCursor,setAppealCursor]=useState<string|null>(null);
  const [sanctionsMore,setSanctionsMore]=useState(false),[appealsMore,setAppealsMore]=useState(false);
  const [busy,setBusy]=useState<'sanctions'|'appeals'|null>(null),[error,setError]=useState('');
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setStatus('loading');setError('');
    try{
      const current=await currentProfileSession();
      if(ticket!==generation.current)return;
      if(!current){setStatus('guest');return;}
      const [sanctionPage,appealPage]=await Promise.all([
        api.sanctions(current.session.access_token),api.appeals(current.session.access_token)]);
      if(ticket!==generation.current)return;
      setSanctions(sanctionPage.items);setSanctionCursor(sanctionPage.next_cursor);setSanctionsMore(sanctionPage.has_more);
      setAppeals(appealPage.items);setAppealCursor(appealPage.next_cursor);setAppealsMore(appealPage.has_more);
      setStatus('ready');
    }catch(failure){if(ticket===generation.current){setStatus('error');setError(failure instanceof Error?failure.message:'处罚与申诉暂时无法读取');}}
  },[]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  const loadMore=async(kind:'sanctions'|'appeals')=>{
    const cursor=kind==='sanctions'?sanctionCursor:appealCursor;
    if(!cursor || busy)return;
    const ticket=generation.current;setBusy(kind);setError('');
    try{
      const current=await currentProfileSession();
      if(!current){setStatus('guest');return;}
      if(kind==='sanctions'){
        const page=await api.sanctions(current.session.access_token,cursor);
        if(ticket!==generation.current)return;
        setSanctions(previous=>[...previous,...page.items.filter(item=>!previous.some(old=>old.id===item.id))]);
        setSanctionCursor(page.next_cursor);setSanctionsMore(page.has_more);
      }else{
        const page=await api.appeals(current.session.access_token,cursor);
        if(ticket!==generation.current)return;
        setAppeals(previous=>[...previous,...page.items.filter(item=>!previous.some(old=>old.id===item.id))]);
        setAppealCursor(page.next_cursor);setAppealsMore(page.has_more);
      }
    }catch(failure){if(ticket===generation.current)setError(failure instanceof Error?failure.message:'更多记录暂时无法读取');}
    finally{if(ticket===generation.current)setBusy(null);}
  };
  return <AppFrame title="处罚与申诉" onBack={()=>router.back()} onRefresh={()=>void load()}>
    {status==='loading'?<PageStatus kind="loading" message="正在读取记录…"/>:
      status==='guest'?<PageStatus kind="guest" message="登录后查看处罚与申诉" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>:
      status==='error'?<PageStatus kind="error" message={error} actionLabel="重试" onAction={()=>void load()}/>:
      <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:40}}>
        <Text className="px-6 pt-7 text-[17px] font-semibold text-fg">我的处罚</Text>
        {!sanctions.length?<AppEmpty icon="shield" title="当前没有处罚记录" description="如有需要你处理的处罚，会显示在这里。"/>:sanctions.map(item=><View key={item.id} className="gap-2 border-b border-line px-6 py-5">
          <Text className="text-[15px] font-semibold text-fg">{sanctionLabel[item.type]} · {sanctionState[item.state]}</Text>
          <Text className="text-[12px] text-secondary">开始 {item.starts_at.slice(0,16).replace('T',' ')}{item.ends_at?` · 截止 ${item.ends_at.slice(0,16).replace('T',' ')}`:''}</Text>
          {item.functions.length?<Text className="text-[12px] text-secondary">受限功能：{item.functions.join('、')}</Text>:null}
          <Text className="text-[13px] leading-6 text-fg">{item.reason}</Text>
          {item.allowed_actions.includes('appeal')?<View className="mt-1 self-start"><AppButton label="提交申诉" compact
            onPress={()=>router.push({pathname:'/appeal',params:{sanctionId:item.id}})}/></View>:null}
        </View>)}
        {sanctionsMore?<View className="px-6"><AppButton label="加载更多处罚" tone="text" busy={busy==='sanctions'}
          disabled={busy!==null} onPress={()=>void loadMore('sanctions')}/></View>:null}
        <Text className="px-6 pt-9 text-[17px] font-semibold text-fg">我的申诉</Text>
        {!appeals.length?<AppEmpty icon="file" title="暂无申诉记录" description="已提交的申诉会在这里显示复核进度。"/>:appeals.map(item=><View key={item.id} className="gap-2 border-b border-line px-6 py-5">
          <Text className="text-[15px] font-semibold text-fg">{appealState[item.state]}</Text>
          <Text className="text-[12px] text-secondary">{item.created_at.slice(0,16).replace('T',' ')} · 处罚编号 {item.sanction_id.slice(0,8)}</Text>
          <Text className="text-[13px] leading-6 text-fg" numberOfLines={4}>{item.statement}</Text>
          {item.state==='decided'?<Text className="text-[13px] text-fg">{item.decision==='overturn'?'复核撤销处罚':'复核维持处罚'} · {item.execution_state==='succeeded'?'已执行':item.execution_state==='failed'?'执行失败待处理':'执行中'}</Text>:null}
        </View>)}
        {appealsMore?<View className="px-6"><AppButton label="加载更多申诉" tone="text" busy={busy==='appeals'}
          disabled={busy!==null} onPress={()=>void loadMore('appeals')}/></View>:null}
        {error?<Text accessibilityRole="alert" className="px-6 py-5 text-center text-fg">{error}</Text>:null}
      </ScrollView>}
  </AppFrame>;
}
