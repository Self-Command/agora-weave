import {useState} from 'react';
import {Pressable,ScrollView,Text,TextInput,View,useColorScheme} from 'react-native';
import {themeFor} from '../../../../../packages/design/src/tokens';
import type {Profile} from '../profile/api';
import {Avatar,AppEmpty as EmptyRegion,IconTap} from '../../components/AppChrome';
import {PrototypeIcon,type PrototypeIconName} from './PrototypeIcon';
import type {SecondaryKind} from './SecondarySurfaces';

export function DiscoverSection({onSearch,onTopics,onPeople,onCuration}:{onSearch:()=>void;onTopics:()=>void;onPeople:()=>void;onCuration:()=>void}) {
  const colors=themeFor(useColorScheme());
  return <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:28}} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityRole="button" accessibilityLabel="搜索帖子、用户和话题" onPress={onSearch}
      style={{minHeight:42,borderRadius:13,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:13,gap:9}}>
      <PrototypeIcon name="search" size={17} color={colors.secondary}/>
      <Text style={{color:colors.secondary,fontSize:13}}>搜索帖子、用户和话题</Text>
    </Pressable>
    <SectionTitle title="最近讨论" onPress={onTopics}/>
    <View style={{borderBottomWidth:1,borderBottomColor:colors.line,paddingVertical:18,flexDirection:'row',alignItems:'center',gap:12}}>
      <View style={{width:33,height:33,borderRadius:10,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.secondary,fontSize:17}}>＃</Text></View>
      <Text style={{color:colors.secondary,fontSize:12,flex:1}}>话题暂时不可用</Text>
    </View>
    <SectionTitle title="发现更多人" onPress={onPeople}/>
    <Text style={{color:colors.secondary,fontSize:12,paddingVertical:16}}>暂时无法查看推荐用户</Text>
    <SectionTitle title="值得一读" onPress={onCuration}/>
    <View style={{borderWidth:1,borderColor:colors.line,borderRadius:15,padding:18,marginTop:15,backgroundColor:colors.surface}}>
      <Text style={{color:colors.secondary,fontSize:11}}>精选内容暂时不可用</Text>
    </View>
  </ScrollView>;
}

