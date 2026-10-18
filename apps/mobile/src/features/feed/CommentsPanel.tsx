import {useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Modal,Pressable,Text,TextInput,View,useColorScheme} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {randomUUID} from 'expo-crypto';
import Constants from 'expo-constants';
import {useRouter} from 'expo-router';
import {themeFor} from '../../../../../packages/design/src/tokens';
import {countVisibleCharacters,normalizeText} from '../../../../../packages/contracts/src/graphemes';
import {accountApi} from '../account/api';
import {currentProfileSession} from '../profile/session';
import {profileApi,type Profile} from '../profile/api';
import {blockApi} from '../profile/blocks-api';
import {isRevisionReceipt} from '../publishing/post-api';
import {Avatar} from '../../components/AppChrome';
import {PrototypeIcon} from '../shell/PrototypeIcon';
import {commentWriteApi,CommentError,guestCommentsApi,type CommentItem} from './comments-api';
import {guestMediaUrl} from './api';

const release=Constants.expoConfig?.version || '0.0.0';
const read=guestCommentsApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__,async()=>(await currentProfileSession())?.session.access_token);
const write=commentWriteApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const accounts=accountApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const profiles=profileApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const block=blockApi(process.env.EXPO_PUBLIC_API_URL,release,__DEV__);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export type ReplyTarget={id:string;label:string};

function CommentAuthor({id,onLoaded}:{id:string;onLoaded:(id:string,profile:Profile)=>void}){
  const colors=themeFor(useColorScheme()),[profile,setProfile]=useState<Profile|null>(null);
  useEffect(()=>{let active=true;setProfile(null);void currentProfileSession().then(current=>profiles.get(id,current?.session.access_token)).then(value=>{if(active){setProfile(value);onLoaded(id,value);}}).catch(()=>{});
    return()=>{active=false;};},[id,onLoaded]);
  return <View style={{flexDirection:'row',alignItems:'center',gap:6,flex:1,minWidth:0}}>
    <Text numberOfLines={1} style={{color:colors.fg,fontSize:12,fontWeight:'600'}}>{profile?.nickname || '社区成员'}</Text>
    <Text numberOfLines={1} style={{color:colors.secondary,fontSize:10,flexShrink:1}}>{profile?.username?'@'+profile.username:''}</Text>
  </View>;
}

