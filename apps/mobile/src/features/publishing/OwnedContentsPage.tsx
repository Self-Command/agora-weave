import { useCallback,useEffect,useRef,useState } from 'react';
import { ScrollView,Text,View } from 'react-native';
import { useFocusEffect,useLocalSearchParams,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppButton,AppEmpty,AppFrame,PageStatus } from '../../components/AppChrome';
import { ContentRevisionCard,type OwnedRevision } from '../../components/ContentRevisionCard';
import { currentProfileSession } from '../profile/session';
import { ownedContentsApi } from './owned-api';
import { ContentManagement,RecentlyDeleted } from './ContentManagement';
import type { Deletion } from './lifecycle-api';

const contents=ownedContentsApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
export function OwnedContentsPage() {
  const router=useRouter(),params=useLocalSearchParams<{recent?:string}>(),generation=useRef(0),account=useRef<string|null>(null);
  const [status,setStatus]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [items,setItems]=useState<OwnedRevision[]>([]),[cursor,setCursor]=useState<string|null>(null);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [selected,setSelected]=useState<string|null>(null),[recent,setRecent]=useState(params.recent==='1');
  const [lastDeletion,setLastDeletion]=useState<Deletion|null>(null);
  useEffect(()=>{if(params.recent==='1'){setSelected(null);setRecent(true);}},[params.recent]);
  const load=useCallback(async()=>{
    const ticket=++generation.current;setStatus('loading');setError('');setItems([]);setBusy(false);
    try {
      const current=await currentProfileSession();if(ticket!==generation.current)return;
      if(!current){account.current=null;setStatus('guest');return;}
      if(account.current!==current.accountId){setSelected(null);setRecent(params.recent==='1');setLastDeletion(null);}
      account.current=current.accountId;
      const page=await contents(current.session.access_token);if(ticket!==generation.current)return;
      setItems(page.items);setCursor(page.next_cursor);setStatus('ready');
    } catch(failure) {if(ticket===generation.current){setStatus('error');setError(failure instanceof Error?failure.message:'我的内容暂时无法读取');}}
  },[params.recent]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  const more=async()=>{
    if(busy || !cursor)return;
    const ticket=generation.current;setBusy(true);setError('');
    try {
      const current=await currentProfileSession();
      if(ticket!==generation.current)return;
      if(!current || current.accountId!==account.current){void load();return;}
      const page=await contents(current.session.access_token,cursor);if(ticket!==generation.current)return;
      setItems(previous=>[...previous,...page.items.filter(item=>!previous.some(old=>old.resource_id===item.resource_id))]);
      setCursor(page.next_cursor);
    } catch(failure) {if(ticket===generation.current)setError(failure instanceof Error?failure.message:'更多内容暂时无法读取');}
    finally {if(ticket===generation.current)setBusy(false);}
  };
  return <AppFrame title="我的内容" onBack={()=>router.back()} onRefresh={()=>void load()}
    footer={<View className="border-t border-line px-6 py-2"><AppButton label="写新帖子" tone="primary" onPress={()=>router.push('/compose')}/></View>}>
    {status==='loading'?<PageStatus kind="loading" message="正在读取我的内容…"/>:
      status==='guest'?<PageStatus kind="guest" message="登录后查看我的内容" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>:
      status==='error'?<PageStatus kind="error" message={error} actionLabel="重试" onAction={()=>void load()}/>:
      recent && account.current?<View className="flex-1"><View className="px-6 pt-3"><AppButton label="返回我的内容" tone="text" onPress={()=>setRecent(false)}/></View>
        <RecentlyDeleted accountId={account.current} initialDeletion={lastDeletion} onChanged={()=>{setLastDeletion(null);void load();}}/></View>:
      selected && account.current && items.some(item=>item.resource_id===selected)?
        <ContentManagement key={selected} item={items.find(item=>item.resource_id===selected)!} accountId={account.current}
          onClose={()=>setSelected(null)} onChanged={()=>void load()} onDeleted={deletion=>{setLastDeletion(deletion);setRecent(true);setSelected(null);}}/>:
      <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:24,flexGrow:1}}>
        <Text className="px-6 py-4 text-[12px] leading-5 text-secondary">仅自己可见 · 包含待审核、已发布和未通过的帖子</Text>
        <View className="px-6 pb-2"><AppButton label="最近删除" tone="outline" onPress={()=>setRecent(true)}/></View>
        {!items.length?<AppEmpty icon="file" title="暂无已提交内容" description="已受理的帖子会在这里显示审核与发布状态。"/>:
          items.map(item=><ContentRevisionCard key={item.id} item={item} onOpen={()=>router.push(`/posts/${item.resource_id}`)}
            onManage={()=>setSelected(item.resource_id)}/>)}
        {error?<Text accessibilityRole="alert" className="px-6 py-3 text-[13px] text-fg">{error}</Text>:null}
        {cursor?<View className="px-6"><AppButton label="加载更多" tone="text" busy={busy} onPress={()=>void more()}/></View>:null}
      </ScrollView>}
  </AppFrame>;
}
