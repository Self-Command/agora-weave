import { useCallback,useEffect,useRef,useState } from 'react';
import { BackHandler,ScrollView,Text,TextInput,View,useColorScheme } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { countVisibleCharacters } from '../../../../../packages/contracts/src/graphemes';
import { AppButton,AppFrame,PageStatus } from '../../components/AppChrome';
import { AppMediaField } from '../../components/AppMediaField';
import { profileApi,ProfileError,validProfile,type ProfilePatch } from './api';
import { accountApi,AccountError } from '../account/api';
import { currentProfileSession } from './session';
import { blankProfileDraft,initialProfileDraft,readProfileDraft,saveProfileDraft,type ProfileEditDraft } from './edit-store';
import { guestMediaUrl } from '../feed/api';
import { keepSelectedImage,discardLocalImage,uploadApi,UploadError,type UploadImage } from '../publishing/image-upload';

const api=profileApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
type LoadState='loading'|'guest'|'ready'|'error';
export function ProfileEditPage() {
  const router=useRouter(),colors=themeFor(useColorScheme());
  const [status,setStatus]=useState<LoadState>('loading'),[draft,setDraft]=useState<ProfileEditDraft|null>(null);
  const [error,setError]=useState(''),[errorCode,setErrorCode]=useState(''),[saveError,setSaveError]=useState(''),[busy,setBusy]=useState(false);
  const [avatar,setAvatar]=useState<UploadImage|null>(null),[avatarRef,setAvatarRef]=useState<string|null>(null);
  const [background,setBackground]=useState<UploadImage|null>(null),[backgroundRef,setBackgroundRef]=useState<string|null>(null);
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setStatus('loading');setError('');setErrorCode('');setAvatar(null);setAvatarRef(null);setBackground(null);setBackgroundRef(null);
    try {
      const current=await currentProfileSession();
      if(generation.current!==ticket)return;
      if(!current){setStatus('guest');return;}
      const saved=await readProfileDraft(current.accountId);
      if(generation.current!==ticket)return;
      if(saved?.avatar)setAvatar(saved.avatar.phase==='uploading'?{...saved.avatar,phase:'unknown'}:saved.avatar);
      if(saved?.background)setBackground(saved.background.phase==='uploading'?{...saved.background,phase:'unknown'}:saved.background);
      let profile;
      try{profile=await api.get(current.accountId,current.session.access_token);}
      catch(failure){
        if(generation.current!==ticket)return;
        if(saved && saved.phase!=='accepted'){
          setDraft(saved);setStatus('ready');setError(failure instanceof Error?failure.message:'最新资料暂时无法读取');
          setErrorCode(failure instanceof ProfileError?failure.code:'SERVICE_UNAVAILABLE');return;
        }
        if(failure instanceof ProfileError && failure.code==='NOT_FOUND'){
          setDraft(blankProfileDraft(current.accountId,randomUUID()));setStatus('ready');return;
        }
        throw failure;
      }
      if(generation.current!==ticket)return;
      setDraft(saved && saved.phase!=='accepted'?saved:initialProfileDraft(profile,randomUUID()));
      setAvatarRef(profile.avatar_media_ref);
      setBackgroundRef(profile.background_media_ref);
      setStatus('ready');
    }catch(failure){if(generation.current===ticket){setStatus('error');setError(failure instanceof Error?failure.message:'资料暂时无法读取');
      setErrorCode(failure instanceof ProfileError?failure.code:'SERVICE_UNAVAILABLE');}}
  },[]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  useEffect(()=>{
    if(status!=='ready' || !draft || busy || draft.phase==='accepted')return;
    const timer=setTimeout(()=>{void saveProfileDraft(draft).then(()=>setSaveError('')).catch(()=>setSaveError('本机编辑内容保存失败，请勿关闭页面'));},350);
    return()=>clearTimeout(timer);
  },[status,draft,busy]);
  const close=async()=>{
    if(busy)return;
    if(draft && status==='ready'){
      try{await saveProfileDraft({...draft,avatar,background});setSaveError('');}catch{setSaveError('本机编辑内容保存失败，请勿关闭页面');return;}
    }
    router.back();
  };
  useEffect(()=>{const back=BackHandler.addEventListener('hardwareBackPress',()=>{void close();return true;});return()=>back.remove();});
  const edit=(field:'nickname'|'username'|'bio',value:string)=>{
    if(!draft || busy || draft.phase==='unknown' || draft.phase==='accepted')return;
    setDraft({...draft,[field]:value,operationId:randomUUID(),phase:'editing'});
    setError('');setErrorCode('');
  };
  const changed=!!draft && (draft.nickname!==draft.original.nickname || draft.username!==draft.original.username || draft.bio!==draft.original.bio || !!avatar || !!background);
  const pickAvatar=async()=>{
    if(!draft || busy || draft.phase==='unknown' || draft.phase==='accepted')return;
    try {
      const picker=await import('expo-image-picker');
      const selected=await picker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:1});
      if(selected.canceled || !selected.assets[0])return;
      const next=await keepSelectedImage(selected.assets[0].uri);
      await saveProfileDraft({...draft,avatar:next});
      if(avatar)discardLocalImage(avatar);
      setAvatar(next);setDraft({...draft,avatar:next});setError('');setErrorCode('');
    }catch(failure){setError(failure instanceof Error?failure.message:'头像无法读取，请重新选择');}
  };
  const pickBackground=async()=>{
    if(!draft || busy || draft.phase==='unknown' || draft.phase==='accepted')return;
    try{
      const picker=await import('expo-image-picker');
      const selected=await picker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[3,1],quality:1});
      if(selected.canceled || !selected.assets[0])return;
      const next=await keepSelectedImage(selected.assets[0].uri);
      await saveProfileDraft({...draft,avatar,background:next});
      if(background)discardLocalImage(background);
      setBackground(next);setDraft({...draft,avatar,background:next});setError('');setErrorCode('');
    }catch(failure){setError(failure instanceof Error?failure.message:'背景图片无法读取，请重新选择');}
  };
  const save=async()=>{
    if(!draft || !changed || busy || draft.phase==='unknown' || draft.phase==='accepted' || draft.phase==='conflict')return;
    if(!draft.nickname.trim()){setError('昵称不能为空');return;}
    if(!/^[\x21-\x7e]{3,30}$/.test(draft.username)){setError('用户名须为 3–30 位 ASCII 字符，具体可用性由服务端确认');return;}
    setBusy(true);setError('');setErrorCode('');
    let activeAvatar=avatar,activeBackground=background;
    try {
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.accountId){setError('登录账号已变化，输入已保留');return;}
      const uploadProfileMedia=async(kind:'avatar'|'background',selected:UploadImage):Promise<string>=>{
        const uploads=uploadApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__,'profile');
        let image=selected;
        const update=async(patch:Partial<UploadImage>)=>{
          image={...image,...patch};
          if(kind==='avatar'){activeAvatar=image;setAvatar(image);}
          else{activeBackground=image;setBackground(image);}
          await saveProfileDraft({...draft,avatar:activeAvatar,background:activeBackground});
          setDraft(current=>current?{...current,avatar:activeAvatar,background:activeBackground}:current);
        };
        if(!image.uploadId){
          await update({phase:'uploading',step:'create'});
          const allocated=await uploads.create(current.session.access_token,image);
          await update({uploadId:allocated.id,mediaId:allocated.media_id,uploadedParts:allocated.uploaded_parts,
            phase:allocated.state==='validated'?'ready':'selected',step:null});
        }
        if(!image.uploadedParts.includes(0)){
          await update({phase:'uploading',step:'part'});
          const part=await uploads.part(current.session.access_token,image);
          await update({uploadedParts:part.uploaded_parts,phase:'selected',step:null});
        }
        if(image.phase!=='ready'){
          await update({phase:'uploading',step:'complete'});
          const complete=await uploads.complete(current.session.access_token,image);
          if(complete.state!=='validated')throw new UploadError('INVALID_STATE','图片未通过校验，请重新选择');
          await update({phase:'ready',step:null,mediaId:complete.media_id,uploadedParts:complete.uploaded_parts});
        }
        if(!image.mediaId)throw new UploadError('INVALID_STATE','图片上传回执不完整');
        return image.mediaId;
      };
      const uploadedAvatar=avatar?await uploadProfileMedia('avatar',avatar):undefined;
      const uploadedBackground=background?await uploadProfileMedia('background',background):undefined;
      const firstProfile=!draft.original.nickname && !draft.original.username && draft.baseVersion===1;
      const patch:ProfilePatch={operation_id:draft.operationId,base_version:draft.baseVersion,
        ...(firstProfile || draft.nickname!==draft.original.nickname?{nickname:draft.nickname}:{}),
        ...(firstProfile || draft.username!==draft.original.username?{username:draft.username}:{}),
        ...(draft.bio!==draft.original.bio?{bio:draft.bio}:{}),
        ...(uploadedAvatar?{avatar_media_ref:uploadedAvatar}:{}),
        ...(uploadedBackground?{background_media_ref:uploadedBackground}:{})};
      const pending:ProfileEditDraft={...draft,avatar:activeAvatar,background:activeBackground,phase:'unknown'};
      await saveProfileDraft(pending);setDraft(pending);
      const result=await api.update(draft.accountId,current.session.access_token,patch);
      const accepted=initialProfileDraft(result,randomUUID());accepted.phase='accepted';
      await saveProfileDraft(accepted);setDraft(accepted);setError('资料已按服务端回执保存');
      setAvatarRef(result.avatar_media_ref);setBackgroundRef(result.background_media_ref);
      if(activeAvatar)discardLocalImage(activeAvatar);if(activeBackground)discardLocalImage(activeBackground);
      setAvatar(null);setBackground(null);
    }catch(failure){
      if(failure instanceof ProfileError){
        const next:ProfileEditDraft={...draft,avatar:activeAvatar,background:activeBackground,
          phase:failure.uncertain?'unknown':failure.code==='CONFLICT'?'conflict':'editing'};
        setDraft(next);setError(failure.message);setErrorCode(failure.code);
        try{await saveProfileDraft(next);setSaveError('');}catch{setSaveError('本机编辑内容保存失败，请勿关闭页面');}
      }else if(failure instanceof UploadError){
        setError(failure.message);setErrorCode(failure.code);
        setSaveError(failure.unknown?'图片上传结果待确认；同一操作号可安全重试':'图片上传未完成，输入已保留');
      }else {setError(failure instanceof Error?failure.message:'资料暂时无法保存');setSaveError('本机编辑内容可能未保存，请勿关闭页面');}
    }finally{setBusy(false);}
  };
  const rebase=async()=>{
    if(!draft || busy || draft.phase!=='conflict')return;
    setBusy(true);setError('');
    try {
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.accountId)throw new Error('账号已变化，不能重新加载此资料');
      const latest=await api.get(draft.accountId,current.session.access_token);
      const next:ProfileEditDraft={...draft,baseVersion:latest.row_version,operationId:randomUUID(),phase:'editing',
        original:{nickname:latest.nickname,username:latest.username,bio:latest.bio}};
      await saveProfileDraft(next);setDraft(next);setError('已读取最新版本，输入仍保留；请检查后再保存');setErrorCode('');
    }catch(failure){setError(failure instanceof Error?failure.message:'最新资料暂时无法读取');}
    finally{setBusy(false);}
  };
  const queryOriginal=async()=>{
    if(!draft || busy || draft.phase!=='unknown')return;
    setBusy(true);setError('正在查询原操作…');
    try{
      const current=await currentProfileSession();
      if(!current || current.accountId!==draft.accountId){setError('登录账号已变化，请使用原账号查询');return;}
      const operation=await accounts.operation(current.session.access_token,draft.operationId);
      if(operation.operation_id!==draft.operationId || operation.action!=='profile.update'){
        setError('查询结果与原资料操作不匹配，输入和操作号已保留');return;
      }
      if(operation.state==='succeeded'){
        if(!validProfile(operation.result,draft.accountId)){
          setError('原操作已记录，但保存回执不完整；请稍后再查');return;
        }
        const accepted=initialProfileDraft(operation.result,randomUUID());accepted.phase='accepted';
        await saveProfileDraft(accepted);setDraft(accepted);setError('原操作已确认保存');setErrorCode('');
      }else if(operation.state==='failed'){
        const failed:ProfileEditDraft={...draft,operationId:randomUUID(),phase:'editing'};
        await saveProfileDraft(failed);setDraft(failed);setError('原操作确认失败，输入已保留；请检查后重新保存');setErrorCode('');
      }else setError('原操作仍待确认，输入和操作号已保留；请稍后再查');
    }catch(failure){
      setError(failure instanceof AccountError && failure.code==='SESSION_INVALID'?'登录已失效，请重新登录后查询原操作':
        '暂时无法确认原操作，输入和操作号已保留；请稍后再查');
    }finally{setBusy(false);}
  };
  const locked=draft?.phase==='unknown' || draft?.phase==='accepted';
  return <AppFrame title="编辑个人资料" onBack={()=>void close()}>
    {status==='loading' ? <PageStatus kind="loading" message="正在读取资料…"/> :
      status==='guest' ? <PageStatus kind="guest" message="登录后编辑资料" actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/> :
      status==='error' ? <PageStatus kind="error" message={`${errorCode==='FORBIDDEN'?'无权编辑资料':errorCode==='NOT_FOUND'?'资料不可用':errorCode==='SERVICE_UNAVAILABLE'?'资料服务不可用':'资料加载失败'}：${error}`}
        actionLabel="重试" onAction={()=>void load()}/> : draft ? <>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:132}}>
        <View className="gap-[21px] px-5 pt-6">
          <AppMediaField shape="avatar" label="头像" uri={avatar?.uri || (avatarRef?guestMediaUrl(avatarRef,process.env.EXPO_PUBLIC_API_URL,__DEV__):null)}
            initial={draft.nickname} disabled={busy||locked} onPick={()=>void pickAvatar()}/>
          <AppMediaField shape="banner" label="主页背景" uri={background?.uri || (backgroundRef?guestMediaUrl(backgroundRef,process.env.EXPO_PUBLIC_API_URL,__DEV__):null)}
            disabled={busy||locked} onPick={()=>void pickBackground()}/>
          <Text className="text-[13px] leading-6 text-secondary">修改后由服务端检查用户名唯一性、改名间隔和当前资料版本。</Text>
          <View><Text className="mb-2 text-[12px] font-medium text-secondary">昵称</Text>
            <TextInput accessibilityLabel="昵称" value={draft.nickname} onChangeText={value=>edit('nickname',value)} editable={!busy&&!locked}
              className="min-h-12 rounded-xl border border-line bg-surface px-4 text-[14px] leading-6 text-fg" placeholderTextColor={colors.secondary} /></View>
          <View><Text className="mb-2 text-[12px] font-medium text-secondary">用户名</Text>
            <TextInput accessibilityLabel="用户名" value={draft.username} onChangeText={value=>edit('username',value)} editable={!busy&&!locked}
              autoCapitalize="none" autoCorrect={false} className="min-h-12 rounded-xl border border-line bg-surface px-4 text-[14px] leading-6 text-fg" placeholderTextColor={colors.secondary} />
            <Text className="mt-2 text-[11px] text-secondary">3–30 位；是否可用以保存时服务端结果为准。</Text></View>
          <View><Text className="mb-2 text-[12px] font-medium text-secondary">个人简介</Text>
            <TextInput accessibilityLabel="个人简介" value={draft.bio} onChangeText={value=>edit('bio',value)} editable={!busy&&!locked} multiline textAlignVertical="top"
              className="min-h-32 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] leading-6 text-fg" placeholderTextColor={colors.secondary} />
            <Text className="mt-2 text-right text-[11px] text-secondary">{countVisibleCharacters(draft.bio)} 字</Text></View>
          {draft.phase==='unknown' ? <View className="gap-2 rounded-xl bg-surface p-4"><Text className="text-[13px] font-semibold text-fg">保存结果待确认</Text>
            <Text className="text-[12px] leading-5 text-secondary">操作号与输入已保留。先查询原操作，确认前不能重复保存。</Text>
            <AppButton label="查询原操作" compact busy={busy} onPress={()=>void queryOriginal()}/>
            <Text selectable className="text-[11px] text-secondary">{draft.operationId}</Text></View> : null}
          {draft.phase==='conflict' ? <AppButton label="读取最新资料并保留输入" busy={busy} onPress={()=>void rebase()}/> : null}
          {error ? <Text accessibilityRole="alert" className={`text-[13px] leading-6 ${draft.phase==='accepted'?'text-fg':'text-error'}`}>{error}</Text> : null}
          {saveError ? <Text accessibilityRole="alert" className="text-[12px] text-error">{saveError}</Text> : null}
        </View>
      </ScrollView>
      <View className="border-t border-line px-5 py-3"><AppButton label="保存资料" tone="primary" busy={busy}
        disabled={locked||!changed||draft.phase==='conflict'} onPress={()=>void save()}/></View>
    </> : null}
  </AppFrame>;
}
