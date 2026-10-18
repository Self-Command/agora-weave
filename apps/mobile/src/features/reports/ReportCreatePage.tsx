import { useCallback,useRef,useState } from 'react';
import { ScrollView,Text,TextInput,View,useColorScheme } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { countVisibleCharacters } from '../../../../../packages/contracts/src/graphemes';
import { AppButton,AppFrame,PageStatus } from '../../components/AppChrome';
import { AccountIcon } from '../account/AccountLayout';
import { accountApi } from '../account/api';
import { currentProfileSession } from '../profile/session';
import { reportApi,ReportError,validReport } from './api';
import { readReportDraft,saveReportDraft,type ReportDraft } from './store';

const release=Constants.expoConfig?.version || '0.0.0';
const reports=reportApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
type TargetKind='post'|'account'|'comment';
const targetLabel=(kind:string)=>kind==='account'?'账号':kind==='comment'?'评论':'帖子';
export function ReportCreatePage({targetKind,targetId}:{targetKind?:string;targetId?:string}){
  const router=useRouter(),colors=themeFor(useColorScheme());
  const [status,setStatus]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [draft,setDraft]=useState<ReportDraft|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setStatus('loading');setError('');
    if((targetKind!=='post' && targetKind!=='account' && targetKind!=='comment') || !targetId || !uuid.test(targetId)){
      setStatus('error');setError('举报对象地址无效');return;
    }
    try{
      const current=await currentProfileSession();
      if(ticket!==generation.current)return;
      if(!current){setStatus('guest');return;}
      const saved=await readReportDraft(current.accountId);
      if(ticket!==generation.current)return;
      const next=saved && (saved.phase==='unknown' || saved.targetKind===targetKind && saved.targetId===targetId)
        ? saved : {owner:current.accountId,targetKind:targetKind as TargetKind,targetId,reason:'',operationId:randomUUID(),phase:'editing' as const};
      setDraft(next);setStatus('ready');
    }catch(failure){if(ticket===generation.current){setStatus('error');setError(failure instanceof Error?failure.message:'登录信息暂时无法读取');}}
  },[targetKind,targetId]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  const updateReason=(reason:string)=>{
    if(!draft || draft.phase!=='editing')return;
    const next={...draft,reason};setDraft(next);
    void saveReportDraft(next).catch(()=>setError('举报说明无法保存在本机，请勿离开此页'));
  };
  const submit=async()=>{
    if(!draft || busy || draft.phase!=='editing')return;
    const count=countVisibleCharacters(draft.reason);
    if(!draft.reason.trim() || count>2000){setError('请填写 1–2000 字的举报原因');return;}
    setBusy(true);setError('');
    try{
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.owner){setError('登录账号已变化，请返回后重新进入');return;}
      const pending={...draft,reason:draft.reason.replace(/\r\n?/g,'\n'),phase:'unknown' as const};
      await saveReportDraft(pending);setDraft(pending);
      const receipt=await reports.create(current.session.access_token,{operation_id:pending.operationId,
        target_kind:pending.targetKind,target_id:pending.targetId,reason:pending.reason});
      if(!validReport(receipt))throw new ReportError('NETWORK_UNCONFIRMED','举报回执无法确认',true);
      const accepted={...pending,phase:'accepted' as const};
      await saveReportDraft(accepted);setDraft(accepted);
    }catch(failure){
      if(failure instanceof ReportError && !failure.uncertain){
        const editable={...draft,operationId:randomUUID(),phase:'editing' as const};
        try{await saveReportDraft(editable);setDraft(editable);}catch{/* Preserve original operation for lookup. */}
      }
      setError(failure instanceof Error?failure.message:'举报结果暂时无法确认');
    }finally{setBusy(false);}
  };
  const queryOriginal=async()=>{
    if(!draft || busy || draft.phase!=='unknown')return;
    setBusy(true);setError('');
    try{
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.owner){setError('请使用提交举报时的账号查询原操作');return;}
      const operation=await accounts.operation(current.session.access_token,draft.operationId);
      if(operation.operation_id!==draft.operationId || operation.action!=='report.create'){
        setError('查询结果与本次举报不匹配，操作号已保留');return;
      }
      if(operation.state==='succeeded'){
        if(!validReport(operation.result) || operation.result.target_ref!==draft.targetId){
          setError('原操作已记录，但举报回执不完整，请稍后再查');return;
        }
        const next={...draft,phase:'accepted' as const};await saveReportDraft(next);setDraft(next);
      }else if(operation.state==='failed'){
        const next={...draft,operationId:randomUUID(),phase:'editing' as const};
        await saveReportDraft(next);setDraft(next);setError('原操作确认失败，说明已保留，请检查后重新提交');
      }else setError('原操作仍待确认，请稍后再查，勿重复提交');
    }catch(failure){setError(failure instanceof Error?failure.message:'暂时无法查询原操作');}
    finally{setBusy(false);}
  };
  const otherTarget=draft && (draft.targetKind!==targetKind || draft.targetId!==targetId);
  return <AppFrame title={`举报${targetLabel(targetKind || '')}`} onBack={()=>router.back()}>
    {status==='loading'?<PageStatus kind="loading" message="正在读取举报信息…"/>:
      status==='guest'?<PageStatus kind="guest" message="登录后可以提交举报" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>:
      status==='error'?<PageStatus kind="error" message={error} actionLabel="重试" onAction={()=>void load()}/>:
      draft?<ScrollView className="flex-1" contentContainerStyle={{padding:24,gap:16}} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-start gap-3 rounded-xl border border-line bg-surface p-4">
          <AccountIcon name="file" size={20} color={colors.secondary} />
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[13px] font-semibold text-fg">举报对象 · {targetLabel(draft.targetKind)}</Text>
            <Text selectable className="text-[11px] leading-5 text-secondary">对象编号 {draft.targetId}</Text>
          </View>
        </View>
        {otherTarget?<Text className="text-[14px] leading-6 text-fg">有一条其他对象的举报结果待确认，请先查询原操作。</Text>:
          <Text className="text-[13px] leading-6 text-secondary">请说明具体情况。举报会交由审核处理，提交数量不会直接决定处置。</Text>}
        {!otherTarget && draft.phase==='editing'?<><TextInput accessibilityLabel="举报原因" multiline value={draft.reason} onChangeText={updateReason}
          placeholder="说明发生了什么" placeholderTextColor={colors.secondary} textAlignVertical="top" maxLength={8000}
          className="min-h-36 rounded-xl border border-line bg-surface p-4 text-[15px] leading-6 text-fg" />
          <Text className="text-right text-[12px] text-secondary">{countVisibleCharacters(draft.reason)}/2000</Text></>:null}
        {draft.phase==='accepted'?<Text className="text-[15px] leading-6 text-fg">举报已受理，可在“我的举报”查看处理进度。</Text>:null}
        {draft.phase==='unknown'?<Text className="text-[14px] leading-6 text-fg">举报结果尚未确认。查询原操作前请勿再次提交。</Text>:null}
        {error?<Text accessibilityRole="alert" className="text-[13px] leading-6 text-fg">{error}</Text>:null}
        {draft.phase==='editing'?<AppButton label="提交举报" tone="accent" busy={busy}
          disabled={!draft.reason.trim() || countVisibleCharacters(draft.reason)>2000} onPress={()=>void submit()}/>:null}
        {draft.phase==='unknown'?<AppButton label="查询原操作" busy={busy} onPress={()=>void queryOriginal()}/>:null}
        <AppButton label="查看我的举报" tone="text" onPress={()=>router.push('/me/reports')}/>
      </ScrollView>:null}
  </AppFrame>;
}
