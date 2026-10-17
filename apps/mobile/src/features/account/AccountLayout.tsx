import { useState,type ReactNode } from 'react';
import { ActivityIndicator,Image,KeyboardAvoidingView,Modal,Platform,Pressable,ScrollView,Text,TextInput,View,useColorScheme,type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeFor } from '../../../../../packages/design/src/tokens';
import backIcon from './icons/back.png';
import closeIcon from './icons/close.png';
import refreshIcon from './icons/refresh.png';
import phoneIcon from './icons/phone.png';
import desktopIcon from './icons/desktop.png';
import shieldIcon from './icons/shield.png';
import keyIcon from './icons/key.png';
import rightIcon from './icons/right.png';
import alertIcon from './icons/alert.png';
import clockIcon from './icons/clock.png';
import fileIcon from './icons/file.png';
import checkIcon from './icons/check.png';

const icons = {
  back: { ios:'chevron.left',android:backIcon },
  close: { ios:'xmark',android:closeIcon },
  refresh: { ios:'arrow.clockwise',android:refreshIcon },
  phone: { ios:'iphone',android:phoneIcon },
  desktop: { ios:'desktopcomputer',android:desktopIcon },
  shield: { ios:'checkmark.shield',android:shieldIcon },
  key: { ios:'key',android:keyIcon },
  right: { ios:'chevron.right',android:rightIcon },
  alert: { ios:'exclamationmark.circle',android:alertIcon },
  clock: { ios:'clock',android:clockIcon },
  file: { ios:'doc.text',android:fileIcon },
  check: { ios:'checkmark',android:checkIcon },
} as const;
export type AccountIconName = keyof typeof icons;
export function AccountIcon({ name,size=23,color }: { name:AccountIconName;size?:number;color?:string }) {
  const colors=themeFor(useColorScheme());
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width:size,height:size }}>
    <Image source={icons[name].android} tintColor={color || colors.fg} resizeMode="contain" style={{ width:size,height:size }} />
  </View>;
}
function HeaderAction({ name,label,onPress }: { name:AccountIconName;label:string;onPress:()=>void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="min-h-12 min-w-12 items-center justify-center rounded-xl">
    <AccountIcon name={name} />
  </Pressable>;
}
export function AccountFrame({ title,onBack,onClose,onRefresh,bodyClassName='',children }: {
  title:string;onBack:()=>void;onClose?:()=>void;onRefresh?:()=>void;bodyClassName?:string;children:ReactNode;
}) {
  const colors=themeFor(useColorScheme());
  return <SafeAreaView edges={['top','left','right','bottom']} style={{ flex:1,backgroundColor:colors.bg }}>
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS==='ios'?'padding':'height'}>
      <View className="min-h-14 flex-row items-center border-b border-line px-3">
        <View className="w-16 items-start"><HeaderAction name="back" label="返回" onPress={onBack} /></View>
        <Text accessibilityRole="header" className="flex-1 text-center text-[18px] font-bold text-fg">{title}</Text>
        <View className="w-16 items-end">{onRefresh ? <HeaderAction name="refresh" label="刷新设备列表" onPress={onRefresh} /> :
          onClose ? <HeaderAction name="close" label="关闭" onPress={onClose} /> : null}</View>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow:1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View className={`flex-1 gap-6 px-[22px] pt-[34px] pb-7 ${bodyClassName}`}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function AccountIntro({ title,copy,compact=false }: { title:string;copy:string;compact?:boolean }) {
  return <View>
    <Text accessibilityRole="header" className={`${compact?'text-[23px]':'text-[25px]'} font-semibold leading-[36px] text-fg`}>{title}</Text>
    <Text className="mt-[10px] text-[13px] leading-6 text-secondary">{copy}</Text>
  </View>;
}
export function AccountButton({ title,onPress,disabled=false,busy=false,secondary=false,testID }: {
  title:string;onPress:()=>void;disabled?:boolean;busy?:boolean;secondary?:boolean;testID?:string;
}) {
  const colors=themeFor(useColorScheme());
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled:disabled||busy,...(busy?{busy:true}:{}) }}
    onPress={onPress} disabled={disabled||busy} className={`min-h-12 w-full flex-row items-center justify-center gap-2 rounded-[24px] px-[18px] py-3 ${secondary?'border border-line bg-bg':'bg-fg'}`}
    style={({pressed})=>({ opacity:disabled||busy?0.45:pressed?0.75:1 })}>
    {busy ? <ActivityIndicator size="small" color={secondary?colors.fg:colors.bg} /> : null}
    <Text className={`text-center text-[14px] font-medium leading-[23px] ${secondary?'text-fg':'text-bg'}`}>{title}</Text>
  </Pressable>;
}
export function AccountTextAction({ title,onPress,disabled=false,secondary=false }: {title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} className="min-h-12 items-center justify-center px-[5px] py-[10px]">
    <Text className={`text-center text-[12px] leading-5 ${secondary||disabled?'text-secondary':'text-fg'}`}>{title}</Text>
  </Pressable>;
}
export function AccountNotice({ text,error=false }: {text:string;error?:boolean}) {
  const colors=themeFor(useColorScheme());
  if (!text) return null;
  return <View accessibilityRole={error?'alert':undefined} accessibilityLiveRegion="polite" className="flex-row items-start gap-[10px] rounded-xl bg-surface px-[14px] py-[13px]">
    <View className="pt-[3px]"><AccountIcon name={error?'alert':'shield'} size={17} color={error?colors.error:colors.fg} /></View>
    <Text className={`flex-1 text-[12px] leading-[22px] ${error?'text-error':'text-fg'}`}>{text}</Text>
  </View>;
}
export function AccountFootnote({ children }: {children:ReactNode}) {
  return <Text className="mt-auto pt-5 text-center text-[11px] leading-[21px] text-secondary">{children}</Text>;
}
export function AccountField({ label,error,prefix,code=false,onFocus,onBlur,...props }: TextInputProps & {label:string;error?:string;prefix?:string;code?:boolean}) {
  const colors=themeFor(useColorScheme());
  const [focused,setFocused]=useState(false);
  return <View>
    <Text className="mb-[9px] text-[12px] font-medium text-fg">{label}</Text>
    <View className={`flex-row items-center gap-3 rounded-input border bg-surface px-[15px] ${error?'border-error':focused?'border-control-line':'border-transparent'} ${code?'min-h-[68px]':'min-h-[54px]'}`}>
      {prefix ? <Text className="border-r border-line pr-3 text-[14px] text-fg">{prefix}</Text> : null}
      <TextInput accessibilityLabel={label} accessibilityHint={error} placeholderTextColor={colors.secondary} underlineColorAndroid="transparent"
        onFocus={event=>{setFocused(true);onFocus?.(event);}} onBlur={event=>{setFocused(false);onBlur?.(event);}}
        className={`min-w-0 flex-1 py-[15px] text-fg ${code?'text-center text-[28px] font-medium tracking-[13px]':'text-body'}`} {...props} />
    </View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" className="mt-2 text-[12px] leading-5 text-error">{error}</Text> : null}
  </View>;
}
export function AccountCheck({ checked,disabled=false,label,onChange }: {checked:boolean;disabled?:boolean;label:string;onChange:(value:boolean)=>void}) {
  const colors=themeFor(useColorScheme());
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked,disabled }} disabled={disabled} hitSlop={{left:15,right:15}}
    onPress={()=>onChange(!checked)} className="min-h-12 w-[18px] items-start justify-start pt-3" style={{ opacity:disabled?0.45:1 }}>
    <View className={`h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-control-line ${checked?'bg-fg':'bg-bg'}`}>
      {checked ? <AccountIcon name="check" size={15} color={colors.bg} /> : null}
    </View>
  </Pressable>;
}
export function AccountSheet({ visible,title,copy,onClose,children }: {visible:boolean;title:string;copy?:string;onClose:()=>void;children:ReactNode}) {
  const colors=themeFor(useColorScheme());
  return <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
    <View className="flex-1 justify-end bg-black/25 dark:bg-black/45">
      <Pressable accessibilityRole="button" accessibilityLabel="关闭面板" onPress={onClose} className="absolute inset-0" />
      <View accessibilityViewIsModal className="max-h-[80%] rounded-t-[24px] bg-bg px-5 pt-2">
        <View className="h-1 w-9 self-center rounded-full bg-line" />
        <Text accessibilityRole="header" className="mt-[14px] text-[18px] font-semibold leading-7 text-fg">{title}</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom:8 }}>
          {copy ? <Text className="mt-[10px] mb-[18px] text-[13px] leading-[25px] text-secondary">{copy}</Text> : null}
          {children}
          <AccountTextAction title="返回" onPress={onClose} />
        </ScrollView>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor:colors.bg }} />
      </View>
    </View>
  </Modal>;
}
