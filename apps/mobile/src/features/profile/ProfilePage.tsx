import { useCallback,useEffect,useRef,useState } from 'react';
import { ActivityIndicator,Image,Pressable,ScrollView,Text,View,useColorScheme } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { AppButton,AppFrame,PageStatus } from '../../components/AppChrome';
import { profileApi,ProfileError,type Profile } from './api';
import { currentProfileSession } from './session';
import {PrototypeIcon,type PrototypeIconName} from '../shell/PrototypeIcon';
import {guestMediaUrl} from '../feed/api';
import {profileContentsApi,type ProfilePost} from './contents-api';
import {blockApi} from './blocks-api';
import {PostCard} from '../feed/PostCard';

const api=profileApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const contentsApi=profileContentsApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const block=blockApi(process.env.EXPO_PUBLIC_API_URL,Constants.expoConfig?.version || '0.0.0',__DEV__);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const sections=[['posts','帖子'],['replies','回复'],['reposts','转发'],['media','媒体']] as const;
const sectionIcons:Record<typeof sections[number][0],PrototypeIconName>={posts:'posts',replies:'chat',reposts:'repost',media:'image'};
type Section=typeof sections[number][0];
type PageState={status:'loading'|'guest'|'ready'|'error';profile:Profile|null;own:boolean;code:string;message:string};
const initial:PageState={status:'loading',profile:null,own:false,code:'',message:''};

