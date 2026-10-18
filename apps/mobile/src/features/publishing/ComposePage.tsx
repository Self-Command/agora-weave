import { useCallback,useEffect,useRef,useState } from 'react';
import { ActivityIndicator,BackHandler,Image,Pressable,ScrollView,Text,TextInput,View,useColorScheme } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { countVisibleCharacters,normalizeText } from '../../../../../packages/contracts/src/graphemes';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { AppButton,AppFrame,Avatar,PageStatus } from '../../components/AppChrome';
import { PrototypeIcon } from '../shell/PrototypeIcon';
import { accountApi,AccountError,type SessionTokens } from '../account/api';
import { readSession,saveSession } from '../account/session-store';
import { localDraftOwner,readComposeDraft,saveComposeDraft,type ComposeDraft } from './compose-store';
import { isRevisionReceipt,postApi,PostError,type CreatePostRequest } from './post-api';
import type { UploadImage } from './image-upload';

const release=Constants.expoConfig?.version || '0.0.0';
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const posts=postApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const initialDraft=():ComposeDraft=>({ body:'',visibility:'public',replyScope:'all_readers',operationId:randomUUID(),phase:'editing',receipt:null,images:[] });
const visibilityLabels={public:'公开',followers:'关注者可见',self:'仅自己可见'} as const;
const replyLabels={all_readers:'所有有权阅读者',author_follows:'我关注的人',mentioned:'提及的人',closed:'关闭回复'} as const;
const reviewLabels={pending:'待审核',approved:'审核通过',rejected:'审核未通过'} as const;
const publicationLabels={preparing:'准备中',awaiting_review:'等待审核',published:'已公开',rejected:'未通过',failed:'失败',cancelled:'已取消'} as const;
function receiptMessage(state:keyof typeof publicationLabels) {
  return state==='published'?'帖子已公开':state==='awaiting_review' || state==='preparing'?'提交已受理，仍待审核或发布':
    state==='rejected'?'帖子未通过审核，正文已保留':state==='failed'?'发布处理失败，正文已保留':'发布已取消，正文已保留';
}

async function currentSession():Promise<SessionTokens|null> {
  let session=await readSession();
  if(!session)return null;
  if(session.expires_at*1000<=Date.now()) {
    session=(await accounts.refresh(session.refresh_token)).session;
    await saveSession(session);
  }
  return session;
}

