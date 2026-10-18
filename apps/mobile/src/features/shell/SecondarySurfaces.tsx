import {useState} from 'react';
import {Pressable,ScrollView,Text,TextInput,View,useColorScheme} from 'react-native';
import {themeFor} from '../../../../../packages/design/src/tokens';
import {AppEmpty as EmptyRegion,IconTap} from '../../components/AppChrome';
import {PrototypeIcon,type PrototypeIconName} from './PrototypeIcon';

export type SecondaryKind='search'|'topics'|'people'|'social'|'bookmarks'|'drafts'|'trash'|'settings'|
  'account-settings'|'follower-settings'|'ai-settings'|'indexing-settings'|'content-settings'|'mute-settings'|
  'dm-settings'|'push-settings'|'dm-requests'|'new-dm'|'dm-thread'|'ai-history'|'ai-models'|'ai-extensions'|
  'interactions'|'post-menu'|'profile-menu'|'curation';
type Props={kind:SecondaryKind;onClose:()=>void;onNavigate:(kind:SecondaryKind)=>void;onCompose:()=>void;
  onAccount:()=>void;onDiscover:()=>void;onReport:()=>void;onBlock:()=>void;onProfileEdit:()=>void;ownPost?:boolean};
const title:Record<SecondaryKind,string>={search:'搜索',topics:'最近讨论',people:'发现用户',social:'关注与粉丝',bookmarks:'我的收藏',
  drafts:'云端草稿',trash:'最近删除',settings:'设置', 'account-settings':'账号与手机号',
  'follower-settings':'关注审批与粉丝','ai-settings':'AI 使用设置','indexing-settings':'搜索引擎收录',
  'content-settings':'内容偏好','mute-settings':'内容屏蔽与拉黑','dm-settings':'私信与回执','push-settings':'通知与推送',
  'dm-requests':'私信请求','new-dm':'新建私信','dm-thread':'私信会话','ai-history':'历史会话',
  'ai-models':'选择模型','ai-extensions':'添加到对话',interactions:'转发与引用','post-menu':'帖子操作',
  'profile-menu':'个人主页操作',curation:'人工精选'};
const sheetKinds=new Set<SecondaryKind>(['ai-models','ai-extensions','post-menu','profile-menu']);

function SearchField({label,placeholder,value,onChange}:{label:string;placeholder:string;value:string;onChange:(value:string)=>void}) {
  const colors=themeFor(useColorScheme());
  return <View style={{height:42,borderRadius:13,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:13}}>
    <PrototypeIcon name="search" size={17} color={colors.secondary}/>
    <TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor={colors.secondary} value={value} onChangeText={onChange}
      style={{flex:1,color:colors.fg,fontSize:13,paddingVertical:7}}/>
  </View>;
}

function Row({icon,label,description,onPress}:{icon:PrototypeIconName;label:string;description?:string;onPress?:()=>void}) {
  const colors=themeFor(useColorScheme());
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:!onPress}} disabled={!onPress} onPress={onPress}
    style={{minHeight:58,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:14,paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.line}}>
    <PrototypeIcon name={icon} size={20} color={colors.secondary}/>
    <View style={{flex:1}}><Text style={{fontSize:13,color:colors.fg}}>{label}</Text>
      {description?<Text style={{fontSize:10,color:colors.secondary,marginTop:3,lineHeight:16}}>{description}</Text>:null}</View>
    {onPress?<PrototypeIcon name="right" size={15} color={colors.secondary}/>:null}
  </Pressable>;
}

function Tabs({values,active,onChange}:{values:string[];active:string;onChange:(value:string)=>void}) {
  const colors=themeFor(useColorScheme());
  return <View style={{height:47,borderBottomWidth:1,borderBottomColor:colors.line,flexDirection:'row'}}>
    {values.map(value=><Pressable key={value} accessibilityRole="tab" accessibilityLabel={value} accessibilityState={{selected:active===value}}
      onPress={()=>onChange(value)} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:active===value?colors.fg:colors.secondary,fontSize:13,fontWeight:active===value?'600':'400'}}>{value}</Text>
      {active===value?<View style={{position:'absolute',bottom:0,width:28,height:3,borderRadius:3,backgroundColor:colors.fg}}/>:null}
    </Pressable>)}
  </View>;
}

