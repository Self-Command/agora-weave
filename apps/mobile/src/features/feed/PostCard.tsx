import { useEffect,useRef,useState } from 'react';
import { Image,Pressable,Text,View,useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { themeFor } from '../../../../../packages/design/src/tokens';
import { profileApi,type Profile } from '../profile/api';
import { currentProfileSession } from '../profile/session';
import { guestMediaUrl } from './api';
import { LikeError,resourceLikeApi,resourceLikeStateApi,validLikeReceipt,type LikeReceipt } from './likes-api';
import { AccountError,accountApi } from '../account/api';
import { Avatar,IconTap } from '../../components/AppChrome';
import type { AppIconName } from '../../components/AppIcon';
import {IconCountAction} from '../../components/AppChrome';

const release=Constants.expoConfig?.version || '0.0.0';
const profiles=profileApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const likes=resourceLikeApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const likeState=resourceLikeStateApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);

/** One card model for latest feed, post detail and profile content projections. */
export type CardPost={id:string;author_id:string;body:string;type:'text'|'images';media_refs:string[];created_at?:string};

function Author({id,onPress,profile}:{id:string;onPress:()=>void;profile?:Profile|null}) {
  const colors=themeFor(useColorScheme());
  const [loaded,setLoaded]=useState<Profile|null>(null);
  useEffect(()=>{if(profile){setLoaded(profile);return;}
    let active=true;setLoaded(null);void profiles.get(id).then(value=>{if(active)setLoaded(value);}).catch(()=>{});
    return()=>{active=false;};},[id,profile]);
  const author=profile || loaded;
  return <Pressable accessibilityRole="button" accessibilityLabel="查看作者资料" onPress={onPress}
    style={{flexDirection:'row',alignItems:'center',gap:10,flex:1,minWidth:0}}>
    <Avatar initial={author?.nickname || '人'} size={38}
      uri={author?.avatar_media_ref?guestMediaUrl(author.avatar_media_ref,process.env.EXPO_PUBLIC_API_URL,__DEV__):null}/>
    <View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={{color:colors.fg,fontSize:14,fontWeight:'600'}}>{author?.nickname || '社区成员'}</Text>
      {author?.username?<Text numberOfLines={1} style={{color:colors.secondary,fontSize:11,marginTop:2}}>@{author.username}</Text>:null}</View>
  </Pressable>;
}

function PostImages({post,mediaToken}:{post:CardPost;mediaToken?:string|null}) {
  const colors=themeFor(useColorScheme());
  const [failed,setFailed]=useState<Record<string,boolean>>({});
  if(post.type!=='images')return null;
  return <View style={{gap:10,marginTop:12}}>{post.media_refs.map((id,index)=>{
    const uri=guestMediaUrl(id,process.env.EXPO_PUBLIC_API_URL,__DEV__);
    return <View key={id} style={{borderWidth:1,borderColor:colors.line,borderRadius:14,overflow:'hidden',backgroundColor:colors.surface}}>
      {uri&&!failed[id]?<Image source={{uri,...(mediaToken?{headers:{Authorization:`Bearer ${mediaToken}`}}:{})}}
        resizeMode="contain" accessible accessibilityLabel={`帖子图片 ${index+1}，共 ${post.media_refs.length} 张`}
        onError={()=>setFailed(value=>({...value,[id]:true}))} style={{width:'100%',height:210}}/>:
        <Text style={{color:colors.secondary,fontSize:12,padding:24,textAlign:'center'}}>图片当前无法加载</Text>}</View>;
  })}</View>;
}

