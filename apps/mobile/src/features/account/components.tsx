import { Platform, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Button, Host, Text as ComposeText } from '@expo/ui/jetpack-compose';

export function useAccountColors() {
  return useColorScheme() === 'dark' ? { bg: '#111113',fg: '#f2f2f4',secondary: '#b0b0ba',surface: '#1c1c21',line: '#42424b',accent: '#a49df1',error: '#ffb4ab' }
    : { bg: '#ffffff',fg: '#18181b',secondary: '#60606c',surface: '#f5f5f7',line: '#d4d4dc',accent: '#6965d8',error: '#b3261e' };
}
export function Action({ title,onPress,disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  const colors = useAccountColors();
  if (Platform.OS === 'android') return <Host matchContents style={styles.action} seedColor={colors.accent}>
    <Button enabled={!disabled} onClick={onPress} contentPadding={{ top: 14,bottom: 14,start: 24,end: 24 }}>
      <ComposeText>{title}</ComposeText>
    </Button>
  </Host>;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.fallback,{ backgroundColor: colors.accent,opacity: disabled ? 0.5 : 1 }]}>
    <Text style={{ color: colors.bg,fontSize: 16,fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ action: { minHeight: 48,alignSelf: 'flex-start',marginVertical: 4 },
  fallback: { minHeight: 48,borderRadius: 24,paddingHorizontal: 24,paddingVertical: 12,justifyContent: 'center',alignItems: 'center' } });