function Body({kind,onNavigate,onCompose,onAccount,onDiscover,onReport,onBlock,onProfileEdit,ownPost}:{kind:SecondaryKind;onNavigate:Props['onNavigate'];
  onCompose:Props['onCompose'];onAccount:Props['onAccount'];onDiscover:Props['onDiscover'];onReport:Props['onReport'];
  onBlock:Props['onBlock'];onProfileEdit:Props['onProfileEdit'];ownPost?:boolean}) {
  const colors=themeFor(useColorScheme());
  const [query,setQuery]=useState(''),[tab,setTab]=useState('帖子');
  const search=(label:string,placeholder:string)=>
    <View style={{padding:16}}><SearchField label={label} placeholder={placeholder} value={query} onChange={setQuery}/></View>;
  const empty=(icon:PrototypeIconName,heading:string,description:string,action?:{label:string;onPress:()=>void})=>
    <EmptyRegion icon={icon} title={heading} description={description} action={action}/>;
  switch(kind){
    case 'search':return <View style={{flex:1}}>{search('搜索社区','搜索帖子、用户和话题')}
      <Tabs values={['帖子','用户','话题']} active={tab} onChange={setTab}/>
      {empty('search',query?'搜索暂时不可用':'开始搜索',query?'关键词已保留，请稍后再试。':'输入关键词，搜索有权查看的内容。')}</View>;
    case 'topics':return <View style={{flex:1}}>{search('搜索话题','搜索话题')}
      {empty('hash','暂时没有话题','当前没有可读取的话题。')}</View>;
    case 'people':return <View style={{flex:1}}>
      <View style={{padding:20}}><Text style={{fontSize:10,color:colors.secondary,letterSpacing:1}}>从共同兴趣开始</Text>
        <Text style={{fontSize:20,color:colors.fg,fontWeight:'600',marginTop:7}}>遇见值得聊的人</Text>
        <Text style={{fontSize:12,color:colors.secondary,marginTop:8}}>看看他们分享的内容，再决定是否关注。</Text></View>
      <Tabs values={['全部','阅读','创作','生活']} active={tab==='帖子'?'全部':tab} onChange={setTab}/>
      {empty('users','推荐用户暂时不可用','请稍后再试。')}</View>;
    case 'social':return <View style={{flex:1}}><Tabs values={['关注','粉丝','请求']} active={tab==='帖子'?'关注':tab} onChange={setTab}/>
      {tab==='请求'?null:search('搜索关注关系','搜索昵称或用户名')}
      {empty('users',tab==='请求'?'关注请求暂时不可用':'关注关系暂时不可用','请稍后再试。',
        {label:'发现更多用户',onPress:()=>onNavigate('people')})}</View>;
    case 'bookmarks':return <View style={{flex:1}}>{search('搜索收藏','搜索收藏的帖子')}
      <Text style={{fontSize:10,color:colors.secondary,paddingHorizontal:18,paddingBottom:7}}>仅自己可见</Text>
      {empty('bookmark','收藏暂时不可用','请稍后再试。', {label:'发现内容',onPress:onDiscover})}</View>;
    case 'drafts':return <View style={{flex:1}}>{search('搜索草稿','搜索草稿')}
      <Text style={{fontSize:10,color:colors.secondary,paddingHorizontal:18,paddingBottom:7}}>仅自己可见 · 发布页可继续本机草稿</Text>
      {empty('folder','云端草稿暂时不可用','可在发布页继续本机草稿。', {label:'继续写帖子',onPress:onCompose})}</View>;
    case 'trash':return empty('trash','最近删除暂时不可用','请稍后再试。');
    case 'settings':return <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
      <View style={{borderWidth:1,borderColor:colors.line,borderRadius:14,overflow:'hidden'}}>
        {([
          ['user','账号与手机号','account-settings'],['users','关注审批与粉丝','follower-settings'],
          ['ai','AI 使用设置','ai-settings'],['globe','搜索引擎收录','indexing-settings'],
          ['sliders','内容偏好','content-settings'],['block','内容屏蔽与拉黑','mute-settings'],
          ['chat','私信与回执','dm-settings'],['bell','通知与推送','push-settings'],
        ] as [PrototypeIconName,string,SecondaryKind][]).map(([icon,label,next])=><Row key={next} icon={icon} label={label} onPress={()=>onNavigate(next)}/>)}</View>
      <Text style={{fontSize:10,color:colors.secondary,lineHeight:18,marginTop:18}}>隐私与安全设置以当前账号权限和服务端回执为准。</Text>
    </ScrollView>;
    case 'account-settings':return <View style={{flex:1}}><Row icon="user" label="账号安全" description="打开已接通的原生账号页面" onPress={onAccount}/>
      {empty('settings','更多账号设置暂时不可用','手机号和恢复流程可在账号安全页查看。')}</View>;
    case 'follower-settings':case 'ai-settings':case 'indexing-settings':case 'content-settings':
    case 'mute-settings':case 'dm-settings':case 'push-settings':return empty('settings','设置暂时不可用',`${title[kind]}请稍后再试。`);
    case 'dm-requests':return <View style={{flex:1}}><Text style={{fontSize:11,color:colors.secondary,lineHeight:18,padding:16}}>
      接受前，私信请求不会进入正常会话。</Text>{empty('inbox','私信请求暂时不可用','请稍后再试。')}</View>;
    case 'new-dm':return <View style={{flex:1}}>{search('搜索私信接收人','搜索昵称或用户名')}
      <Text style={{fontSize:10,color:colors.secondary,paddingHorizontal:18}}>选择一个人</Text>
      {empty('users','暂时无法选择接收人','请稍后再试。')}</View>;
    case 'dm-thread':return empty('chat','会话暂时不可用','请稍后再试。');
    case 'ai-history':return <View style={{flex:1}}>{search('搜索历史会话','搜索会话')}
      {empty('history','历史会话暂时不可用','请稍后再试。')}</View>;
    case 'ai-models':return <View style={{paddingBottom:16}}><Text style={{fontSize:11,color:colors.secondary,textAlign:'center',marginBottom:12}}>
      暂时没有可用模型。</Text>
      <Row icon="ai" label="模型暂不可用"/></View>;
    case 'ai-extensions':return <View style={{paddingBottom:16}}>
      <Row icon="image" label="图片" description="文件格式与识图能力待确认"/>
      <Row icon="file" label="文件" description="文档解析范围待确认"/>
      <Row icon="link" label="社区帖子" description="仅可选择有权访问且允许 AI 使用的内容"/>
      <Row icon="sliders" label="更多工具" description="联网搜索、语音等尚未开放"/></View>;
    case 'interactions':return <View style={{flex:1}}><Tabs values={['引用','转发']} active={tab==='帖子'?'引用':tab} onChange={setTab}/>
      {empty('repost',`${tab==='帖子'?'引用':tab}暂时不可用`,'请稍后再试。')}</View>;
    case 'post-menu':return <View style={{paddingBottom:16}}>{ownPost?<>
      <Row icon="edit" label="编辑帖子" description="帖子编辑暂时不可用"/>
      <Row icon="trash" label="删除帖子" description="删除流程暂时不可用"/>
      <Row icon="repost" label="查看转发与引用" onPress={()=>onNavigate('interactions')}/>
    </>:<>
      <Row icon="uninterested" label="不感兴趣" description="暂时不可用"/>
      <Row icon="mute" label="屏蔽作者" description="需要当前作者资料与账号权限"/>
      <Row icon="block" label="拉黑作者" onPress={onBlock}/>
      <Row icon="flag" label="举报帖子" onPress={onReport}/>
      <Row icon="repost" label="查看转发与引用" onPress={()=>onNavigate('interactions')}/>
    </>}</View>;
    case 'profile-menu':return <View style={{paddingBottom:16}}>
      <Row icon="edit" label="编辑个人资料" onPress={onProfileEdit}/>
      <Row icon="share" label="分享个人主页" description="暂时不可用"/>
      <Row icon="settings" label="设置与隐私" onPress={()=>onNavigate('settings')}/>
    </View>;
    case 'curation':return empty('star','人工精选暂时不可用','请稍后再试。');
  }
}