function LikeAction({postId,onNotice}:{postId:string;onNotice:(message:string)=>void}){
  const colors=themeFor(useColorScheme()),router=useRouter();
  const [receipt,setReceipt]=useState<LikeReceipt|null>(null),[busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true),[readError,setReadError]=useState(false);
  const pending=useRef<{id:string;active:boolean;owner:string}|null>(null);
  useEffect(()=>{let active=true;setReceipt(null);setLoading(true);setReadError(false);pending.current=null;
    void currentProfileSession().then(async current=>current?likeState(current.session.access_token,postId):null)
      .then(value=>{if(active){setReceipt(value);setLoading(false);}})
      .catch(()=>{if(active){setReadError(true);setLoading(false);}});
    return()=>{active=false;};},[postId]);
  const run=async()=>{
    if(busy||loading)return;
    setBusy(true);
    try{
      const current=await currentProfileSession();
      if(!current){router.push('/(auth)');return;}
      if(readError){setReceipt(await likeState(current.session.access_token,postId));setReadError(false);onNotice('已刷新点赞状态');return;}
      const unresolved=pending.current;
      if(unresolved){
        if(unresolved.owner!==current.accountId){pending.current=null;onNotice('账号已变化，请重新操作');return;}
        let operation;
        try{operation=await accounts.operation(current.session.access_token,unresolved.id);}
        catch(error){if(error instanceof AccountError&&error.code==='NOT_FOUND'){
          setReceipt(await likeState(current.session.access_token,postId));pending.current=null;
          onNotice('原操作未受理，已刷新点赞状态');return;}throw error;}
        if(operation.operation_id!==unresolved.id || operation.action!==(unresolved.active?'like.put':'like.remove')){
          onNotice('原操作记录不匹配，请稍后再查');return;
        }
        if(operation.state==='succeeded' && validLikeReceipt(operation.result,postId)){
          setReceipt(operation.result);pending.current=null;onNotice(unresolved.active?'已点赞':'已取消点赞');return;
        }
        if(operation.state==='failed'){pending.current=null;onNotice('原操作未完成，请重试');return;}
        onNotice('原操作仍待确认，请稍后再查');return;
      }
      if(!receipt){setReceipt(await likeState(current.session.access_token,postId));onNotice('已刷新点赞状态');return;}
      const active=!receipt.active,id=randomUUID();
      pending.current={id,active,owner:current.accountId};
      const result=await likes(current.session.access_token,postId,id,active);
      setReceipt(result);pending.current=null;onNotice(active?'已点赞':'已取消点赞');
    }catch(error){
      if(error instanceof LikeError && !error.uncertain)pending.current=null;
      onNotice(error instanceof Error?error.message:'点赞服务暂时不可用');
    }finally{setBusy(false);}
  };
  return <IconCountAction icon="heart" label={pending.current?'查询点赞结果':receipt?.active?'取消点赞':'点赞'}
    count={receipt?.count} disabled={busy||loading} onPress={()=>void run()}
    color={receipt?.active?colors.accent:colors.secondary}/>;
}

function Actions({postId,onComment,onUnavailable,onNotice}:{postId:string;onComment:()=>void;
  onUnavailable:(name:string)=>void;onNotice:(message:string)=>void}) {
  const entries:{icon:AppIconName;label:string;run:()=>void}[]=[
    {icon:'chat',label:'评论',run:onComment},{icon:'repost',label:'转发',run:()=>onUnavailable('转发')},
    {icon:'bookmark',label:'收藏',run:()=>onUnavailable('收藏')},{icon:'share',label:'分享',run:()=>onUnavailable('分享')}];
  return <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10,maxWidth:330}}>
    {entries.slice(0,2).map(item=><IconCountAction key={item.label} icon={item.icon} label={item.label} onPress={item.run}/>)}
    <LikeAction postId={postId} onNotice={onNotice}/>
    {entries.slice(2).map(item=><IconCountAction key={item.label} icon={item.icon} label={item.label} onPress={item.run}/>)}
  </View>;
}

export function PostCard({post,onOpen,onAuthor,onComment,onUnavailable,onNotice,authorProfile,mediaToken,selectable=false}:
  {post:CardPost;onOpen?:()=>void;onAuthor:()=>void;onComment?:()=>void;onUnavailable:(name:string)=>void;
    onNotice:(message:string)=>void;authorProfile?:Profile|null;mediaToken?:string|null;selectable?:boolean}) {
  const colors=themeFor(useColorScheme());
  return <View style={{paddingTop:18,paddingBottom:13,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:colors.line}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
      <Author id={post.author_id} onPress={onAuthor} profile={authorProfile}/>
      {post.created_at?<Text style={{color:colors.secondary,fontSize:11}}>· {post.created_at.slice(0,10)}</Text>:null}
      <IconTap name="more" label="帖子操作" onPress={()=>onUnavailable('帖子操作')} size={18}/>
    </View>
    <Pressable accessibilityRole={onOpen?'button':undefined} accessibilityLabel={onOpen?'打开帖子详情':undefined}
      disabled={!onOpen} onPress={onOpen} style={{marginLeft:49,marginTop:5}}>
      {post.body?<Text selectable={selectable} style={{color:colors.fg,fontSize:14,lineHeight:25}}>{post.body}</Text>:null}
      <PostImages post={post} mediaToken={mediaToken}/></Pressable>
    <View style={{marginLeft:49}}><Actions postId={post.id} onComment={onComment||onOpen||(()=>{})}
      onUnavailable={onUnavailable} onNotice={onNotice}/></View>
  </View>;
}
