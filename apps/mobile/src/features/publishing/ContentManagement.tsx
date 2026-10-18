import { useEffect,useRef,useState } from 'react';
import { ScrollView,Text,TextInput,View } from 'react-native';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { countVisibleCharacters } from '../../../../../packages/contracts/src/graphemes';
import { AppButton,AppEmpty,PageStatus } from '../../components/AppChrome';
import { ContentRevisionCard,type OwnedRevision,publicationLabels,reviewLabels } from '../../components/ContentRevisionCard';
import { accountApi } from '../account/api';
import { currentProfileSession } from '../profile/session';
import { isRevisionReceipt,PostError } from './post-api';
import { isActionReceipt,isDeletion,lifecycleApi,type Deletion } from './lifecycle-api';

const release=Constants.expoConfig?.version || '0.0.0';
const api=lifecycleApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
type Action='post.edit'|'post.visibility'|'post.reply_policy'|'resource.delete'|'resource.restore';
type Pending={operationId:string;action:Action;targetId:string};
const key=(accountId:string)=>`agoraweave.lifecycle.pending.v1.${accountId}`;
const validPending=(value:unknown):value is Pending=>!!value && typeof value==='object' &&
  'operationId' in value && typeof value.operationId==='string' &&
  'targetId' in value && typeof value.targetId==='string' &&
  'action' in value && ['post.edit','post.visibility','post.reply_policy','resource.delete','resource.restore'].includes(String(value.action));