export function SecondarySurface({kind,onClose,onNavigate,onCompose,onAccount,onDiscover,onReport,onBlock,onProfileEdit,ownPost}:Props) {
  const colors=themeFor(useColorScheme()),sheet=sheetKinds.has(kind);
  return sheet?<View style={{position:'absolute',top:0,right:0,bottom:0,left:0,zIndex:9,justifyContent:'flex-end',backgroundColor:'#00000038'}}>
    <Pressable accessibilityRole="button" accessibilityLabel="关闭面板" onPress={onClose} style={{flex:1}}/>
    <View style={{backgroundColor:colors.bg,borderTopLeftRadius:24,borderTopRightRadius:24,paddingTop:9,paddingHorizontal:17,paddingBottom:18}}>
      <View style={{height:3,width:29,backgroundColor:colors.secondary,opacity:0.4,borderRadius:3,alignSelf:'center',marginBottom:18}}/>
      <Text accessibilityRole="header" style={{color:colors.fg,fontSize:17,fontWeight:'600',textAlign:'center',marginBottom:17}}>{title[kind]}</Text>
      <Body kind={kind} onNavigate={onNavigate} onCompose={onCompose} onAccount={onAccount} onDiscover={onDiscover}
        onReport={onReport} onBlock={onBlock} onProfileEdit={onProfileEdit} ownPost={ownPost}/>
      <Pressable accessibilityRole="button" accessibilityLabel="关闭面板" onPress={onClose} style={{minHeight:40,alignItems:'center',justifyContent:'center'}}>
        <PrototypeIcon name="close" size={20} color={colors.secondary}/></Pressable>
    </View>
  </View>:<View style={{position:'absolute',top:0,right:0,bottom:0,left:0,zIndex:9,backgroundColor:colors.bg}}>
    <View style={{height:56,borderBottomWidth:1,borderBottomColor:colors.line,flexDirection:'row',alignItems:'center',paddingHorizontal:12}}>
      <View style={{width:66}}><IconTap name="back" label="返回" onPress={onClose}/></View>
      <Text accessibilityRole="header" style={{flex:1,textAlign:'center',color:colors.fg,fontSize:19,fontWeight:'700'}}>{title[kind]}</Text>
      <View style={{width:66,alignItems:'flex-end'}}>
        {kind==='drafts'?<IconTap name="plus" label="写新帖子" onPress={onCompose}/>:null}
        {kind==='ai-history'?<IconTap name="edit" label="新建会话" onPress={onClose}/>:null}
      </View>
    </View>
    <Body kind={kind} onNavigate={onNavigate} onCompose={onCompose} onAccount={onAccount} onDiscover={onDiscover}
      onReport={onReport} onBlock={onBlock} onProfileEdit={onProfileEdit} ownPost={ownPost}/>
  </View>;
}
