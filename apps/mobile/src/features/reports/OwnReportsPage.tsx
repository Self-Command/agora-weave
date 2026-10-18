import { useCallback,useRef,useState } from 'react';
import { ScrollView,Text,View } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppButton,AppEmpty,AppFrame,PageStatus } from '../../components/AppChrome';
import { currentProfileSession } from '../profile/session';
import { reportApi,type Report } from './api';

const reports=reportApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const stateLabel:Record<Report['state'],string>={pending:'待处理',reviewing:'审核中',processed:'已处理',not_actionable:'不予处理'};
export function OwnReportsPage(){
  const router=useRouter();
  const [status,setStatus]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [items,setItems]=useState<Report[]>([]),[cursor,setCursor]=useState<string|null>(null),[hasMore,setHasMore]=useState(false);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setStatus('loading');setError('');
    try{
      const current=await currentProfileSession();
      if(ticket!==generation.current)return;
      if(!current){setStatus('guest');return;}
      const page=await reports.own(current.session.access_token);
      if(ticket!==generation.current)return;
      setItems(page.items);setCursor(page.next_cursor);setHasMore(page.has_more);setStatus('ready');
    }catch(failure){if(ticket===generation.current){setStatus('error');setError(failure instanceof Error?failure.message:'举报进度暂时无法读取');}}
  },[]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  const more=async()=>{
    if(busy || !hasMore || !cursor)return;
    const ticket=generation.current;setBusy(true);setError('');
    try{
      const current=await currentProfileSession();
      if(!current){setStatus('guest');return;}
      const page=await reports.own(current.session.access_token,cursor);
      if(ticket!==generation.current)return;
      setItems(previous=>[...previous,...page.items.filter(item=>!previous.some(old=>old.id===item.id))]);
      setCursor(page.next_cursor);setHasMore(page.has_more);
    }catch(failure){if(ticket===generation.current)setError(failure instanceof Error?failure.message:'更多进度暂时无法读取');}
    finally{if(ticket===generation.current)setBusy(false);}
  };
  return <AppFrame title="我的举报" onBack={()=>router.back()} onRefresh={()=>void load()}>
    {status==='loading'?<PageStatus kind="loading" message="正在读取举报进度…"/>:
      status==='guest'?<PageStatus kind="guest" message="登录后查看我的举报" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>:
      status==='error'?<PageStatus kind="error" message={error} actionLabel="重试" onAction={()=>void load()}/>:
      <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:32,flexGrow:1}}>
        {!items.length?<AppEmpty icon="flag" title="暂无已受理的举报" description="提交的举报会在这里显示处理进度。"/>:items.map(item=><View key={item.id} className="gap-2 border-b border-line px-6 py-5">
          <Text className="text-[15px] font-semibold text-fg">{stateLabel[item.state]}</Text>
          <Text className="text-[12px] text-secondary">{item.created_at.slice(0,10)} · 编号 {item.id.slice(0,8)}</Text>
          {item.public_feedback?<Text className="text-[13px] leading-6 text-fg">{item.public_feedback}</Text>:<Text className="text-[12px] text-secondary">暂无处理反馈</Text>}
        </View>)}
        {error?<Text accessibilityRole="alert" className="px-6 py-4 text-center text-fg">{error}</Text>:null}
        {hasMore?<View className="px-6"><AppButton label="加载更多" tone="text" busy={busy} onPress={()=>void more()}/></View>:null}
      </ScrollView>}
  </AppFrame>;
}
