import {Image,Text,View} from 'react-native';
import {AppButton} from './AppChrome';

/** Shared editable image preview for profile media fields. */
export function AppMediaField({label,uri,initial,onPick,disabled=false,shape}:{label:string;uri?:string|null;
  initial?:string;onPick:()=>void;disabled?:boolean;shape:'avatar'|'banner'}){
  if(shape==='avatar')return <View className="flex-row items-center gap-4 rounded-xl bg-surface p-4">
    <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-bg">
      {uri?<Image source={{uri}} accessibilityLabel={label} style={{width:80,height:80}} resizeMode="cover"/>:
        <Text className="text-[24px] font-semibold text-secondary">{(initial||'人').slice(0,1)}</Text>}
    </View>
    <View className="flex-1 gap-2"><Text className="text-[14px] font-semibold text-fg">{label}</Text>
      <View className="self-start"><AppButton label={`选择${label}`} onPress={onPick} disabled={disabled} compact/></View></View>
  </View>;
  return <View className="gap-3">
    <Text className="text-[12px] font-medium text-secondary">{label}</Text>
    <View className="h-24 items-center justify-center overflow-hidden rounded-xl bg-surface">
      {uri?<Image source={{uri}} accessibilityLabel={label} style={{width:'100%',height:96}} resizeMode="cover"/>:
        <Text className="text-[12px] text-secondary">尚未设置{label}</Text>}
    </View>
    <View className="self-start"><AppButton label={`选择${label}`} onPress={onPick} disabled={disabled} compact/></View>
  </View>;
}
