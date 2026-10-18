import { useCallback,useRef,useState } from 'react';
import { ScrollView,Text,TextInput,View,useColorScheme } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { countVisibleCharacters } from '../../../../../packages/contracts/src/graphemes';
import { AppButton,AppFrame,PageStatus } from '../../components/AppChrome';
import { accountApi } from '../account/api';
import { currentProfileSession } from '../profile/session';
import { appealApi,AppealError,validAppeal } from './api';
import { readAppealDraft,saveAppealDraft,type AppealDraft } from './store';

const release=Constants.expoConfig?.version || '0.0.0';
const appeals=appealApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{12}$/i;
export function AppealCreatePage({sanctionId}:{sanctionId?:string}){
  const router=useRouter(),colors=themeFor(useColorScheme());
  const [status,setStatus]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [draft,setDraft]=useState<AppealDraft|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setStatus('loading');setError('');
    if(!sanctionId || !uuid.test(sanctionId)){setStatus('error');setError('处罚地址无效');return;}
    try{
      const current=await currentProfileSession();
      if(ticket!==generation.current)return;
      if(!current){setStatus('guest');return;}
      const saved=await readAppealDraft(current.accountId);
      if(ticket!==generation.current)return;
      const next=saved && (saved.phase==='unknown' || saved.sanctionId===sanctionId)
        ? saved : {owner:current.accountId,sanctionId,statement:'',operationId:randomUUID(),phase:'editing' as const};
      setDraft(next);setStatus('ready');
    }catch(failure){if(ticket===generation.current){setStatus('error');setError(failure instanceof Error?failure.message:'登录信息暂时无法读取');}}
  },[sanctionId]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  const updateStatement=(statement:string)=>{
    if(!draft || draft.phase!=='editing')return;
    const next={...draft,statement};setDraft(next);
    void saveAppealDraft(next).catch(()=>setError('申诉说明无法保存在本机，请勿离开此页'));
  };
  const submit=async()=>{
    if(!draft || busy || draft.phase!=='editing' || draft.sanctionId!==sanctionId)return;
    const count=countVisibleCharacters(draft.statement);
    if(!draft.statement.trim() || count>10000){setError('请填写 1–10000 字的申诉说明');return;}
    setBusy(true);setError('');
    try{
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.owner){setError('登录账号已变化，请返回后重新进入');return;}
      const pending={...draft,statement:draft.statement.replace(/\r\n?/g,'\n'),phase:'unknown' as const};
      await saveAppealDraft(pending);setDraft(pending);
      const receipt=await appeals.create(current.session.access_token,{operation_id:pending.operationId,
        sanction_id:pending.sanctionId,statement:pending.statement,media_refs:[]});
      if(!validAppeal(receipt))throw new AppealError('NETWORK_UNCONFIRMED','申诉回执无法确认',true);
      const accepted={...pending,phase:'accepted' as const};
      await saveAppealDraft(accepted);setDraft(accepted);
    }catch(failure){
      if(failure instanceof AppealError && !failure.uncertain){
        const editable={...draft,operationId:randomUUID(),phase:'editing' as const};
        try{await saveAppealDraft(editable);setDraft(editable);}catch{/* Preserve original operation for lookup. */}
      }
      setError(failure instanceof Error?failure.message:'申诉结果暂时无法确认');
    }finally{setBusy(false);}
  };
  const queryOriginal=async()=>{
    if(!draft || busy || draft.phase!=='unknown')return;
    setBusy(true);setError('');
    try{
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.owner){setError('请使用提交申诉时的账号查询原操作');return;}
      const operation=await accounts.operation(current.session.access_token,draft.operationId);
      if(operation.operation_id!==draft.operationId || operation.action!=='appeal.create'){
        setError('查询结果与本次申诉不匹配，操作号已保留');return;
      }
      if(operation.state==='succeeded'){
        if(!validAppeal(operation.result) || operation.result.sanction_id!==draft.sanctionId){
          setError('原操作已记录，但申诉回执不完整，请稍后再查');return;
        }
        const next={...draft,phase:'accepted' as const};await saveAppealDraft(next);setDraft(next);
      }else if(operation.state==='failed'){
        const next={...draft,operationId:randomUUID(),phase:'editing' as const};
        await saveAppealDraft(next);setDraft(next);setError('原操作确认失败，说明已保留，请检查后重新提交');
      }else setError('原操作仍待确认，请稍后再查，勿重复提交');
    }catch(failure){setError(failure instanceof Error?failure.message:'暂时无法查询原操作');}
    finally{setBusy(false);}
  };
  const otherSanction=!!draft && draft.sanctionId!==sanctionId;
  return <AppFrame title="提交申诉" onBack={()=>router.back()}>
    {status==='loading'?<PageStatus kind="loading" message="正在读取申诉信息…"/>:
      status==='guest'?<PageStatus kind="guest" message="登录后可以提交申诉" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>:
      status==='error'?<PageStatus kind="error" message={error} actionLabel="重试" onAction={()=>void load()}/>:
      draft?<ScrollView className="flex-1" contentContainerStyle={{padding:24,gap:16}} keyboardShouldPersistTaps="handled">
        <View className="gap-1 rounded-xl border border-line bg-surface p-4">
          <Text className="text-[13px] font-semibold text-fg">处罚编号</Text>
          <Text selectable className="text-[11px] leading-5 text-secondary">{draft.sanctionId}</Text>
        </View>
        {otherSanction?<Text className="text-[14px] leading-6 text-fg">另一条处罚的申诉结果待确认，请先查询原操作。</Text>:
          <Text className="text-[13px] leading-6 text-secondary">请说明你希望复核的事实和理由。申诉会等待与原处置人不同的有权人员复核。</Text>}
        {!otherSanction && draft.phase==='editing'?<><TextInput accessibilityLabel="申诉说明" multiline value={draft.statement} onChangeText={updateStatement}
          placeholder="说明事实和理由" placeholderTextColor={colors.secondary} textAlignVertical="top" maxLength={20000}
          className="min-h-44 rounded-xl border border-line bg-surface p-4 text-[15px] leading-6 text-fg" />
          <Text className="text-right text-[12px] text-secondary">{countVisibleCharacters(draft.statement)}/10000</Text></>:null}
        {draft.phase==='accepted'?<Text className="text-[15px] leading-6 text-fg">申诉已受理，可在“处罚与申诉”查看复核进度。</Text>:null}
        {draft.phase==='unknown'?<Text className="text-[14px] leading-6 text-fg">申诉结果尚未确认。查询原操作前请勿再次提交。</Text>:null}
        {error?<Text accessibilityRole="alert" className="text-[13px] leading-6 text-fg">{error}</Text>:null}
        {draft.phase==='editing' && !otherSanction?<AppButton label="提交申诉" tone="accent" busy={busy}
          disabled={!draft.statement.trim() || countVisibleCharacters(draft.statement)>10000} onPress={()=>void submit()}/>:null}
        {draft.phase==='unknown'?<AppButton label="查询原操作" busy={busy} onPress={()=>void queryOriginal()}/>:null}
        <AppButton label="查看处罚与申诉" tone="text" onPress={()=>router.push('/me/sanctions')}/>
      </ScrollView>:null}
  </AppFrame>;
}