async function readPending(accountId:string):Promise<Pending|null>{
  const raw=await SecureStore.getItemAsync(key(accountId));
  if(!raw)return null;
  try {const value:unknown=JSON.parse(raw);return validPending(value)?value:null;} catch {return null;}
}
async function savePending(accountId:string,pending:Pending|null):Promise<void>{
  if(pending)await SecureStore.setItemAsync(key(accountId),JSON.stringify(pending),{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  else await SecureStore.deleteItemAsync(key(accountId));
}
const visibilityLabels={public:'公开',followers:'关注者可见',self:'仅自己可见'} as const;
const replyLabels={all_readers:'所有有权阅读者',author_follows:'我关注的人',mentioned:'提及的人',closed:'关闭回复'} as const;
const notice=(error:unknown)=>error instanceof Error?error.message:'操作暂时失败，请重试';

export function ContentManagement({item,accountId,onClose,onChanged,onDeleted}:{item:OwnedRevision;accountId:string;onClose:()=>void;onChanged:()=>void;onDeleted:(deletion:Deletion)=>void}){
  const [body,setBody]=useState(item.body),[tags,setTags]=useState(item.tags.join('\n'));
  const [alt,setAlt]=useState(item.media_refs.map((_,index)=>item.alt_text[index] || '')),[visibility,setVisibility]=useState(item.visibility),[scope,setScope]=useState(item.reply_scope);
  const [mode,setMode]=useState<'edit'|'visibility'|'reply'|'delete'|'history'|null>(null);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[pending,setPending]=useState<Pending|null>(null);
  const inflight=useRef(false);
  const pendingLoaded=useRef(false);
  const [preview,setPreview]=useState<{receipt:Awaited<ReturnType<typeof api.visibilityPreview>>;operationId:string}|null>(null);
  const [history,setHistory]=useState<OwnedRevision[]>([]),[historyCursor,setHistoryCursor]=useState<string|null>(null);
  useEffect(()=>{let active=true;pendingLoaded.current=false;void readPending(accountId).then(value=>{if(active){setPending(value);pendingLoaded.current=true;}}).catch(()=>{
    if(active)setMessage('本机原操作记录暂时无法读取，请稍后重试');});return()=>{active=false;};},[accountId]);
  const current=async()=>{
    const session=await currentProfileSession();
    if(!session || session.accountId!==accountId)throw new Error('登录账号已变化，请重新登录后操作');
    return session.session.access_token;
  };
  async function run<T>(action:Action,targetId:string,request:(token:string,operationId:string)=>Promise<T>,confirmed:(result:T)=>void,
    fixedOperationId?:string){
    if(inflight.current || busy || pending || !pendingLoaded.current)return;
    inflight.current=true;setBusy(true);setMessage('');
    const operationId=fixedOperationId || randomUUID(),entry={operationId,action,targetId};
    try {
      const token=await current();
      await savePending(accountId,entry);setPending(entry);
      const result=await request(token,operationId);
      await savePending(accountId,null);setPending(null);
      confirmed(result);onChanged();
    } catch(error){
      if(error instanceof PostError && !error.unknown && error.code!=='SERVICE_UNAVAILABLE'){
        await savePending(accountId,null).then(()=>setPending(null)).catch(()=>{});
      } else if(error instanceof PostError && error.code==='SERVICE_UNAVAILABLE' && !error.unknown){
        await savePending(accountId,null).then(()=>setPending(null)).catch(()=>{});
      }
      setMessage(notice(error));
    } finally {inflight.current=false;setBusy(false);}
  }
  const queryOriginal=async()=>{
    if(!pending || busy)return;
    setBusy(true);setMessage('');
    try {
      const token=await current();
      const result=await accounts.operation(token,pending.operationId);
      if(result.operation_id!==pending.operationId || result.action!==pending.action){setMessage('原操作回执不匹配，操作号仍保留');return;}
      if(result.state==='succeeded'){
        const valid=pending.action==='post.edit'?isRevisionReceipt(result.result,pending.operationId):
          pending.action==='resource.delete'||pending.action==='resource.restore'?isDeletion(result.result):isActionReceipt(result.result,pending.operationId);
        if(!valid){setMessage('原操作已记录，但回执不完整；操作号仍保留');return;}
        await savePending(accountId,null);setPending(null);setMessage('原操作已确认成功');onChanged();
      } else if(result.state==='failed'){
        await savePending(accountId,null);setPending(null);setMessage('原操作确认失败，输入已保留，可刷新后重新提交');
      } else setMessage('原操作仍待确认，操作号已保留，请稍后再查');
    } catch {setMessage('暂时无法确认原操作，操作号已保留，请稍后再查');}
    finally {setBusy(false);}
  };
  const submitEdit=()=>{
    const parsedTags=tags.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
    if(countVisibleCharacters(body)>2000 || parsedTags.length>20 || parsedTags.some(tag=>tag.length>100) ||
      alt.length!==item.media_refs.length || alt.some(value=>value.length>2000)){
      setMessage('请检查正文 2000 字、标签最多 20 个及每张图片的替代文本');return;
    }
    if(body===item.body && JSON.stringify(parsedTags)===JSON.stringify(item.tags) && JSON.stringify(alt)===JSON.stringify(item.alt_text)){
      setMessage('内容没有变化');return;
    }
    void run('post.edit',item.resource_id,(token,operation_id)=>api.patch(token,item.resource_id,{operation_id,base_version:item.row_version,
      body,tags:parsedTags,alt_text:alt}),()=>{setMessage('编辑已受理，新版本进入审核');setMode(null);});
  };
  const requestPreview=async()=>{
    if(inflight.current || busy || pending || visibility===item.visibility)return;
    inflight.current=true;setBusy(true);setPreview(null);setMessage('');
    const operationId=randomUUID();
    try {const receipt=await api.visibilityPreview(await current(),item.resource_id,{operation_id:operationId,
      base_version:item.row_version,visibility});setPreview({receipt,operationId});}
    catch(error){setMessage(notice(error));}finally{inflight.current=false;setBusy(false);}
  };
  const submitVisibility=()=>{
    if(!preview || preview.receipt.base_version!==item.row_version || Date.parse(preview.receipt.expires_at)<=Date.now()){
      setPreview(null);setMessage('影响预览已过期，请重新预览');return;
    }
    void run('post.visibility',item.resource_id,(token,operation_id)=>api.visibility(token,item.resource_id,{operation_id,
      base_version:item.row_version,visibility,preview_digest:preview.receipt.preview_digest}),
    ()=>{setPreview(null);setMode(null);setMessage('可见范围已更新');},preview.operationId);
  };
  const submitReply=()=>void run('post.reply_policy',item.resource_id,(token,operation_id)=>api.replyPolicy(token,item.resource_id,{operation_id,
    base_version:item.row_version,scope}),()=>{setMode(null);setMessage('回复范围已更新');});
  const submitDelete=()=>void run('resource.delete',item.resource_id,(token,operation_id)=>api.remove(token,item.resource_id,{operation_id,
    base_version:item.row_version}),deletion=>{setMessage(`已删除。${new Date(deletion.undo_until).toLocaleTimeString()} 前可撤销；之后可在最近删除中按期限恢复。`);setMode(null);onDeleted(deletion);});
  const loadHistory=async(cursor?:string)=>{
    if(busy)return;
    setBusy(true);setMessage('');
    try {const page=await api.revisions(await current(),item.resource_id,cursor);
      setHistory(previous=>cursor?[...previous,...page.items]:page.items);setHistoryCursor(page.next_cursor);}
    catch(error){setMessage(notice(error));}finally{setBusy(false);}
  };
  return <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:28}} keyboardShouldPersistTaps="handled">
    <View className="gap-3 px-6 py-4"><AppButton label="返回我的内容" tone="text" onPress={onClose}/>
      <Text className="text-[17px] font-semibold text-fg">管理帖子</Text>
      <Text className="text-[12px] text-secondary">{reviewLabels[item.review_state]} · {publicationLabels[item.publication_state]} · 版本 {item.revision_no}</Text>
      <Text className="text-[12px] text-secondary">当前可见：{visibilityLabels[item.visibility]} · 回复：{replyLabels[item.reply_scope]}</Text>
      {pending?<View className="gap-2 rounded-xl bg-surface p-3"><Text className="text-[13px] text-fg">原操作结果待确认，暂不能重复提交</Text>
        <Text selectable className="text-[11px] text-secondary">操作号：{pending.operationId}</Text>
        <AppButton label="查询原操作" busy={busy} onPress={()=>void queryOriginal()}/></View>:null}
      {message?<Text accessibilityRole="alert" className="text-[13px] leading-6 text-fg">{message}</Text>:null}
      <View className="flex-row flex-wrap gap-2">{(['edit','visibility','reply','delete','history'] as const).map(value=>
        <AppButton key={value} label={{edit:'编辑',visibility:'可见范围',reply:'谁可以回复',delete:'删除',history:'编辑历史'}[value]}
          tone={mode===value?'accent':'outline'} disabled={busy || !!pending} onPress={()=>{
            setMode(value);setMessage('');setPreview(null);if(value==='history')void loadHistory();}} compact/>)}</View>
      {mode==='edit'?<View className="gap-3"><Text className="text-[13px] text-secondary">编辑会生成待审核的新版本；已发布图片不会替换。</Text>
        <TextInput accessibilityLabel="编辑帖子正文" multiline value={body} onChangeText={setBody} editable={!busy && !pending}
          textAlignVertical="top" className="min-h-[180px] rounded-xl border border-line p-3 text-[15px] leading-6 text-fg"/>
        <Text className="text-[12px] text-secondary">{countVisibleCharacters(body)}/2000</Text>
        <TextInput accessibilityLabel="标签，每行一个" multiline value={tags} onChangeText={setTags} editable={!busy && !pending}
          placeholder="标签，每行一个" className="min-h-12 rounded-xl border border-line p-3 text-[14px] text-fg"/>
        {alt.map((value,index)=><TextInput key={index} accessibilityLabel={`第 ${index+1} 张图片替代文本`} value={value}
          onChangeText={next=>setAlt(previous=>previous.map((old,i)=>i===index?next:old))} editable={!busy && !pending}
          placeholder={`图片 ${index+1} 替代文本`} className="min-h-12 rounded-xl border border-line p-3 text-[14px] text-fg"/>)}
        <AppButton label="提交编辑审核" tone="primary" busy={busy} disabled={!!pending} onPress={submitEdit}/></View>:null}
      {mode==='visibility'?<View className="gap-2"><Text className="text-[13px] text-secondary">变更前查看受影响内容，服务端会再次核验当前资格。</Text>
        {(['public','followers','self'] as const).map(value=><AppButton key={value} label={visibilityLabels[value]}
          tone={visibility===value?'accent':'outline'} disabled={busy || !!pending} onPress={()=>{setVisibility(value);setPreview(null);}}/>)}
        <AppButton label="预览影响" disabled={busy || !!pending || visibility===item.visibility} busy={busy} onPress={()=>void requestPreview()}/>
        {preview?<View className="gap-2 rounded-xl bg-surface p-3"><Text className="text-[13px] text-fg">影响 {preview.receipt.affected_refs.length} 项</Text>
          {preview.receipt.impacts.map((impact,index)=><Text key={index} className="text-[12px] text-secondary">{impact}</Text>)}
          <Text className="text-[11px] text-secondary">预览有效至 {new Date(preview.receipt.expires_at).toLocaleTimeString()}</Text>
          <AppButton label="确认变更可见范围" tone="primary" disabled={busy || !!pending} onPress={submitVisibility}/></View>:null}</View>:null}
      {mode==='reply'?<View className="gap-2">{(['all_readers','closed'] as const).map(value=><AppButton key={value}
        label={replyLabels[value]} tone={scope===value?'accent':'outline'} disabled={busy || !!pending} onPress={()=>setScope(value)}/>)}
        <Text className="text-[12px] text-secondary">当前首版支持所有有权阅读者与关闭回复。</Text>
        <AppButton label="保存回复范围" tone="primary" disabled={busy || !!pending || scope===item.reply_scope} onPress={submitReply}/></View>:null}
      {mode==='delete'?<View className="gap-3 rounded-xl bg-surface p-3"><Text className="text-[13px] leading-6 text-fg">删除后内容与图片会立即退出正常访问。10 秒内可撤销，30 天内可在最近删除恢复。</Text>
        <AppButton label="确认删除帖子" tone="primary" disabled={busy || !!pending} onPress={submitDelete}/></View>:null}
      {mode==='history'?<View className="gap-2">{!history.length?<AppEmpty icon="file" title="暂无编辑记录" description="历史版本仅向当前有权的作者显示。"/>:
        history.map(revision=><ContentRevisionCard key={revision.id} item={revision} onOpen={()=>{}}/>)}
        {historyCursor?<AppButton label="加载更多历史" busy={busy} onPress={()=>void loadHistory(historyCursor)}/>:null}</View>:null}
    </View>
  </ScrollView>;
}

