import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {ActivityIndicator,AppState,FlatList,Pressable,RefreshControl,ScrollView,Text,View,useColorScheme} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useRouter} from 'expo-router';
import Constants from 'expo-constants';
import {themeFor} from '../../../../../packages/design/src/tokens';
import {profileApi,type Profile} from '../profile/api';
import {currentProfileSession} from '../profile/session';
import {blockApi} from '../profile/blocks-api';
import {ProfilePage} from '../profile/ProfilePage';
import {guestFeedApi,guestMediaUrl} from './api';
import {PostCard} from './PostCard';
import {createGuestFeedController} from './feed-controller';
import {CommentsPanel,ReplyDock,type ReplyTarget} from './CommentsPanel';
import {AccountDrawer,AiSection,DiscoverSection,MessagesSection,NotificationsSection} from '../shell/MainSections';
import {Avatar,AppEmpty as EmptyRegion,IconTap} from '../../components/AppChrome';
import {BottomTabs,ShellHeader,type MainTab} from '../shell/ShellUI';
import {PrototypeIcon} from '../shell/PrototypeIcon';
import {SecondarySurface,type SecondaryKind} from '../shell/SecondarySurfaces';

type FeedController=ReturnType<typeof createGuestFeedController>;
const release=Constants.expoConfig?.version || '0.0.0';
const profiles=profileApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const block=blockApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);

function FeedTabs({active,onChange}:{active:'推荐'|'关注'|'最新';onChange:(value:'推荐'|'关注'|'最新')=>void}) {
  const colors=themeFor(useColorScheme());
  return <View style={{height:47,flexDirection:'row',borderBottomWidth:1,borderBottomColor:colors.line}}>
    {(['推荐','关注','最新'] as const).map(value=><Pressable key={value} accessibilityRole="tab" accessibilityLabel={value}
      accessibilityState={{selected:active===value}} onPress={()=>onChange(value)} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:14,fontWeight:active===value?'600':'400',color:active===value?colors.fg:colors.secondary}}>{value}</Text>
      {active===value?<View style={{position:'absolute',bottom:0,width:25,height:3,borderRadius:3,backgroundColor:colors.fg}}/>:null}
    </Pressable>)}</View>;
}

function Detail({controller,onUnavailable,onNotice,mediaToken}:{controller:FeedController;onUnavailable:(name:string)=>void;onNotice:(message:string)=>void;mediaToken:string|null}) {
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot);
  const colors=themeFor(useColorScheme()),router=useRouter();
  const scroll=useRef<ScrollView>(null),commentsTop=useRef(0);
  const [refreshKey,setRefreshKey]=useState(0),[replyTarget,setReplyTarget]=useState<ReplyTarget|null>(null);
  const item=state.detail;
  const published=state.items.find(post=>post.id===item?.id)?.created_at;
  return <View style={{flex:1}}>
    {state.detailLoading?<View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator color={colors.accent}/><Text style={{color:colors.secondary,marginTop:12}}>正在读取帖子…</Text></View>:
      state.detailError?<EmptyRegion icon="posts" title={state.detailErrorCode==='NOT_FOUND'?'帖子不可用':'帖子加载失败'} description={state.detailError}
        action={state.detailErrorCode==='NOT_FOUND'?undefined:{label:'重试',onPress:()=>void controller.openPost(state.detailId!)}}/>:
      item?<ScrollView ref={scroll} style={{flex:1}} keyboardShouldPersistTaps="handled">
        <PostCard key={item.id} post={{...item,...(published?{created_at:published}:{})}} selectable mediaToken={mediaToken}
          onAuthor={()=>router.push({pathname:'/profile/[accountId]',params:{accountId:item.author_id}})}
          onComment={()=>{setReplyTarget(null);scroll.current?.scrollTo({y:commentsTop.current,animated:true});}}
          onUnavailable={onUnavailable} onNotice={onNotice}/>
        <View onLayout={event=>{commentsTop.current=event.nativeEvent.layout.y;}}>
          <CommentsPanel postId={item.id} refreshKey={refreshKey} onReplyTarget={setReplyTarget}/>
        </View>
      </ScrollView>:null}
    {item?<ReplyDock postId={item.id} target={replyTarget} onClearTarget={()=>setReplyTarget(null)}
      onSubmitted={()=>setRefreshKey(key=>key+1)}/>:null}
  </View>;
}