export function ProfilePage({ accountId,embedded=false,onSocial }: { accountId?:string;embedded?:boolean;onSocial?:()=>void }) {
  const router=useRouter(),colors=themeFor(useColorScheme());
  const [state,setState]=useState<PageState>(initial);
  const [section,setSection]=useState<Section>('posts');
  const [actionNotice,setActionNotice]=useState('');
  const [blockBusy,setBlockBusy]=useState(false);
  const [failedMedia,setFailedMedia]=useState<string[]>([]);
  const [contents,setContents]=useState<ProfilePost[]>([]),[contentsCursor,setContentsCursor]=useState<string|null>(null);
  const [contentsEpoch,setContentsEpoch]=useState(0);
  const [mediaToken,setMediaToken]=useState<string|null>(null);
  const [contentsMore,setContentsMore]=useState(false),[contentsState,setContentsState]=useState<'loading'|'ready'|'error'>('loading');
  const [contentsError,setContentsError]=useState('');
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const ticket=++generation.current;
    setState(initial);
    setFailedMedia([]);
    try {
      const current=await currentProfileSession();
      if(generation.current!==ticket)return;
      if(!accountId && !current){setState({...initial,status:'guest'});return;}
      const target=accountId || current!.accountId;
      if(!uuid.test(target)){setState({...initial,status:'error',code:'INVALID_INPUT',message:'资料地址无效'});return;}
      const profile=await api.get(target,current?.session.access_token);
      if(generation.current!==ticket)return;
      setState({status:'ready',profile,own:!!current && current.accountId===target,code:'',message:''});
    }catch(error){if(generation.current===ticket)setState({...initial,status:'error',own:!accountId,code:error instanceof ProfileError?error.code:'SERVICE_UNAVAILABLE',
      message:error instanceof Error?error.message:'资料暂时无法加载'});}
  },[accountId]);
  useFocusEffect(useCallback(()=>{void load();return()=>{generation.current++;};},[load]));
  useEffect(()=>{
    const id=state.profile?.account_id;
    if(!id || !['posts','media'].includes(section))return;
    let active=true;
    setContents([]);setContentsCursor(null);setContentsMore(false);setContentsState('loading');setContentsError('');
    void currentProfileSession().then(current=>{if(active)setMediaToken(current?.session.access_token||null);
      return contentsApi(id,section as 'posts'|'media',current?.session.access_token);})
      .then(page=>{if(active){setContents(page.items);setContentsCursor(page.next_cursor);setContentsMore(page.has_more);setContentsState('ready');}})
      .catch(error=>{if(active){setContentsState('error');setContentsError(error instanceof Error?error.message:'内容暂时无法加载');}});
    return()=>{active=false;};
  },[state.profile?.account_id,section,contentsEpoch]);
  const loadMore=async()=>{
    if(!state.profile || !contentsMore || !contentsCursor || contentsState==='loading' || !['posts','media'].includes(section))return;
    setContentsState('loading');
    try{
      const current=await currentProfileSession();
      const page=await contentsApi(state.profile.account_id,section as 'posts'|'media',current?.session.access_token,contentsCursor);
      setContents(items=>[...items,...page.items.filter(item=>!items.some(existing=>existing.id===item.id))]);
      setContentsCursor(page.next_cursor);setContentsMore(page.has_more);setContentsState('ready');setContentsError('');
    }catch(error){setContentsState('error');setContentsError(error instanceof Error?error.message:'更多内容暂时无法加载');}
  };
  const profile=state.profile;
  const blockThis=async()=>{
    if(!profile||blockBusy)return;
    setBlockBusy(true);setActionNotice('');
    try{setActionNotice(await block(profile.account_id));await load();}
    catch(error){setActionNotice(error instanceof Error?error.message:'拉黑操作暂时不可用');}
    finally{setBlockBusy(false);}
  };
  const avatarUrl=profile?.avatar_media_ref && !failedMedia.includes(profile.avatar_media_ref)
    ? guestMediaUrl(profile.avatar_media_ref,process.env.EXPO_PUBLIC_API_URL,__DEV__) : null;
  const backgroundUrl=profile?.background_media_ref && !failedMedia.includes(profile.background_media_ref)
    ? guestMediaUrl(profile.background_media_ref,process.env.EXPO_PUBLIC_API_URL,__DEV__) : null;
  return <AppFrame title="个人主页" embedded={embedded} hideHeader={embedded}
    onBack={()=>router.back()} onRefresh={()=>void load()}>
    {state.status==='loading' ? <PageStatus kind="loading" message="正在加载资料…"/> :
      state.status==='guest' ? <PageStatus kind="guest" message="登录后查看我的资料。公开用户资料可从帖子作者入口打开。"
        actionLabel="进入账号" onAction={()=>router.push('/(auth)')}/> : state.status==='error' ? <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text accessibilityRole="header" className="text-[19px] font-semibold text-fg">{state.code==='FORBIDDEN'?'无权查看资料':
          state.code==='NOT_FOUND'&&state.own?'尚未设置资料':state.code==='NOT_FOUND'?'资料不可用':state.code==='CONFLICT'?'资料状态已变化':state.code==='SERVICE_UNAVAILABLE'?'资料服务不可用':'资料加载失败'}</Text>
        <Text accessibilityRole="alert" className="text-center text-[13px] leading-6 text-secondary">{state.message}</Text>
        <AppButton label="重试" onPress={()=>void load()}/>
        {state.code==='NOT_FOUND'&&state.own?<AppButton label="设置资料" tone="primary" onPress={()=>router.push('/me/edit')}/>:null}
        {state.code==='SESSION_INVALID' ? <AppButton label="重新登录" tone="text" onPress={()=>router.push('/(auth)')}/> : null}
      </View> : profile ? <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:40}}>
        <View className="h-[132px] overflow-hidden bg-surface" accessibilityLabel={backgroundUrl?'个人背景图片':'未设置背景图片'}>
          {backgroundUrl?<Image source={{uri:backgroundUrl}} resizeMode="cover" style={{width:'100%',height:'100%'}}
            onError={()=>setFailedMedia(current=>[...current,profile.background_media_ref!])}/> : <>
            <View className="absolute -top-36 -right-16 h-72 w-72 rounded-full border border-line" />
            <View className="absolute -top-[118px] -right-9 h-60 w-60 rounded-full border border-line" />
            <View className="absolute top-8 left-7 h-36 w-36 rounded-full border border-line" />
            <View className="absolute top-[106px] -left-5 h-24 border-t border-line"
              style={{width:'120%',transform:[{rotate:'-13deg'}],backgroundColor:colors.bg,opacity:0.6}} />
          </>}
        </View>
        <View className="px-[19px] pb-[17px]">
          <View className="mt-4 min-h-[80px] flex-row items-start justify-between">
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-bg bg-surface"
              accessibilityLabel={avatarUrl?'个人头像图片':'未设置头像图片'}>
              {avatarUrl?<Image source={{uri:avatarUrl}} resizeMode="cover" style={{width:'100%',height:'100%'}}
                onError={()=>setFailedMedia(current=>[...current,profile.avatar_media_ref!])}/>:
                <Text className="text-[27px] font-semibold text-secondary">{profile.nickname.slice(0,1) || '人'}</Text>}
            </View>
            <View className="mt-3 flex-row items-center gap-1">
              {state.own ? <>
                <Pressable accessibilityRole="button" accessibilityLabel="编辑个人资料" onPress={()=>router.push('/me/edit')}
                  className="min-h-12 min-w-12 items-center justify-center rounded-full border border-line"><PrototypeIcon name="edit" size={18} color={colors.fg}/></Pressable>
              </> : <>
                <Pressable accessibilityRole="button" accessibilityLabel="关注用户" onPress={()=>setActionNotice('关注暂时不可用')}
                  className="min-h-12 justify-center rounded-[24px] bg-fg px-5"><Text className="text-[13px] font-semibold text-bg">关注</Text></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="发送私信" onPress={()=>setActionNotice('私信暂时不可用')}
                  className="min-h-12 min-w-12 items-center justify-center rounded-full border border-line"><PrototypeIcon name="chat" size={18} color={colors.fg}/></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="拉黑此账号" accessibilityState={{disabled:blockBusy}}
                  disabled={blockBusy} onPress={()=>void blockThis()}
                  className="min-h-12 min-w-12 items-center justify-center rounded-full border border-line"><PrototypeIcon name="block" size={18} color={colors.fg}/></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="举报此账号" onPress={()=>router.push({pathname:'/report',params:{kind:'account',id:profile.account_id}})}
                  className="min-h-12 min-w-12 items-center justify-center rounded-full border border-line"><PrototypeIcon name="more" size={18} color={colors.fg}/></Pressable>
              </>}
            </View>
          </View>
          <Text className="mt-3 text-[23px] font-semibold leading-8 text-fg">{profile.nickname || '未设置昵称'}</Text>
          <Text className="mt-0.5 text-[12px] text-secondary">@{profile.username}</Text>
          {profile.bio ? <Text className="mt-[13px] text-[13px] leading-6 text-fg">{profile.bio}</Text> :
            <Text className="mt-[13px] text-[13px] text-secondary">暂无简介</Text>}
          <Text className="mt-[11px] text-[12px] text-secondary">{profile.registered_at.slice(0,10)} 加入</Text>
          <View className="mt-[10px] flex-row gap-[21px]">
            <Pressable accessibilityRole="button" accessibilityLabel="查看关注" onPress={onSocial || (()=>setActionNotice('关注列表暂时不可用'))}
              className="min-h-11 justify-center"><Text className="text-[13px] text-fg"><Text className="font-semibold">{profile.following_count}</Text> 关注</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="查看粉丝" onPress={onSocial || (()=>setActionNotice('粉丝列表暂时不可用'))}
              className="min-h-11 justify-center"><Text className="text-[13px] text-fg"><Text className="font-semibold">{profile.followers_count}</Text> 粉丝</Text></Pressable>
          </View>
          {actionNotice?<Pressable accessibilityRole="button" accessibilityLabel="关闭提示" onPress={()=>setActionNotice('')}
            className="mt-2 min-h-9 justify-center"><Text accessibilityRole="alert" className="text-[12px] text-secondary">{actionNotice}</Text></Pressable>:null}
        </View>
        <View accessibilityRole="tablist" accessibilityLabel="个人内容分类" className="h-[49px] flex-row border-y border-line">
          {sections.map(([id,label])=><Pressable key={id} accessibilityRole="tab" accessibilityState={{selected:section===id}}
            accessibilityLabel={label} onPress={()=>setSection(id)} className="min-h-12 flex-1 flex-row items-center justify-center gap-1">
            <PrototypeIcon name={sectionIcons[id]} size={18} color={section===id?colors.fg:colors.secondary}/>
            <Text className={`text-[11px] ${section===id?'font-semibold text-fg':'text-secondary'}`}>{label}</Text>
            {section===id?<View className="absolute bottom-0 h-[2px] w-[34px] rounded-full bg-fg" />:null}
          </Pressable>)}
        </View>
        {section==='posts'||section==='media'?<View className="py-4">
          {contents.map(post=><PostCard key={post.id} post={{id:post.id,author_id:post.author_id,
            body:post.body,type:post.type,created_at:post.created_at,media_refs:post.media.map(media=>media.media_id)}}
            authorProfile={profile} mediaToken={mediaToken}
            onOpen={()=>router.push({pathname:'/posts/[postId]',params:{postId:post.id}})}
            onAuthor={()=>router.push({pathname:'/profile/[accountId]',params:{accountId:post.author_id}})}
            onUnavailable={name=>setActionNotice(`${name}暂时不可用`)}
            onNotice={setActionNotice}/>)}
          {contentsState==='loading'?<View className="items-center gap-2 py-7"><ActivityIndicator color={colors.accent}/>
            <Text className="text-[12px] text-secondary">正在加载内容…</Text></View>:null}
          {contentsState==='error'?<Pressable accessibilityRole="button" onPress={()=>contentsCursor?void loadMore():setContentsEpoch(value=>value+1)} className="items-center py-6">
            <Text accessibilityRole="alert" className="text-[12px] text-secondary">{contentsError}，点此重试</Text></Pressable>:null}
          {contentsState==='ready'&&!contents.length?<View className="items-center gap-2 py-12">
            <Text className="text-[16px] font-semibold text-fg">暂无{labelFor(section)}</Text>
            <Text className="text-[12px] text-secondary">审核通过且当前可见的内容会显示在这里。</Text></View>:null}
          {contentsState==='ready'&&contentsMore?<View className="items-center py-4"><AppButton label="加载更多" tone="text" onPress={()=>void loadMore()}/></View>:null}
        </View>:<View className="items-center gap-2 px-6 py-12">
          <Text className="text-[16px] font-semibold text-fg">{labelFor(section)}暂不可查看</Text>
          <Text className="text-center text-[13px] leading-6 text-secondary">该分类将在后续版本接入。</Text>
        </View>}
      </ScrollView> : null}
  </AppFrame>;
}

function labelFor(section:Section){return sections.find(([id])=>id===section)![1];}
