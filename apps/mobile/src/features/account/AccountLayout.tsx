import { useState,type ReactNode } from 'react';
import { KeyboardAvoidingView,Modal,Platform,Pressable,ScrollView,Text,TextInput,View,useColorScheme,type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeFor } from '../../../../../packages/design/src/tokens';
import {AppIcon,type AppIconName} from '../../components/AppIcon';
import {AppButton,AppFrame} from '../../components/AppChrome';

export type AccountIconName=Extract<AppIconName,'back'|'close'|'refresh'|'phone'|'desktop'|'shield'|'key'|'right'|'alert'|'clock'|'file'|'check'>;
export function AccountIcon({name,size=23,color}:{name:AccountIconName;size?:number;color?:string}){
  return <AppIcon name={name} size={size} color={color}/>;
}

export function AccountFrame({ title,onBack,onClose,onRefresh,bodyClassName='',children }: {
  title:string;onBack:()=>void;onClose?:()=>void;onRefresh?:()=>void;bodyClassName?:string;children:ReactNode;
}) {
  return <AppFrame title={title} onBack={onBack} onRefresh={onRefresh}
    right={!onRefresh && onClose?<Pressable accessibilityRole="button" accessibilityLabel="关闭" onPress={onClose}
      className="min-h-12 min-w-12 items-center justify-center rounded-xl"><AppIcon name="close"/></Pressable>:undefined}>
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow:1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View className={`flex-1 gap-6 px-[22px] pt-[34px] pb-7 ${bodyClassName}`}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </AppFrame>;
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
  return <AppButton label={title} tone={secondary?'outline':'primary'} onPress={onPress}
    disabled={disabled} busy={busy} fullWidth testID={testID}/>;
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