export function RecentlyDeleted({accountId,onChanged,initialDeletion}:{accountId:string;onChanged:()=>void;initialDeletion?:Deletion|null}){
  const [items,setItems]=useState<Deletion[]>(initialDeletion?[initialDeletion]:[]),[cursor,setCursor]=useState<string|null>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>(initialDeletion?'ready':'loading'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const [pending,setPending]=useState<Pending|null>(null);
  const restoring=useRef(false),pendingLoaded=useRef(false);
  const [now,setNow]=useState(Date.now());
  const current=async()=>{const session=await currentProfileSession();if(!session || session.accountId!==accountId)throw new Error('登录账号已变化');return session.session.access_token;};
  const load=async(next?:string)=>{setBusy(true);setMessage('');try{const page=await api.recentlyDeleted(await current(),next);
    setItems(previous=>next?[...previous,...page.items.filter(item=>!previous.some(old=>old.id===item.id))]:page.items);
    setCursor(page.next_cursor);setStatus('ready');}
    catch(error){setMessage(notice(error));setStatus('error');}finally{setBusy(false);}};
  useEffect(()=>{pendingLoaded.current=false;void readPending(accountId).then(value=>{setPending(value);pendingLoaded.current=true;}).catch(()=>setMessage('暂时无法恢复原操作记录，请返回后重试'));void load();},[accountId]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const restore=async(deletion:Deletion)=>{
    if(restoring.current || busy || pending || !pendingLoaded.current || deletion.state!=='deleted' || !deletion.allowed_actions.includes('restore'))return;
    restoring.current=true;setBusy(true);setMessage('');const operationId=randomUUID(),entry:Pending={operationId,action:'resource.restore',targetId:deletion.id};
    try {const token=await current();await savePending(accountId,entry);setPending(entry);
      await api.restore(token,deletion.id,{operation_id:operationId,base_version:deletion.row_version});
      await savePending(accountId,null);setPending(null);setMessage('已恢复，显示仍取决于当前审核与可见权限');onChanged();void load();}
    catch(error){if(error instanceof PostError && !error.unknown){await savePending(accountId,null).then(()=>setPending(null)).catch(()=>{});}setMessage(notice(error));}
    finally{restoring.current=false;setBusy(false);}
  };
  const query=async()=>{if(!pending || busy)return;setBusy(true);try{const op=await accounts.operation(await current(),pending.operationId);
    if(op.operation_id!==pending.operationId || op.action!==pending.action){setMessage('原操作回执不匹配，请稍后再查');return;}
    if(op.state==='succeeded' && (pending.action==='post.edit'?isRevisionReceipt(op.result,pending.operationId):
      pending.action==='resource.delete'||pending.action==='resource.restore'?isDeletion(op.result):isActionReceipt(op.result,pending.operationId))){
      await savePending(accountId,null);setPending(null);setMessage('原操作已确认成功');onChanged();void load();}
    else if(op.state==='failed'){await savePending(accountId,null);setPending(null);setMessage('原操作确认失败，可刷新后重试');}
    else setMessage('原操作仍待确认，操作号已保留');}
    catch{setMessage('原操作暂时无法确认，操作号已保留');}finally{setBusy(false);}};
  return <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:28}}><View className="gap-3 px-6 py-4">
    <Text className="text-[16px] font-semibold text-fg">最近删除</Text>
    {pending?<View className="gap-2 rounded-xl bg-surface p-3"><Text className="text-[13px] text-fg">原操作结果待确认</Text>
      <Text selectable className="text-[11px] text-secondary">{pending.operationId}</Text><AppButton label="查询原操作" onPress={()=>void query()}/></View>:null}
    {message?<Text accessibilityRole="alert" className="text-[13px] text-fg">{message}</Text>:null}
    {status==='loading'?<PageStatus kind="loading" message="正在读取最近删除…"/>:status==='error'?<AppButton label="重试读取" onPress={()=>void load()}/>:
      !items.length?<AppEmpty icon="file" title="暂无最近删除" description="本人删除的内容会在恢复期限内显示。"/>:
      items.map(item=><View key={item.id} className="gap-2 border-b border-line py-4">
        <Text className="text-[13px] text-fg">内容 {item.target_id.slice(0,8)} · {item.state==='deleted'?'已删除':item.state==='restored'?'已恢复':'已永久清理'}</Text>
        <Text className="text-[11px] text-secondary">删除于 {new Date(item.deleted_at).toLocaleString()} · 可恢复至 {new Date(item.restore_until).toLocaleString()}</Text>
        {item.state==='deleted' && item.allowed_actions.includes('restore')?<AppButton label={Date.parse(item.undo_until)>now?'撤销删除':'恢复内容'}
          disabled={busy || !!pending} onPress={()=>void restore(item)}/>:null}</View>)}
    {cursor?<AppButton label="加载更多" busy={busy} onPress={()=>void load(cursor)}/>:null}
  </View></ScrollView>;
}
