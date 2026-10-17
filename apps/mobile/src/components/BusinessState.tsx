import { ActivityIndicator,Text,View,useColorScheme } from 'react-native';
import { statePresentation,type BusinessState as State } from '../../../../packages/design/src/states';
import { themeFor } from '../../../../packages/design/src/tokens';
import { Action } from '../features/account/components';

export function BusinessState({ state,onRetry,onQuery }: { state:State;onRetry?:()=>void;onQuery?:()=>void }) {
  const value=statePresentation(state),colors=themeFor(useColorScheme());
  return <View accessibilityLiveRegion={value.announcement} accessibilityState={{ busy:value.busy }} className="py-[32px] gap-[16px] items-start">
    {value.busy ? <ActivityIndicator color={colors.secondary} accessibilityLabel="正在加载" /> : null}
    <Text accessibilityRole="header" className="text-[23px] font-semibold text-fg">{value.title}</Text>
    <Text className="text-body leading-[26px] text-secondary">{value.description}</Text>
    {value.canRetry && onRetry ? <Action title="重试" onPress={onRetry} /> : null}
    {value.canQuery && onQuery ? <Action title="查询结果" onPress={onQuery} /> : null}
  </View>;
}