function Choice<ChoiceValue extends string>({ value,selected,label,onPress }: {
  value:ChoiceValue;selected:boolean;label:string;onPress:(value:ChoiceValue)=>void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={()=>onPress(value)}
    className={`min-h-11 justify-center rounded-[22px] border px-4 ${selected?'border-accent bg-surface':'border-line'}`}>
    <Text className={`text-[13px] ${selected?'font-semibold text-fg':'text-secondary'}`}>{label}</Text>
  </Pressable>;
}

export function ComposePage() {
  const router=useRouter(),colors=themeFor(useColorScheme());
  const [auth,setAuth]=useState<'loading'|'guest'|'ready'|'error'>('loading');
  const [owner,setOwner]=useState<string|null>(null);
  const ownerRef=useRef<string|null>(null);
  const [draft,setDraft]=useState<ComposeDraft>(initialDraft);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[saveError,setSaveError]=useState('');
  const [openChoice,setOpenChoice]=useState<'visibility'|'reply'|null>(null);
  const [authRequired,setAuthRequired]=useState(false);
  const apply=(next:ComposeDraft)=>setDraft(next);
  const restore=useCallback(async()=>{
    setAuth('loading');
    try {
      const current=await currentSession();
      if(!current){setAuth('guest');return;}
      const subject=localDraftOwner(current.access_token);
      if(!subject){setAuth('error');setMessage('登录信息无法识别，请重新登录');return;}
      if(ownerRef.current!==subject){
        const saved=await readComposeDraft(subject);
        const restored=saved?{ ...saved,images:saved.images.map(image=>image.phase==='uploading'?{ ...image,phase:'unknown' as const }:image) }:initialDraft();
        apply(restored);ownerRef.current=subject;setOwner(subject);
        setMessage(restored.phase==='unknown'?'上次提交结果仍待确认，请勿重复发布':
          restored.images.some(image=>image.phase==='unknown')?'上次图片上传结果待确认，请查询图片原操作':'');
      }
      setAuthRequired(false);setAuth('ready');
    } catch {
      setAuth('error');setMessage('暂时无法读取登录信息，请重试或进入账号页');
    }
  },[]);
  useFocusEffect(useCallback(()=>{void restore();},[restore]));
  useEffect(()=>{
    if(!owner || auth!=='ready' || busy)return;
    const timer=setTimeout(()=>{void saveComposeDraft(owner,draft).then(()=>setSaveError('')).catch(()=>setSaveError('本机草稿保存失败，请勿关闭页面'));},350);
    return ()=>clearTimeout(timer);
  },[owner,auth,draft,busy]);
  const edit=(patch:Partial<ComposeDraft>)=>{
    if(busy || draft.phase==='unknown' || draft.phase==='accepted')return;
    apply({ ...draft,...patch,operationId:randomUUID(),phase:'editing',receipt:null });setMessage('');
  };
  const pickImages=async()=>{
    if(busy || auth!=='ready' || !owner || draft.phase==='unknown' || draft.phase==='accepted')return;
    if(draft.images.length>=9){setMessage('每帖最多选择 9 张图片');return;}
    setBusy(true);setMessage('');
    try {
      const picker=await import('expo-image-picker');
      const selected=await picker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,
        selectionLimit:9-draft.images.length,allowsEditing:false,quality:1});
      if(selected.canceled)return;
      const { keepSelectedImage,discardLocalImage }=await import('./image-upload');
      let next={ ...draft,images:[...draft.images],operationId:randomUUID(),phase:'editing' as const,receipt:null };
      for(const asset of selected.assets){
        if(next.images.length>=9)break;
        try {
          const image=await keepSelectedImage(asset.uri);
          next={ ...next,images:[...next.images,image] };
          try {await saveComposeDraft(owner,next);} catch(error){discardLocalImage(image);throw error;}
          apply(next);
        } catch(error) {
          setMessage(error instanceof Error?error.message:'图片保存失败，请重新选择');
          break;
        }
      }
    } catch(error) {setMessage(error instanceof Error?error.message:'无法打开图片选择器，请稍后重试');}
    finally {setBusy(false);}
  };
  const removeImage=async(image:UploadImage)=>{
    if(busy || !owner || draft.phase==='unknown' || draft.phase==='accepted' || image.phase==='unknown')return;
    const next:ComposeDraft={ ...draft,images:draft.images.filter(item=>item.id!==image.id),operationId:randomUUID(),phase:'editing',receipt:null };
    try {
      await saveComposeDraft(owner,next);apply(next);
      const { discardLocalImage }=await import('./image-upload');discardLocalImage(image);
      setMessage('图片已移除，未发布的暂存不会公开');
    } catch {setSaveError('本机草稿保存失败，请勿关闭页面');}
  };
  const publish=async()=>{
    if(busy || auth!=='ready' || !owner || draft.phase==='unknown' || draft.phase==='accepted')return;
    const body=normalizeText(draft.body),length=countVisibleCharacters(body);
    if((!body.trim() && !draft.images.length) || length>2000){setMessage(!body.trim()?'文字帖需要正文，图片帖可以不写说明':'正文超过当前普通帖 2000 字上限');return;}
    if(draft.replyScope!=='all_readers'){setMessage('当前只支持所有有权阅读者回复，请切换回复范围后发布');return;}
    setBusy(true);setMessage('');
    let submission={ ...draft,body,operationId:draft.phase==='failed'?randomUUID():draft.operationId };
    try {
      await saveComposeDraft(owner,submission);
      setSaveError('');
      const current=await currentSession();
      if(!current){setAuth('guest');setMessage('登录后才能发布，输入已保留');return;}
      if(localDraftOwner(current.access_token)!==owner){setAuth('error');setMessage('当前账号已变化，请重新打开发布页');return;}
      if(submission.images.length){
        const { imageBytes,uploadApi,UploadError }=await import('./image-upload');
        const uploads=uploadApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
        for(let index=0;index<submission.images.length;index++){
          let image=submission.images[index];
          if(image.phase==='ready')continue;
          if(image.phase==='unknown'){setMessage('图片上传结果待确认，请先查询图片原操作');return;}
          const update=async(patch:Partial<UploadImage>)=>{
            image={ ...image,...patch };
            const images=[...submission.images];images[index]=image;
            submission={ ...submission,images };
            await saveComposeDraft(owner,submission);apply(submission);
          };
          try {
            await imageBytes(image);
            if(image.phase==='failed' && image.step){
              await update(image.step==='create'?{createOperationId:randomUUID()}:image.step==='part'?{partOperationId:randomUUID()}: {completeOperationId:randomUUID()});
            }
            if(!image.uploadId){
              await update({phase:'uploading',step:'create'});
              const session=await uploads.create(current.access_token,image);
              if(session.state==='failed' || session.state==='quarantined')throw new UploadError('INVALID_IMAGE','图片未通过检查，请重新选择');
              await update({uploadId:session.id,mediaId:session.media_id,uploadedParts:session.uploaded_parts,
                phase:session.state==='validated'?'ready':'selected',step:null});
            }
            if((image as UploadImage).phase==='ready')continue;
            if(!image.uploadedParts.includes(0)){
              await update({phase:'uploading',step:'part'});
              const part=await uploads.part(current.access_token,image);
              await update({uploadedParts:part.uploaded_parts,phase:'selected',step:null});
            }
            await update({phase:'uploading',step:'complete'});
            const complete=await uploads.complete(current.access_token,image);
            if(complete.state!=='validated')throw new UploadError('INVALID_STATE',
              complete.state==='failed' || complete.state==='quarantined'?'图片未通过检查，请重新选择':'图片尚未通过校验，暂不能发布');
            await update({phase:'ready',step:null,mediaId:complete.media_id,uploadedParts:complete.uploaded_parts});
          } catch(error) {
            const unknown=error instanceof UploadError && error.unknown;
            await update({phase:unknown?'unknown':'failed'});
            if(error instanceof UploadError && error.code==='SESSION_INVALID')setAuthRequired(true);
            setMessage(error instanceof Error?error.message:'图片上传失败，正文和图片已保留');
            return;
          }
        }
      }
      const pending:ComposeDraft={ ...submission,phase:'unknown',receipt:null };
      // Persist the conservative state before the first network byte can be sent.
      await saveComposeDraft(owner,pending);
      apply(pending);
      const input:CreatePostRequest={ operation_id:submission.operationId,type:submission.images.length?'images':'text',body:submission.body,
        visibility:submission.visibility,reply_scope:submission.replyScope,
        ...(submission.images.length?{media_refs:submission.images.map(image=>image.mediaId!).filter(Boolean)}:{}) };
      const receipt=await posts.create(current.access_token,input);
      const accepted:ComposeDraft={ ...submission,phase:'accepted',receipt };
      apply(accepted);await saveComposeDraft(owner,accepted);
      setMessage(receiptMessage(receipt.publication_state));
    } catch(error) {
      if(error instanceof PostError) {
        if(error.code==='SESSION_INVALID')setAuthRequired(true);
        const next:ComposeDraft={ ...submission,phase:error.unknown?'unknown':'failed',receipt:null };
        apply(next);setMessage(error.message);
        try { await saveComposeDraft(owner,next);setSaveError(''); }
        catch { setSaveError('本机草稿保存失败，请勿关闭页面'); }
      } else {
        if(error instanceof AccountError){setAuthRequired(true);setMessage('登录状态暂时无法确认，输入已保留，请重新登录或稍后重试');}
        else {setMessage(error instanceof Error?error.message:'暂时无法保存登录信息，输入已保留');
          setSaveError('本机草稿或登录信息未能安全保存，请勿关闭页面');}
      }
    } finally {setBusy(false);}
  };
  const queryOriginal=async()=>{
    if(busy || auth!=='ready' || !owner || draft.phase!=='unknown')return;
    setBusy(true);setMessage('正在查询原操作…');
    try {
      const current=await currentSession();
      if(!current){setAuth('guest');setMessage('请重新登录后查询原操作，原操作仍保留');return;}
      if(localDraftOwner(current.access_token)!==owner){setAuth('error');setMessage('账号已变化，原操作不能由其他账号查询');return;}
      const operation=await accounts.operation(current.access_token,draft.operationId);
      if(operation.operation_id!==draft.operationId || operation.action!=='post.create') {
        setMessage('查询结果与原发布操作不匹配，原操作仍保留');return;
      }
      if(operation.state==='succeeded') {
        if(!isRevisionReceipt(operation.result,draft.operationId)) {
          setMessage('原操作已记录，但发布回执不完整，仍需稍后查询');return;
        }
        const accepted:ComposeDraft={ ...draft,phase:'accepted',receipt:operation.result };
        apply(accepted);await saveComposeDraft(owner,accepted);
        setMessage(`原操作确认：${receiptMessage(operation.result.publication_state)}`);
      } else if(operation.state==='failed') {
        const failed:ComposeDraft={ ...draft,phase:'failed',receipt:null };
        apply(failed);await saveComposeDraft(owner,failed);
        setMessage('原操作确认失败，正文已保留；重新发布会使用新的操作号');
      } else setMessage('原操作仍待确认，正文和操作号已保留，请稍后再查');
    } catch(error) {
      if(error instanceof AccountError && error.code==='SESSION_INVALID')setAuthRequired(true);
      setMessage(error instanceof AccountError && ['NOT_FOUND','CONFLICT','SERVICE_UNAVAILABLE','NETWORK_UNCONFIRMED'].includes(error.code) ?
        '暂时无法确认原操作，正文和操作号仍保留，请稍后再查' :
        '原操作查询失败，正文和操作号仍保留，请稍后再查');
    } finally {setBusy(false);}
  };
  const queryImageOriginal=async(imageId:string)=>{
    if(busy || auth!=='ready' || !owner)return;
    const image=draft.images.find(item=>item.id===imageId);
    if(!image || image.phase!=='unknown' || !image.step)return;
    setBusy(true);setMessage('正在查询图片上传原操作…');
    try {
      const current=await currentSession();
      if(!current || localDraftOwner(current.access_token)!==owner){setAuthRequired(true);setMessage('请用原账号重新登录后查询图片原操作');return;}
      const operationId=image.step==='create'?image.createOperationId:image.step==='part'?image.partOperationId:image.completeOperationId;
      const action=`upload.${image.step}`;
      const operation=await accounts.operation(current.access_token,operationId);
      if(operation.operation_id!==operationId || operation.action!==action){setMessage('查询结果与图片上传操作不匹配，请稍后再查');return;}
      let updated:UploadImage;
      if(operation.state==='succeeded'){
        const {validUploadSession}=await import('./image-upload');
        const result:unknown=operation.result;
        if(image.step==='part'){
          if(!result || typeof result!=='object' || !('upload_id' in result) || result.upload_id!==image.uploadId ||
            !('part' in result) || result.part!==0 || !('uploaded_parts' in result) || !Array.isArray(result.uploaded_parts) ||
            !result.uploaded_parts.includes(0)){setMessage('图片上传回执不完整，请稍后再查');return;}
          updated={ ...image,uploadedParts:[0],phase:'selected',step:null };
        } else {
          if(!validUploadSession(result)){setMessage('图片上传回执不完整，请稍后再查');return;}
          if(image.step==='create')updated={ ...image,uploadId:result.id,mediaId:result.media_id,
            uploadedParts:result.uploaded_parts,phase:result.state==='validated'?'ready':'selected',step:null };
          else if(result.id!==image.uploadId || result.state!=='validated'){
            setMessage('图片尚未通过校验，请稍后再查');return;
          } else updated={ ...image,mediaId:result.media_id,uploadedParts:result.uploaded_parts,phase:'ready',step:null };
        }
      } else if(operation.state==='failed')updated={ ...image,phase:'failed' };
      else {setMessage('图片上传仍待确认，请稍后再查');return;}
      const next={ ...draft,images:draft.images.map(item=>item.id===imageId?updated:item) };
      await saveComposeDraft(owner,next);apply(next);
      setMessage(updated.phase==='ready'?'图片上传已确认，可以发布':updated.phase==='failed'?'原图片操作确认失败，可重试该图片':
        '图片上传步骤已确认，可以继续发布');
    } catch(error) {
      if(error instanceof AccountError && error.code==='SESSION_INVALID')setAuthRequired(true);
      setMessage('图片上传原操作暂时无法确认，操作号和图片已保留');
    } finally {setBusy(false);}
  };
  const close=async()=>{
    if(busy)return;
    if(owner && auth==='ready') {
      try { await saveComposeDraft(owner,draft);setSaveError(''); }
      catch { setSaveError('本机草稿保存失败，请勿关闭页面');return; }
    }
    router.back();
  };
  useEffect(()=>{
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{void close();return true;});
    return ()=>back.remove();
  });
  const newPost=()=>{
    const previous=draft.images,next=initialDraft();apply(next);setMessage('');
    if(owner)void saveComposeDraft(owner,next).then(async()=>{
      const { discardLocalImage }=await import('./image-upload');previous.forEach(discardLocalImage);
    }).catch(()=>setSaveError('本机草稿保存失败，请勿关闭页面'));
  };
  const revisePost=()=>{
    const next:ComposeDraft={ ...draft,phase:'editing',operationId:randomUUID(),receipt:null };
    apply(next);setMessage('正文已保留，可修改后重新发布');
    if(owner)void saveComposeDraft(owner,next).catch(()=>setSaveError('本机草稿保存失败，请勿关闭页面'));
  };
  const count=countVisibleCharacters(draft.body);
  const canPublish=auth==='ready' && !busy && draft.phase!=='unknown' && !draft.images.some(image=>image.phase==='unknown') &&
    (draft.body.trim().length>0 || draft.images.length>0) && count<=2000 && draft.replyScope==='all_readers';
  return <AppFrame title="发布帖子" onBack={()=>void close()} backIcon="close" backDisabled={busy} headerBorder={false}
    right={auth==='ready'?<Pressable accessibilityRole="button" accessibilityLabel={draft.phase==='accepted'?'写新帖子':'发布帖子'}
        accessibilityState={{disabled:draft.phase!=='accepted' && !canPublish,busy}} disabled={draft.phase!=='accepted' && !canPublish}
        onPress={draft.phase==='accepted'?(draft.receipt && ['rejected','failed','cancelled'].includes(draft.receipt.publication_state)?revisePost:newPost):()=>void publish()}
        className="min-h-[36px] min-w-[62px] items-center justify-center rounded-[18px] bg-fg px-3"
        style={{opacity:draft.phase==='accepted' || canPublish?1:0.3}}><Text className="text-[12px] font-semibold text-bg">{busy?'处理中':draft.phase==='accepted'?'新帖子':'发布'}</Text></Pressable>:undefined}>
    {auth==='loading' ? <PageStatus kind="loading" message="正在读取登录和本机草稿…"/> : auth!=='ready' ?
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <PageStatus kind={auth==='guest'?'guest':'error'} message={message || (auth==='guest'?'登录后发布':'暂时无法读取登录信息')}
          actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/>
        <AppButton label="重试读取" tone="text" onPress={()=>void restore()}/>
      </View> : <>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow:1,paddingBottom:18 }}>
        <View className="flex-row gap-3 px-5 pt-5">
          <Avatar initial="我" size={38}/>
          <View className="flex-1">
            <TextInput accessibilityLabel="帖子正文" multiline placeholder="有什么想分享的？" placeholderTextColor={colors.secondary}
              value={draft.body} onChangeText={body=>edit({body})} editable={!busy && draft.phase!=='unknown' && draft.phase!=='accepted'}
              textAlignVertical="top" className={`${draft.phase==='unknown'||draft.phase==='accepted'?'min-h-[96px]':'min-h-[220px]'} text-[16px] leading-[30px] text-fg`} />
          </View>
        </View>
        <View className="gap-3 px-5 pt-2">
          {draft.images.map((image,index)=><View key={image.id} className="flex-row items-center gap-3 rounded-xl bg-surface p-3">
            <Image source={{uri:image.uri}} accessibilityLabel={`第 ${index+1} 张图片预览`} style={{width:64,height:64,borderRadius:8}} />
            <View className="flex-1 gap-1"><Text className="text-[12px] font-semibold text-fg">图片 {index+1} · {(image.sizeBytes/1_000_000).toFixed(1)} MB</Text>
              <Text className="text-[11px] text-secondary">{image.phase==='ready'?'已上传，尚未公开':image.phase==='unknown'?'上传结果待确认':
                image.phase==='failed'?'上传失败，可重试':image.phase==='uploading'?'正在上传':'保存在本机，发布时上传'}</Text></View>
            {image.phase==='unknown' ? <Pressable accessibilityRole="button" accessibilityLabel={`查询图片 ${index+1} 原操作`}
              accessibilityState={{disabled:busy}} disabled={busy} onPress={()=>void queryImageOriginal(image.id)} className="min-h-11 justify-center px-2">
              <Text className="text-[12px] font-semibold text-fg">查询</Text></Pressable> :
              draft.phase!=='accepted' && draft.phase!=='unknown' ? <Pressable accessibilityRole="button" accessibilityLabel={`移除图片 ${index+1}`}
                accessibilityState={{disabled:busy}} disabled={busy} onPress={()=>void removeImage(image)} className="min-h-11 justify-center px-2">
                <Text className="text-[12px] font-semibold text-fg">移除</Text></Pressable> : null}
          </View>)}
          {draft.images.length?<Text className="text-[11px] leading-5 text-secondary">每张最多 10 MB；图片先私有暂存，帖子受理后仍可能等待审核。</Text>:null}
        </View>
        {message ? <View accessibilityRole="alert" className="mx-5 mt-5 rounded-xl bg-surface px-4 py-3"><Text className="text-[13px] leading-6 text-fg">{message}</Text></View> : null}
        {authRequired ? <Pressable accessibilityRole="button" onPress={()=>router.push('/(auth)')} className="mx-5 mt-3 min-h-12 items-center justify-center rounded-[24px] border border-line">
          <Text className="text-[13px] font-semibold text-fg">重新登录</Text></Pressable> : null}
        {saveError ? <Text accessibilityRole="alert" className="mx-5 mt-3 text-[12px] text-error">{saveError}</Text> : null}
        {draft.phase==='unknown' ? <View className="mx-5 mt-5 gap-2"><Text className="text-[13px] font-semibold text-fg">发布结果待确认</Text>
          <Text className="text-[12px] leading-5 text-secondary">原操作号与正文已保留。查询确认前不能再次提交。</Text>
          <Text selectable className="text-[11px] text-secondary">原操作号 · {draft.operationId}</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled:busy,busy }} disabled={busy} onPress={()=>void queryOriginal()}
            className="mt-2 min-h-12 items-center justify-center rounded-[24px] border border-line">
            <Text className="text-[13px] font-semibold text-fg">{busy?'查询中…':'查询原操作'}</Text></Pressable></View> : null}
        {draft.phase==='accepted' && draft.receipt ? <View className="mx-5 mt-5 gap-2"><Text className="text-[13px] font-semibold text-fg">已收到发布回执</Text>
          <Text className="text-[12px] text-secondary">审核：{reviewLabels[draft.receipt.review_state]} · 发布：{publicationLabels[draft.receipt.publication_state]}</Text>
          <Text selectable className="text-[11px] text-secondary">操作号：{draft.operationId}</Text></View> : null}
      </ScrollView>
      <View className="border-t border-line px-4 pb-2 pt-2">
        {openChoice==='visibility'?<View className="flex-row flex-wrap gap-2 pb-2">{(['public','followers','self'] as const).map(value=>
          <Choice key={value} value={value} label={visibilityLabels[value]} selected={draft.visibility===value}
            onPress={visibility=>{edit({visibility});setOpenChoice(null);}} />)}</View>:null}
        {openChoice==='reply'?<View className="flex-row flex-wrap gap-2 pb-2">{(['all_readers','author_follows','closed'] as const).map(value=>
          <Choice key={value} value={value} label={replyLabels[value]} selected={draft.replyScope===value}
            onPress={replyScope=>{if(replyScope==='all_readers')edit({replyScope});
              else setMessage('当前只支持所有有权阅读者回复；此范围暂未开放');setOpenChoice(null);}} />)}</View>:null}
        <View className="flex-row items-center gap-2">
          <Pressable accessibilityRole="button" accessibilityLabel="选择可见范围" onPress={()=>setOpenChoice(openChoice==='visibility'?null:'visibility')}
            className="min-h-10 flex-row items-center gap-1 rounded-[20px] px-2"><PrototypeIcon name="globe" size={17} color={colors.secondary}/>
            <Text className="text-[11px] text-secondary">{visibilityLabels[draft.visibility]}⌄</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="选择谁可以回复" onPress={()=>setOpenChoice(openChoice==='reply'?null:'reply')}
            className="min-h-10 flex-row items-center gap-1 rounded-[20px] px-2"><PrototypeIcon name="chat" size={17} color={colors.secondary}/>
            <Text className="text-[11px] text-secondary">{replyLabels[draft.replyScope]}⌄</Text></Pressable>
        </View>
        <View className="flex-row items-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1" contentContainerStyle={{alignItems:'center',gap:2}}>
          <Pressable accessibilityRole="button" accessibilityLabel="添加图片" accessibilityState={{disabled:busy || draft.phase==='unknown' || draft.phase==='accepted' || draft.images.length>=9}}
            disabled={busy || draft.phase==='unknown' || draft.phase==='accepted' || draft.images.length>=9} onPress={()=>void pickImages()}
            className="min-h-11 min-w-11 items-center justify-center"><PrototypeIcon name="image" size={21} color={colors.accent}/></Pressable>
          {(['video','gif','poll','link','ai','plus'] as const).map(icon=><Pressable key={icon} accessibilityRole="button"
            accessibilityLabel={{video:'视频暂未开放',gif:'GIF 暂未开放',poll:'投票暂未开放',link:'链接预览暂未开放',ai:'AI 设置暂未开放',plus:'帖子串暂未开放'}[icon]}
            onPress={()=>setMessage('这项发布能力尚未开放；当前支持文字和 JPEG / PNG 图片。')}
            className="min-h-11 min-w-11 items-center justify-center"><PrototypeIcon name={icon} size={21} color={colors.accent}/></Pressable>)}
          </ScrollView>
          <Text className={`pl-2 text-[11px] ${count>2000?'text-error':'text-secondary'}`}>{count}/2000</Text>
        </View>
      </View>
    </>}
  </AppFrame>;
}