function SectionTitle({title,onPress}:{title:string;onPress:()=>void}) {
  const colors=themeFor(useColorScheme());
  return <View style={{marginTop:26,marginBottom:4,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
    <Text accessibilityRole="header" style={{color:colors.fg,fontSize:17,fontWeight:'600'}}>{title}</Text>
    <IconTap name="right" label={`查看${title}`} onPress={onPress} size={18}/>
  </View>;
}

export function AiSection({onModels,onExtensions}:{onModels:()=>void;onExtensions:()=>void}) {
  const colors=themeFor(useColorScheme());
  const [prompt,setPrompt]=useState(''),[notice,setNotice]=useState(''),[unsent,setUnsent]=useState('');
  const submit=()=>{const value=prompt.trim();if(!value)return;setUnsent(value);setNotice('当前没有可用模型，问题未发送。');};
  return <View style={{flex:1}}>
    {unsent?<ScrollView style={{flex:1}} contentContainerStyle={{padding:17,paddingTop:23,gap:15}} keyboardShouldPersistTaps="handled">
      <View style={{alignSelf:'flex-end',maxWidth:'85%',borderRadius:16,backgroundColor:colors.surface,paddingHorizontal:14,paddingVertical:11}}>
        <Text style={{color:colors.fg,fontSize:14,lineHeight:23}}>{unsent}</Text>
        <Text style={{color:colors.secondary,fontSize:10,marginTop:6}}>未发送</Text>
      </View>
      <View style={{flexDirection:'row',gap:10,alignItems:'flex-start'}}>
        <PrototypeIcon name="ai" size={22} color={colors.accent}/>
        <View style={{flex:1,borderWidth:1,borderColor:colors.line,borderRadius:13,padding:13}}>
          <Text style={{fontSize:13,lineHeight:21,color:colors.secondary}}>当前没有可用模型。连接服务后再发送这条问题。</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="返回编辑问题" onPress={()=>{setUnsent('');setNotice('');}}
            style={{minHeight:39,justifyContent:'center',alignSelf:'flex-start'}}><Text style={{fontSize:12,color:colors.fg}}>返回编辑</Text></Pressable>
        </View>
      </View>
    </ScrollView>:<View style={{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:20,paddingBottom:48}}>
      <PrototypeIcon name="ai" size={30} color={colors.accent}/>
      <Text style={{fontSize:23,fontWeight:'600',color:colors.fg,textAlign:'center',marginTop:21}}>想了解社区里的什么？</Text>
      <Text style={{fontSize:12,lineHeight:22,color:colors.secondary,textAlign:'center',marginTop:12}}>搜索、总结，或者发现新的讨论。</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:7,marginTop:26}}>
        {['最近在聊什么','总结一条讨论','找相关帖子'].map(label=><Pressable key={label} accessibilityRole="button" onPress={()=>{setPrompt(label);setNotice('');}}
          style={{minHeight:32,borderWidth:1,borderColor:colors.line,borderRadius:8,paddingHorizontal:10,justifyContent:'center'}}>
          <Text style={{fontSize:10,color:colors.secondary}}>{label}</Text></Pressable>)}
      </View>
      {notice?<Text accessibilityRole="alert" style={{color:colors.secondary,fontSize:11,textAlign:'center',marginTop:15}}>{notice}</Text>:null}
    </View>}
    <View style={{paddingHorizontal:14,paddingBottom:12}}>
      <View style={{borderWidth:1,borderColor:colors.line,borderRadius:21,backgroundColor:colors.surface,padding:5}}>
        <TextInput accessibilityLabel="向 AI 提问" placeholder="问问社区里的事…" placeholderTextColor={colors.secondary}
          multiline value={prompt} onChangeText={setPrompt} style={{minHeight:60,maxHeight:120,color:colors.fg,fontSize:14,textAlignVertical:'top',paddingHorizontal:12,paddingTop:9}}/>
        <View style={{height:38,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <IconTap name="plus" label="添加附件与扩展" onPress={onExtensions} size={21}/>
            <Pressable accessibilityRole="button" onPress={onModels} style={{minHeight:36,flexDirection:'row',alignItems:'center',gap:4}}>
              <Text style={{fontSize:11,color:colors.secondary}}>模型未配置</Text><PrototypeIcon name="down" size={12} color={colors.secondary}/></Pressable>
          </View>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <IconTap name="mic" label="语音输入，暂不可用" onPress={()=>setNotice('语音输入暂时不可用。')} size={20}/>
            <Pressable accessibilityRole="button" accessibilityLabel="发送问题" onPress={submit}
              style={{width:29,height:29,borderRadius:15,backgroundColor:colors.fg,alignItems:'center',justifyContent:'center',marginHorizontal:7}}>
              <PrototypeIcon name="up" size={16} color={colors.bg}/></Pressable>
          </View>
        </View>
      </View>
      <Text style={{fontSize:9,color:colors.secondary,textAlign:'center',marginTop:8}}>回答可能有误，请结合来源判断。</Text>
    </View>
  </View>;
}

export function MessagesSection({onRequests,filter='全部'}:{onRequests:()=>void;filter?:'全部'|'未读'}) {
  const colors=themeFor(useColorScheme());
  const [query,setQuery]=useState('');
  return <View style={{flex:1}}>
    <View style={{margin:16,minHeight:42,borderRadius:13,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:13,gap:9}}>
      <PrototypeIcon name="search" size={17} color={colors.secondary}/>
      <TextInput accessibilityLabel="搜索会话" placeholder="搜索会话" placeholderTextColor={colors.secondary}
        value={query} onChangeText={setQuery} style={{flex:1,color:colors.fg,fontSize:13,paddingVertical:8}}/>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="私信请求" onPress={onRequests}
      style={{minHeight:50,borderBottomWidth:1,borderBottomColor:colors.line,flexDirection:'row',alignItems:'center',paddingHorizontal:16,gap:10}}>
      <PrototypeIcon name="inbox" size={18} color={colors.secondary}/><Text style={{color:colors.secondary,fontSize:12,flex:1}}>私信请求</Text>
      <PrototypeIcon name="right" size={16} color={colors.secondary}/>
    </Pressable>
    <EmptyRegion icon="chat" title={query?'没有找到会话':filter==='未读'?'暂时没有未读消息':'暂时没有会话'}
      description={query?'当前没有匹配的可见会话。':'私信暂时不可用。'}/>
  </View>;
}

export function NotificationsSection() {
  const colors=themeFor(useColorScheme());
  const [tab,setTab]=useState<'all'|'mentions'|'replies'>('all');
  const choices:{id:typeof tab;name:PrototypeIconName;label:string}[]=[{id:'all',name:'bell',label:'全部通知'},
    {id:'mentions',name:'at',label:'提及'},{id:'replies',name:'chat',label:'回复'}];
  return <View style={{flex:1}}>
    <View style={{height:48,borderBottomWidth:1,borderBottomColor:colors.line,flexDirection:'row'}}>
      {choices.map(choice=><Pressable key={choice.id} accessibilityRole="tab" accessibilityLabel={choice.label}
        accessibilityState={{selected:tab===choice.id}} onPress={()=>setTab(choice.id)} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <PrototypeIcon name={choice.name} size={21} color={tab===choice.id?colors.fg:colors.secondary}/>
        {tab===choice.id?<View style={{position:'absolute',bottom:0,width:25,height:3,borderRadius:3,backgroundColor:colors.fg}}/>:null}
      </Pressable>)}
    </View>
    <EmptyRegion icon="bell" title="通知暂时不可用" description="请稍后再试。"/>
  </View>;
}

export function AccountDrawer({profile,onClose,onProfile,onReports,onSanctions,onLogin,onSecondary}:{profile:Profile|null;onClose:()=>void;
  onProfile:()=>void;onReports:()=>void;onSanctions:()=>void;onLogin:()=>void;onSecondary:(kind:SecondaryKind)=>void}) {
  const colors=themeFor(useColorScheme());
  const rows:{icon:PrototypeIconName;label:string;onPress:()=>void}[]=[
    {icon:'user',label:'个人主页',onPress:onProfile},{icon:'folder',label:'云端草稿',onPress:()=>onSecondary('drafts')},
    {icon:'bookmark',label:'我的收藏',onPress:()=>onSecondary('bookmarks')},
    {icon:'trash',label:'最近删除',onPress:()=>onSecondary('trash')},
    {icon:'users',label:'关注请求',onPress:()=>onSecondary('social')},
    {icon:'flag',label:'我的举报',onPress:onReports},
    {icon:'file',label:'处罚与申诉',onPress:onSanctions},
  ];
  return <View style={{position:'absolute',top:0,right:0,bottom:0,left:0,flexDirection:'row',backgroundColor:'#00000038',zIndex:10}}>
    <View style={{width:'82%',maxWidth:324,backgroundColor:colors.bg,borderRightWidth:1,borderRightColor:colors.line}}>
      <View style={{height:56,paddingLeft:22,paddingRight:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text accessibilityRole="header" style={{fontSize:18,fontWeight:'600',color:colors.fg}}>我的账号</Text>
        <IconTap name="close" label="关闭侧边栏" onPress={onClose} size={20}/>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="查看个人主页" onPress={profile?onProfile:onLogin}
        style={{paddingHorizontal:22,paddingTop:13,paddingBottom:20,alignItems:'flex-start'}}>
        <Avatar initial={profile?.nickname || '我'} size={47}/>
        <Text style={{fontSize:19,fontWeight:'600',color:colors.fg,marginTop:14}}>{profile?.nickname || '登录后查看账号'}</Text>
        {profile?<Text style={{fontSize:12,color:colors.secondary,marginTop:3}}>@{profile.username}</Text>:null}
      </Pressable>
      {profile?<View style={{flexDirection:'row',gap:17,paddingHorizontal:22,paddingBottom:14}}>
        <Pressable accessibilityRole="button" accessibilityLabel="查看关注" onPress={()=>onSecondary('social')} style={{minHeight:44,justifyContent:'center'}}>
          <Text style={{color:colors.secondary,fontSize:11}}><Text style={{color:colors.fg,fontWeight:'600'}}>{profile.following_count}</Text> 关注</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="查看粉丝" onPress={()=>onSecondary('social')} style={{minHeight:44,justifyContent:'center'}}>
          <Text style={{color:colors.secondary,fontSize:11}}><Text style={{color:colors.fg,fontWeight:'600'}}>{profile.followers_count}</Text> 粉丝</Text></Pressable>
      </View>:null}
      <ScrollView style={{flex:1,borderTopWidth:1,borderTopColor:colors.line}} contentContainerStyle={{padding:11,paddingTop:14}}>
        {rows.map(row=><Pressable key={row.label} accessibilityRole="button" accessibilityLabel={row.label} onPress={row.onPress}
          style={{minHeight:54,borderRadius:10,flexDirection:'row',alignItems:'center',gap:16,paddingHorizontal:13}}>
          <PrototypeIcon name={row.icon} size={22}/><Text style={{fontSize:15,fontWeight:'500',color:colors.fg}}>{row.label}</Text></Pressable>)}
      </ScrollView>
      <View style={{borderTopWidth:1,borderTopColor:colors.line,padding:11}}>
        <Pressable accessibilityRole="button" accessibilityLabel="设置与隐私" onPress={()=>onSecondary('settings')}
          style={{minHeight:54,flexDirection:'row',alignItems:'center',gap:16,paddingHorizontal:13}}>
          <PrototypeIcon name="settings" size={22}/><Text style={{flex:1,fontSize:14,color:colors.fg}}>设置与隐私</Text>
          <PrototypeIcon name="right" size={15} color={colors.secondary}/></Pressable>
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="关闭侧边栏" onPress={onClose} style={{flex:1}}/>
  </View>;
}
