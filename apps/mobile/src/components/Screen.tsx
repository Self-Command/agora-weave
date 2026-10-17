import type { ReactNode } from 'react';
import { KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,View,useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { design,themeFor } from '../../../../packages/design/src/tokens';

export function Screen({ title,children,actions }: { title:string;children:ReactNode;actions?:ReactNode }) {
  const colors=themeFor(useColorScheme());
  return <SafeAreaView style={[styles.safe,{ backgroundColor:colors.bg }]}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={[styles.header,{ borderBottomColor:colors.line }]}>
        <Text accessibilityRole="header" style={[styles.title,{ color:colors.fg }]}>{title}</Text>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({ safe:{ flex:1 },header:{ minHeight:56,padding:design.spacing.lg,borderBottomWidth:StyleSheet.hairlineWidth,
  alignItems:'center',justifyContent:'center',gap:design.spacing.md },title:{ fontSize:design.type.title,fontWeight:'700',textAlign:'center' },
  actions:{ flexDirection:'row',flexWrap:'wrap',gap:design.spacing.sm },body:{ flexGrow:1,padding:design.spacing.xl,gap:design.spacing.xl } });
