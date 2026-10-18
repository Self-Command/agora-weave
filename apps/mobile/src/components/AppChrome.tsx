import {useEffect,useState,type ReactNode} from 'react';
import { ActivityIndicator,Image,Pressable,Text,View,useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeFor } from '../../../../packages/design/src/tokens';
import { AppIcon,type AppIconName } from './AppIcon';

/** Shared chrome for standalone App screens. The main five-tab shell owns its own header. */
export function AppFrame({title,onBack,onRefresh,right,children,footer,embedded=false,hideHeader=false,backIcon='back',backDisabled=false,headerBorder=true}:
  {title:string;onBack?:()=>void;onRefresh?:()=>void;right?:ReactNode;children:ReactNode;footer?:ReactNode;
    embedded?:boolean;hideHeader?:boolean;backIcon?:'back'|'close';backDisabled?:boolean;headerBorder?:boolean}){
  const colors=themeFor(useColorScheme());
  return <SafeAreaView edges={embedded?[]:['top','left','right','bottom']} style={{flex:1,backgroundColor:colors.bg}}>
    {!hideHeader?<View className={`min-h-14 flex-row items-center px-3 ${headerBorder?'border-b border-line':''}`}>
      <View className="w-14 items-start">{onBack?<Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={onBack}
        accessibilityState={{disabled:backDisabled}} disabled={backDisabled}
        className="min-h-12 min-w-12 items-center justify-center"><AppIcon name={backIcon} /></Pressable>:null}</View>
      <Text accessibilityRole="header" numberOfLines={1} className="flex-1 text-center text-[18px] font-bold text-fg">{title}</Text>
      <View className="min-w-14 items-end">{right || (onRefresh?<Pressable accessibilityRole="button" accessibilityLabel="刷新" onPress={onRefresh}
        className="min-h-12 min-w-12 items-center justify-center"><AppIcon name="refresh" /></Pressable>:null)}</View>
    </View>:null}
    {children}
    {footer}
  </SafeAreaView>;
}

export function AppButton({label,onPress,tone='outline',disabled=false,busy=false,compact=false,fullWidth=false,testID}:{label:string;
  onPress:()=>void;tone?:'primary'|'accent'|'outline'|'text';disabled?:boolean;busy?:boolean;compact?:boolean;
  fullWidth?:boolean;testID?:string}){
  const colors=themeFor(useColorScheme());
  const solid=tone==='primary'||tone==='accent';
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:disabled||busy,busy}}
    disabled={disabled||busy} onPress={onPress}
    className={`${compact?'min-h-11':'min-h-12'} ${fullWidth?'w-full':''} flex-row items-center justify-center gap-2 rounded-[24px] px-6 ${tone==='primary'?'bg-fg':tone==='accent'?'bg-accent':tone==='outline'?'border border-line bg-bg':''}`}
    style={({pressed})=>({opacity:disabled||busy?0.45:pressed?0.72:1})}>
    {busy?<ActivityIndicator size="small" color={solid?colors.bg:colors.fg}/>:null}
    <Text className={`${solid?'text-bg':'text-fg'} text-[14px] font-semibold`}>{label}</Text>
  </Pressable>;
}

export function PageStatus({kind,message,actionLabel,onAction}:{kind:'loading'|'guest'|'error';message:string;
  actionLabel?:string;onAction?:()=>void}){
  const colors=themeFor(useColorScheme());
  return <View accessibilityLiveRegion="polite" className="flex-1 items-center justify-center gap-4 px-8">
    {kind==='loading'?<ActivityIndicator color={colors.accent} accessibilityLabel="正在加载"/>:null}
    <Text accessibilityRole={kind==='error'?'alert':undefined} className="text-center text-[14px] leading-6 text-fg">{message}</Text>
    {actionLabel&&onAction?<AppButton label={actionLabel} tone={kind==='guest'?'primary':'outline'} onPress={onAction}/>:null}
  </View>;
}

export function AppEmpty({icon,title,description,action}:{icon:AppIconName;title:string;description:string;
  action?:{label:string;onPress:()=>void}}){
  const colors=themeFor(useColorScheme());
  return <View accessibilityLiveRegion="polite" className="flex-1 items-center justify-center px-8 py-12">
    <AppIcon name={icon} size={30} color={colors.secondary}/>
    <Text className="mt-4 text-center text-[16px] font-semibold text-fg">{title}</Text>
    <Text className="mt-2 text-center text-[13px] leading-5 text-secondary">{description}</Text>
    {action?<View className="mt-5"><AppButton label={action.label} onPress={action.onPress}/></View>:null}
  </View>;
}

export function IconCountAction({icon,label,count,onPress,disabled=false,color}:{icon:AppIconName;label:string;count?:number;
  onPress:()=>void;disabled?:boolean;color?:string}){
  const colors=themeFor(useColorScheme());
  return <Pressable accessibilityRole="button" accessibilityLabel={count===undefined?label:`${label} ${count}`}
    accessibilityState={{disabled}} disabled={disabled} onPress={onPress}
    className="min-h-11 min-w-11 flex-row items-center justify-center gap-1 px-1">
    <AppIcon name={icon} size={19} color={color||colors.secondary}/>
    {count!==undefined?<Text className="text-[12px] text-secondary">{count}</Text>:null}
  </Pressable>;
}

export function IconTap({name,label,onPress,size=23,disabled=false}:{name:AppIconName;label:string;
  onPress:()=>void;size?:number;disabled?:boolean}){
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled}
    onPress={onPress} style={({pressed})=>({width:44,height:44,alignItems:'center',justifyContent:'center',opacity:pressed?0.55:disabled?0.4:1})}>
    <AppIcon name={name} size={size}/>
  </Pressable>;
}

export function Avatar({initial='人',size=38,uri}:{initial?:string;size?:number;uri?:string|null}){
  const colors=themeFor(useColorScheme());
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[uri]);
  return <View accessibilityElementsHidden style={{width:size,height:size,borderRadius:size/2,backgroundColor:colors.surface,
    alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
    {uri&&!failed?<Image source={{uri}} resizeMode="cover" onError={()=>setFailed(true)} style={{width:size,height:size}}/>:
      <Text style={{color:colors.secondary,fontSize:size*0.34,fontWeight:'500'}}>{initial.slice(0,1)}</Text>}
  </View>;
}