export function CommentsPanel({postId,refreshKey=0,onReplyTarget}:{postId:string;refreshKey?:number;onReplyTarget?:(target:ReplyTarget)=>void}){
  const colors=themeFor(useColorScheme()),router=useRouter();
  const [items,setItems]=useState<CommentItem[]>([]),[cursor,setCursor]=useState<string|null>(null);
  const [sort,setSort]=useState<'latest'|'hot'>('latest'),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [menuComment,setMenuComment]=useState<CommentItem|null>(null),[owner,setOwner]=useState<string|null>(null);
  const [menuBusy,setMenuBusy]=useState(false),[menuMessage,setMenuMessage]=useState('');
  const [authorProfiles,setAuthorProfiles]=useState<Record<string,Profile>>({});
  const onAuthorLoaded=useCallback((id:string,profile:Profile)=>setAuthorProfiles(current=>({...current,[id]:profile})),[]);
  const generation=useRef(0);
  useEffect(()=>{let active=true;void currentProfileSession().then(current=>{if(active)setOwner(current?.accountId || null);}).catch(()=>{});
    return()=>{active=false;};},[]);
  const refresh=useCallback(async()=>{
    const ticket=++generation.current;setItems([]);setCursor(null);setError('');setLoading(true);
    try {const page=await read(postId,undefined,sort);if(generation.current===ticket){setItems(page.items);setCursor(page.next_cursor);}}
    catch(failure){if(generation.current===ticket)setError(failure instanceof Error?failure.message:'评论暂时无法加载');}
    finally{if(generation.current===ticket)setLoading(false);}
  },[postId,sort]);
  useEffect(()=>{void refresh();return()=>{generation.current++;};},[refresh,refreshKey]);
  const loadMore=async()=>{
    if(loading || !cursor)return;
    const ticket=++generation.current,previousCount=items.length;
    setItems([]);setCursor(null);setError('');setLoading(true);
    try {
      // Re-read from the beginning so access changes cannot leave stale comments visible.
      const fresh:CommentItem[]=[],seen=new Set<string>(),seenCursors=new Set<string>();let next:string|undefined;
      do {if(next){if(seenCursors.has(next))throw new Error('评论列表暂时无法继续，请刷新');seenCursors.add(next);}
        const page=await read(postId,next,sort);if(generation.current!==ticket)return;
        for(const item of page.items)if(!seen.has(item.id)){seen.add(item.id);fresh.push(item);}
        next=page.next_cursor || undefined;
      } while(next && fresh.length<=previousCount);
      setItems(fresh);setCursor(next || null);
    } catch(failure){if(generation.current===ticket)setError(failure instanceof Error?failure.message:'评论暂时无法加载');}
    finally{if(generation.current===ticket)setLoading(false);}
  };
  const blockCommentAuthor=async()=>{
    if(!menuComment||!('author_id' in menuComment)||menuBusy)return;
    setMenuBusy(true);setMenuMessage('');
    try{setMenuMessage(await block(menuComment.author_id));await refresh();}
    catch(error){setMenuMessage(error instanceof Error?error.message:'拉黑操作暂时不可用');}
    finally{setMenuBusy(false);}
  };
  return <View style={{paddingBottom:8}}>
    <View style={{minHeight:53,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:colors.line}}>
      <View style={{flexDirection:'row',gap:14}}>{(['latest','hot'] as const).map(value=><Pressable key={value} accessibilityRole="button"
        accessibilityLabel={value==='latest'?'最新评论':'热门评论'} accessibilityState={{selected:sort===value}} onPress={()=>setSort(value)}
        style={{minHeight:44,justifyContent:'center'}}><Text style={{fontSize:11,color:sort===value?colors.fg:colors.secondary,
          fontWeight:sort===value?'600':'400'}}>{value==='latest'?'最新':'热门'}</Text></Pressable>)}</View>
      <Pressable accessibilityRole="button" accessibilityLabel="刷新评论" onPress={()=>void refresh()} style={{minHeight:44,justifyContent:'center',paddingHorizontal:4}}>
        <Text style={{fontSize:11,color:colors.secondary}}>刷新</Text></Pressable>
    </View>
    {loading?<View style={{alignItems:'center',gap:8,paddingVertical:32}}><ActivityIndicator color={colors.accent}/><Text style={{fontSize:12,color:colors.secondary}}>正在读取评论…</Text></View>:
      error?<View style={{padding:20,gap:8}}><Text accessibilityRole="alert" style={{color:colors.secondary,fontSize:13}}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={()=>void refresh()} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:colors.fg}}>重试</Text></Pressable></View>:
      items.length===0?<Text style={{paddingVertical:32,textAlign:'center',fontSize:13,color:colors.secondary}}>暂无可见评论</Text>:
      <View>{items.map(item=>{const available='body' in item,depth=available?Math.min(Math.max(item.display_depth,1),3):1;
        return <View key={item.id} style={{marginHorizontal:16,paddingVertical:17,paddingLeft:(depth-1)*18,borderBottomWidth:1,
          borderBottomColor:colors.line,flexDirection:'row',gap:11}}>
          <Avatar initial={available?authorProfiles[item.author_id]?.nickname||'人':'·'} size={37}
            uri={available&&authorProfiles[item.author_id]?.avatar_media_ref?
              guestMediaUrl(authorProfiles[item.author_id].avatar_media_ref!,process.env.EXPO_PUBLIC_API_URL,__DEV__):null}/>
          <View style={{flex:1,minWidth:0}}>{available?<>
            <View style={{minHeight:22,flexDirection:'row',alignItems:'center',gap:6}}><CommentAuthor id={item.author_id} onLoaded={onAuthorLoaded}/>
              <Text style={{fontSize:10,color:colors.secondary}}>{item.created_at.slice(0,10)}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="评论操作" onPress={()=>setMenuComment(item)}
                style={{minHeight:36,minWidth:36,alignItems:'center',justifyContent:'center'}}><PrototypeIcon name="more" size={17} color={colors.secondary}/></Pressable></View>
            {item.reply_to_id?<Text style={{marginTop:3,fontSize:10,color:colors.secondary}}>回复评论</Text>:null}
            <Text style={{marginTop:4,fontSize:13,lineHeight:23,color:colors.fg}}>{item.body}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="回复这条评论" onPress={()=>onReplyTarget?.({id:item.id,label:'这条评论'})}
              style={{marginTop:7,minWidth:38,minHeight:32,flexDirection:'row',alignItems:'center',gap:4}}>
              <PrototypeIcon name="chat" size={16} color={colors.secondary}/><Text style={{fontSize:10,color:colors.secondary}}>回复</Text></Pressable>
          </>:<Text style={{fontSize:13,color:colors.secondary}}>此评论不可用</Text>}</View></View>;
      })}{cursor?<Pressable accessibilityRole="button" onPress={()=>void loadMore()} style={{minHeight:48,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:13,fontWeight:'500',color:colors.fg}}>加载更多评论</Text></Pressable>:null}</View>}
    <Modal transparent visible={!!menuComment} animationType="slide" onRequestClose={()=>setMenuComment(null)}>
      <View style={{flex:1,justifyContent:'flex-end',backgroundColor:'#00000038'}}>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭评论操作" onPress={()=>setMenuComment(null)} style={{flex:1}}/>
        <View style={{backgroundColor:colors.bg,borderTopLeftRadius:24,borderTopRightRadius:24,padding:17,paddingBottom:24}}>
          <View style={{width:29,height:3,borderRadius:3,backgroundColor:colors.secondary,opacity:0.4,alignSelf:'center'}}/>
          <Text accessibilityRole="header" style={{fontSize:17,fontWeight:'600',color:colors.fg,textAlign:'center',marginVertical:17}}>评论操作</Text>
          {(menuComment && 'author_id' in menuComment && owner===menuComment.author_id ?
            [['edit','编辑评论','暂时不可用'],['trash','删除评论','暂时不可用']] :
            [['mute','屏蔽作者','暂时不可用'],['block','拉黑作者',''],['flag','举报评论','']]
          ).map(([icon,label,detail])=>{
            const content=<><PrototypeIcon name={icon as 'edit'|'trash'|'mute'|'block'|'flag'} size={19} color={colors.secondary}/>
              <Text style={{fontSize:13,color:colors.fg,flex:1}}>{label}</Text>{detail?<Text style={{fontSize:10,color:colors.secondary}}>{detail}</Text>:null}</>;
            const style={minHeight:56,flexDirection:'row' as const,alignItems:'center' as const,gap:11,borderBottomWidth:1,borderBottomColor:colors.line};
            return icon==='flag'||icon==='block'?<Pressable key={label} accessibilityRole="button" accessibilityLabel={label}
              accessibilityState={{disabled:menuBusy}} disabled={menuBusy}
              onPress={()=>{if(icon==='block'){void blockCommentAuthor();return;}
                if(menuComment){const id=menuComment.id;setMenuComment(null);router.push({pathname:'/report',params:{kind:'comment',id}});}}}
              style={style}>{content}</Pressable>:<View key={label} style={style}>{content}</View>;
          })}
          {menuMessage?<Text accessibilityRole="alert" style={{fontSize:12,color:colors.secondary,paddingVertical:9}}>{menuMessage}</Text>:null}
          <Pressable accessibilityRole="button" accessibilityLabel="关闭评论操作" onPress={()=>setMenuComment(null)} style={{minHeight:45,alignItems:'center',justifyContent:'center'}}>
            <PrototypeIcon name="close" size={20} color={colors.secondary}/></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}

