import {Pressable,Text,View,useColorScheme} from 'react-native';
import {themeFor} from '../../../../../packages/design/src/tokens';
import {PrototypeIcon,type PrototypeIconName} from './PrototypeIcon';

export type MainTab='home'|'discover'|'ai'|'messages'|'me';
const tabs:{id:MainTab;label:string;icon:PrototypeIconName}[]=[
  {id:'home',label:'首页',icon:'home'},{id:'discover',label:'发现',icon:'search'},
  {id:'ai',label:'AI',icon:'ai'},{id:'messages',label:'私信',icon:'chat'},
  {id:'me',label:'我的',icon:'user'},
];

export function ShellHeader({title,left,right}:{title:string;left?:React.ReactNode;right?:React.ReactNode}) {
  const colors=themeFor(useColorScheme());
  return <View style={{height:56,flexDirection:'row',alignItems:'center',backgroundColor:colors.bg,paddingHorizontal:12}}>
    <View style={{width:92,flexDirection:'row',alignItems:'center'}}>{left}</View>
    <Text accessibilityRole="header" numberOfLines={1} style={{flex:1,textAlign:'center',fontSize:19,fontWeight:'700',color:colors.fg}}>{title}</Text>
    <View style={{width:92,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>{right}</View>
  </View>;
}

export function BottomTabs({active,onChange}:{active:MainTab;onChange:(tab:MainTab)=>void}) {
  const colors=themeFor(useColorScheme());
  return <View style={{height:59,borderTopWidth:1,borderTopColor:colors.line,flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:colors.bg}}>
    {tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{selected:active===tab.id}}
      onPress={()=>onChange(tab.id)} style={({pressed})=>({width:54,height:49,alignItems:'center',justifyContent:'center',opacity:pressed?0.6:1})}>
      <PrototypeIcon name={tab.icon} size={25} color={active===tab.id?colors.fg:colors.secondary}/>
    </Pressable>)}
  </View>;
}