function ConnectedFeed({controller,standalone=false}:{controller:FeedController;standalone?:boolean}) {
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot);
  const colors=themeFor(useColorScheme()),router=useRouter();
  const [tab,setTab]=useState<MainTab>('home'),[feedTab,setFeedTab]=useState<'推荐'|'关注'|'最新'>('最新');
  const [drawer,setDrawer]=useState(false),[notifications,setNotifications]=useState(false),[notice,setNotice]=useState('');
  const [secondary,setSecondary]=useState<SecondaryKind[]>([]);
  const [aiEpoch,setAiEpoch]=useState(0),[dmFilter,setDmFilter]=useState<'全部'|'未读'>('全部');
  const [self,setSelf]=useState<Profile|null>(null);
  const [mediaToken,setMediaToken]=useState<string|null>(null);
  useFocusEffect(useCallback(()=>{let active=true;
    const currentPost=controller.getSnapshot().detailId;
    if(currentPost)void controller.openPost(currentPost);else void controller.refresh();
    void currentProfileSession().then(async current=>{
    if(active)setMediaToken(current?.session.access_token||null);
    if(!current){if(active)setSelf(null);return;}
    try {const profile=await profiles.get(current.accountId,current.session.access_token);if(active)setSelf(profile);}
    catch {if(active)setSelf(null);}
  }).catch(()=>{if(active){setSelf(null);setMediaToken(null);}});return()=>{active=false;};},[controller]));
  const unavailable=(name:string)=>setNotice(`${name}暂时不可用，请稍后再试。`);
  const pushSecondary=(kind:SecondaryKind)=>{setDrawer(false);setNotice('');setSecondary(stack=>[...stack,kind]);};
  const closeSecondary=()=>setSecondary(stack=>stack.slice(0,-1));
  const detailOpen=state.detailId!==null;
  const changeTab=(next:MainTab)=>{setNotice('');setNotifications(false);setSecondary([]);setTab(next);};
  const closeDrawer=()=>setDrawer(false);
  return <SafeAreaView edges={['top','left','right','bottom']} style={{flex:1,backgroundColor:colors.bg}}>
    <ShellHeader title={detailOpen?'帖子':notifications?'通知':({home:'社区',discover:'发现',ai:'AI 助手',messages:'私信',me:'个人主页'} as const)[tab]}
      left={detailOpen?<IconTap name="back" label={standalone?'返回个人主页':'返回社区'}
        onPress={()=>standalone?router.back():void controller.closePost()}/>:
        notifications?<IconTap name="back" label="返回" onPress={()=>setNotifications(false)}/>:
        <Pressable accessibilityRole="button" accessibilityLabel="打开账号侧边栏" onPress={()=>setDrawer(true)}
          style={{width:44,height:44,justifyContent:'center',alignItems:'center'}}><Avatar initial={self?.nickname || '我'} size={29}
            uri={self?.avatar_media_ref?guestMediaUrl(self.avatar_media_ref,process.env.EXPO_PUBLIC_API_URL,__DEV__):null}/></Pressable>}
      right={detailOpen?<IconTap name="ai" label="请 AI 总结这段讨论" onPress={()=>unavailable('AI 总结')}/>:
        notifications?null:tab==='ai'?<><IconTap name="history" label="历史会话" onPress={()=>pushSecondary('ai-history')}/>
          <IconTap name="edit" label="新建会话" onPress={()=>setAiEpoch(value=>value+1)}/></>:
        tab==='messages'?<><Pressable accessibilityRole="button" accessibilityLabel="筛选会话" onPress={()=>setDmFilter(value=>value==='全部'?'未读':'全部')}
          style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:3}}><Text style={{fontSize:11,color:colors.secondary}}>{dmFilter}</Text>
          <PrototypeIcon name="down" size={12} color={colors.secondary}/></Pressable>
          <IconTap name="edit" label="新建私信" onPress={()=>pushSecondary('new-dm')}/></>:
        tab==='me'?<><IconTap name="search" label="搜索我的内容" onPress={()=>pushSecondary('search')}/>
          <IconTap name="more" label="个人主页操作" onPress={()=>pushSecondary('profile-menu')}/></>:
        tab==='discover'?<><IconTap name="search" label="搜索社区" onPress={()=>pushSecondary('search')}/>
          <IconTap name="bell" label="通知" onPress={()=>setNotifications(true)}/></>:
        <IconTap name="bell" label="通知" onPress={()=>setNotifications(true)}/>}/>
    {detailOpen?<Detail controller={controller} mediaToken={mediaToken} onUnavailable={name=>name==='帖子操作'?pushSecondary('post-menu'):unavailable(name)} onNotice={setNotice}/>:
      notifications?<NotificationsSection/>:
      tab==='home'?<View style={{flex:1}}><FeedTabs active={feedTab} onChange={setFeedTab}/>
        {feedTab==='最新'?<FlatList data={state.items} keyExtractor={item=>item.id}
          renderItem={({item})=><PostCard post={item} mediaToken={mediaToken} onOpen={()=>void controller.openPost(item.id)}
            onAuthor={()=>router.push({pathname:'/profile/[accountId]',params:{accountId:item.author_id}})}
            onNotice={setNotice}
            onUnavailable={name=>{if(name==='帖子操作'){void controller.openPost(item.id);pushSecondary('post-menu');}else unavailable(name);}}/>}
          refreshControl={<RefreshControl refreshing={state.loading} onRefresh={()=>void controller.refresh()} tintColor={colors.accent}/>}
          ListEmptyComponent={state.loading||state.loadingMore?<View style={{padding:48,alignItems:'center'}}><ActivityIndicator color={colors.accent}/>
            <Text style={{color:colors.secondary,fontSize:12,marginTop:12}}>正在加载最新内容…</Text></View>:
            state.error?<EmptyRegion icon="posts" title="最新内容加载失败" description={state.error} action={{label:'重试',onPress:()=>void controller.refresh()}}/>:
            <EmptyRegion icon="posts" title="暂时没有公开帖子" description="发布并审核通过的公开内容会出现在这里。"/>}
          ListFooterComponent={state.items.length?<View style={{padding:24,alignItems:'center'}}>
            {state.error?<Text style={{fontSize:12,color:colors.secondary}}>{state.error}</Text>:null}
            {state.loadingMore?<ActivityIndicator color={colors.accent}/>:
              state.hasMore?<Pressable accessibilityRole="button" onPress={()=>void controller.loadMore()} style={{minHeight:44,justifyContent:'center'}}>
                <Text style={{color:colors.fg,fontSize:13}}>加载更多</Text></Pressable>:
                <Text style={{color:colors.secondary,fontSize:11}}>已显示当前可见内容</Text>}</View>:null}/>:<EmptyRegion icon={feedTab==='推荐'?'star':'users'}
          title={`${feedTab}内容暂不可用`} description={`可切换到“最新”查看公开帖子。`}
          action={{label:'查看最新',onPress:()=>setFeedTab('最新')}}/>}</View>:
      tab==='discover'?<DiscoverSection onSearch={()=>pushSecondary('search')} onTopics={()=>pushSecondary('topics')}
        onPeople={()=>pushSecondary('people')} onCuration={()=>pushSecondary('curation')}/>:
      tab==='ai'?<AiSection key={aiEpoch} onModels={()=>pushSecondary('ai-models')} onExtensions={()=>pushSecondary('ai-extensions')}/>:
      tab==='messages'?<MessagesSection filter={dmFilter} onRequests={()=>pushSecondary('dm-requests')}/>:<ProfilePage embedded onSocial={()=>pushSecondary('social')}/>}
    {notice?<Pressable accessibilityRole="button" accessibilityLabel="关闭提示" onPress={()=>setNotice('')}
      style={{position:'absolute',bottom:notifications||detailOpen?8:76,left:18,right:18,backgroundColor:colors.fg,borderRadius:12,padding:12,zIndex:5}}>
      <Text accessibilityRole="alert" style={{color:colors.bg,fontSize:11,lineHeight:18}}>{notice}</Text></Pressable>:null}
    {!detailOpen&&!notifications?<BottomTabs active={tab} onChange={changeTab}/>:null}
    {!detailOpen&&!notifications&&['home','discover','me'].includes(tab)?<Pressable accessibilityRole="button" accessibilityLabel="发布帖子"
      onPress={()=>router.push('/compose')} style={{position:'absolute',right:17,bottom:73,width:49,height:49,borderRadius:17,
        backgroundColor:colors.fg,alignItems:'center',justifyContent:'center',elevation:4}}>
      <PrototypeIcon name="plus" size={22} color={colors.bg}/></Pressable>:null}
    {drawer?<AccountDrawer profile={self} onClose={closeDrawer} onProfile={()=>{closeDrawer();changeTab('me');}}
      onContents={()=>{closeDrawer();router.push('/me/contents');}}
      onRecent={()=>{closeDrawer();router.push('/me/contents?recent=1');}}
      onReports={()=>{closeDrawer();router.push('/me/reports');}}
      onSanctions={()=>{closeDrawer();router.push('/me/sanctions');}}
      onLogin={()=>{closeDrawer();router.push('/(auth)');}} onSecondary={pushSecondary}/>:null}
    {secondary.length?<SecondarySurface kind={secondary[secondary.length-1]} onClose={closeSecondary} onNavigate={pushSecondary}
      ownPost={!!self && (state.detail?.author_id || state.items.find(item=>item.id===state.detailId)?.author_id)===self.account_id}
      onCompose={()=>{setSecondary([]);router.push('/compose');}} onAccount={()=>{setSecondary([]);router.push('/(auth)');}}
      onDiscover={()=>{setSecondary([]);changeTab('discover');}} onReport={()=>{const id=state.detail?.id || state.detailId;
        if(id){setSecondary([]);router.push({pathname:'/report',params:{kind:'post',id}});}else unavailable('举报');}}
      onBlock={()=>{const id=state.detail?.author_id || state.items.find(item=>item.id===state.detailId)?.author_id;
        if(!id){unavailable('拉黑');return;}
        setSecondary([]);void block(id).then(message=>{setNotice(message);void controller.refresh();
          const currentPost=controller.getSnapshot().detailId;if(currentPost)void controller.openPost(currentPost);})
          .catch(error=>setNotice(error instanceof Error?error.message:'拉黑操作暂时不可用'));}}
      onProfileEdit={()=>{setSecondary([]);router.push('/me/edit');}}/>:null}
  </SafeAreaView>;
}

export function FeedHome({initialPostId}:{initialPostId?:string}={}) {
  const [controller,setController]=useState<FeedController|null>(null);
  useEffect(()=>{const lifecycle={isActive:()=>AppState.currentState==='active',subscribe(listener:()=>void){
    const sub=AppState.addEventListener('change',listener);return()=>sub.remove();}};
    const next=createGuestFeedController(guestFeedApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__,
      async()=>(await currentProfileSession())?.session.access_token),lifecycle);
    setController(next);if(initialPostId)void next.openPost(initialPostId);
    else if(lifecycle.isActive())void next.refresh();return()=>next.dispose();},[initialPostId]);
  const colors=themeFor(useColorScheme());
  return controller?<ConnectedFeed controller={controller} standalone={!!initialPostId}/>:
    <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.bg}}>
      <ActivityIndicator color={colors.accent} accessibilityLabel="正在打开社区"/></SafeAreaView>;
}