type PendingComment={body:string;operationId:string;phase:'unknown'|'failed'};
const pendingKey=(postId:string,accountId:string)=>`agoraweave.comment.v1.${postId}.${accountId}`;
async function savePending(postId:string,accountId:string,value:PendingComment|null){
  const key=pendingKey(postId,accountId);
  if(!value){await SecureStore.deleteItemAsync(`${key}.head`);return;}
  const chunks:string[]=[],raw=JSON.stringify(value);let chunk='';
  for(const character of raw){if(chunk.length+character.length>400){chunks.push(chunk);chunk='';}chunk+=character;}
  if(chunk)chunks.push(chunk);
  if(chunks.length>99)throw new Error('评论过长，无法安全保存');
  for(let index=0;index<chunks.length;index++)await SecureStore.setItemAsync(`${key}.${index}`,chunks[index]);
  await SecureStore.setItemAsync(`${key}.head`,String(chunks.length));
}
async function readPending(postId:string,accountId:string):Promise<PendingComment|null>{
  const key=pendingKey(postId,accountId),head=await SecureStore.getItemAsync(`${key}.head`);
  if(!head || !/^[1-9][0-9]?$/.test(head))return null;
  const chunks=await Promise.all(Array.from({length:Number(head)},(_,index)=>SecureStore.getItemAsync(`${key}.${index}`)));
  if(chunks.some(chunk=>chunk===null))return null;
  try {const value:unknown=JSON.parse(chunks.join(''));
    if(value && typeof value==='object' && 'body' in value && 'operationId' in value && 'phase' in value &&
      typeof value.body==='string' && value.body.length<=12000 && typeof value.operationId==='string' && uuid.test(value.operationId) &&
      (value.phase==='unknown' || value.phase==='failed'))return value as PendingComment;
  } catch { /* Ignore corrupt local state. */ }
  return null;
}

