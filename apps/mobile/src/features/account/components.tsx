import { Platform, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Button, Host, Text as ComposeText } from '@expo/ui/jetpack-compose';
import { themeFor } from '../../../../../packages/design/src/tokens';

export function useAccountColors() {
  return themeFor(useColorScheme());
}
export function Action({ title,onPress,disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  const colors = useAccountColors();
  const colorScheme=useColorScheme()==='dark'?'dark':'light';
  if (Platform.OS === 'android') return <Host matchContents style={styles.action} colorScheme={colorScheme}>
    <Button enabled={!disabled} onClick={onPress} colors={{ containerColor:colors.fg,contentColor:colors.bg }} contentPadding={{ top: 14,bottom: 14,start: 24,end: 24 }}>
      <ComposeText>{title}</ComposeText>
    </Button>
  </Host>;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.fallback,{ backgroundColor: colors.fg,opacity: disabled ? 0.5 : 1 }]}>
    <Text style={{ color: colors.bg,fontSize: 16,fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ action: { minHeight: 48,alignSelf: 'flex-start',marginVertical: 4 },
  fallback: { minHeight: 48,borderRadius: 24,paddingHorizontal: 24,paddingVertical: 12,justifyContent: 'center',alignItems: 'center' } });