export function ReplyDock({postId,onSubmitted,target,onClearTarget}:{postId:string;onSubmitted?:()=>void;target?:ReplyTarget|null;onClearTarget?:()=>void}){
  const colors=themeFor(useColorScheme());
  const [body,setBody]=useState(''),[phase,setPhase]=useState<'editing'|'failed'|'unknown'>('editing');
  const [operationId,setOperationId]=useState(randomUUID()),[owner,setOwner]=useState<string|null>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[expanded,setExpanded]=useState(false);
  useEffect(()=>{let active=true;setBody('');setPhase('editing');setOperationId(randomUUID());setMessage('');
    void currentProfileSession().then(async current=>{if(!active || !current)return;setOwner(current.accountId);
      const saved=await readPending(postId,current.accountId);if(active && saved){setBody(saved.body);setOperationId(saved.operationId);setPhase(saved.phase);
        setMessage(saved.phase==='unknown'?'上次评论结果待确认，请先查询原操作':'上次评论未提交成功，文字已保留');}}).catch(()=>{});
    return()=>{active=false;};},[postId]);
  const count=countVisibleCharacters(body);
  const edit=(value:string)=>{if(phase==='unknown')return;setBody(value);setPhase('editing');setMessage('');setOperationId(randomUUID());};
  const submit=async()=>{
    if(busy || phase==='unknown' || target)return;
    const normalized=normalizeText(body);
    if(!normalized.trim() || countVisibleCharacters(normalized)>2000){setMessage('请填写不超过 2000 字的评论');return;}
    setBusy(true);setMessage('');let accountId=owner;let op=operationId;
    try {const current=await currentProfileSession();
      if(!current){setMessage('请登录后评论，输入已保留');return;}
      if(accountId && accountId!==current.accountId){setMessage('账号已变化，请重新打开帖子');return;}
      accountId=current.accountId;setOwner(accountId);op=phase==='failed'?randomUUID():operationId;setOperationId(op);
      await savePending(postId,accountId,{body:normalized,operationId:op,phase:'unknown'});setPhase('unknown');
      const receipt=await write(current.session.access_token,postId,{operation_id:op,body:normalized});
      await savePending(postId,accountId,null);setBody('');setOperationId(randomUUID());setPhase('editing');
      setMessage(receipt.publication_state==='published'?'评论已发布':'评论已受理，等待审核或发布');onSubmitted?.();
    } catch(error){if(error instanceof CommentError){const next=error.unknown?'unknown':'failed';setPhase(next);setMessage(error.message);
        if(accountId)try {await savePending(postId,accountId,{body:normalized,operationId:op,phase:next});}
        catch {setMessage('本机未能保存评论状态，请勿关闭页面');}}
      else setMessage(error instanceof Error?error.message:'暂时无法保存评论，请重试');
    } finally {setBusy(false);}
  };
  const queryOriginal=async()=>{
    if(busy || phase!=='unknown')return;setBusy(true);setMessage('正在查询原操作…');
    try {const current=await currentProfileSession();
      if(!current || owner && current.accountId!==owner){setMessage('请使用原账号登录后查询评论');return;}
      const operation=await accounts.operation(current.session.access_token,operationId);
      if(operation.operation_id!==operationId || operation.action!=='comment.create'){setMessage('查询结果与评论操作不匹配，请稍后再查');return;}
      if(operation.state==='succeeded'){
        if(!isRevisionReceipt(operation.result,operationId)){setMessage('原评论已记录，但回执不完整，请稍后再查');return;}
        await savePending(postId,current.accountId,null);setBody('');setOperationId(randomUUID());setPhase('editing');
        setMessage('原评论已受理');onSubmitted?.();
      } else if(operation.state==='failed'){setPhase('failed');await savePending(postId,current.accountId,{body,operationId,phase:'failed'});
        setMessage('原评论操作失败，文字已保留，可修改后重试');}
      else setMessage('评论结果仍待确认，请稍后再查');
    } catch {setMessage('暂时无法确认原评论，文字和操作号已保留');}
    finally {setBusy(false);}
  };
  return <View style={{backgroundColor:colors.bg,paddingHorizontal:12,paddingTop:8,paddingBottom:6}}>
    {target?<View style={{paddingHorizontal:10,paddingBottom:4,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <Text style={{fontSize:11,color:colors.secondary}}>定向回复暂未开放</Text>
      <Pressable accessibilityRole="button" onPress={onClearTarget} style={{minHeight:32,justifyContent:'center'}}>
        <Text style={{fontSize:11,color:colors.fg}}>改为评论帖子</Text></Pressable></View>:null}
    {message?<Text accessibilityRole="alert" style={{paddingHorizontal:10,paddingBottom:5,fontSize:11,color:colors.secondary}}>{message}</Text>:null}
    {count>1800 || expanded?<Text style={{paddingHorizontal:10,paddingBottom:4,textAlign:'right',fontSize:10,color:count>2000?colors.error:colors.secondary}}>{count}/2000</Text>:null}
    {phase==='unknown'?<Pressable accessibilityRole="button" onPress={()=>void queryOriginal()} disabled={busy}
      style={{minHeight:36,justifyContent:'center',paddingHorizontal:10}}><Text style={{fontSize:12,color:colors.fg}}>查询评论原操作</Text></Pressable>:null}
    <View style={{minHeight:53,borderRadius:29,borderWidth:1,borderColor:colors.line,backgroundColor:colors.surface,
      flexDirection:'row',alignItems:'center',paddingHorizontal:8,gap:8}}>
      <Avatar initial="我" size={29}/>
      <TextInput accessibilityLabel="评论内容" placeholder="发布你的评论" placeholderTextColor={colors.secondary} value={body}
        onChangeText={edit} editable={!busy && phase!=='unknown'} multiline textAlignVertical="top"
        style={{flex:1,minWidth:0,minHeight:expanded?110:35,maxHeight:expanded?160:90,color:colors.fg,fontSize:12,paddingVertical:7}}/>
      <Pressable accessibilityRole="button" accessibilityLabel="评论图片暂未开放" onPress={()=>setMessage('评论图片暂未开放；当前支持文字评论')}
        style={{width:30,minHeight:36,alignItems:'center',justifyContent:'center'}}><PrototypeIcon name="image" size={20} color={colors.secondary}/></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="评论 GIF 暂未开放" onPress={()=>setMessage('评论 GIF 暂未开放；当前支持文字评论')}
        style={{width:30,minHeight:36,alignItems:'center',justifyContent:'center'}}><PrototypeIcon name="gif" size={20} color={colors.secondary}/></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={expanded?'收起评论输入':'展开评论输入'} onPress={()=>setExpanded(value=>!value)}
        style={{width:30,minHeight:36,alignItems:'center',justifyContent:'center'}}><PrototypeIcon name="expand" size={20} color={colors.secondary}/></Pressable>
      {body.trim() && phase!=='unknown'?<Pressable accessibilityRole="button" accessibilityLabel="发布评论"
        accessibilityState={{disabled:busy || count>2000 || !!target,busy}} disabled={busy || count>2000 || !!target} onPress={()=>void submit()}
        style={{width:29,height:29,borderRadius:15,backgroundColor:colors.fg,alignItems:'center',justifyContent:'center',opacity:busy?0.5:1}}>
        {busy?<ActivityIndicator color={colors.bg} size="small"/>:<PrototypeIcon name="up" size={16} color={colors.bg}/>}</Pressable>:null}
    </View>
  </View>;
}
