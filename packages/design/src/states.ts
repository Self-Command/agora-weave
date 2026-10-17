export const stateCopy = {
  loading: { title:'正在加载',description:'请稍候。',announcement:'polite' },
  empty: { title:'暂无内容',description:'有新内容时会显示在这里。',announcement:'polite' },
  error: { title:'暂时无法加载',description:'请检查网络后重试，已填写的内容会保留。',announcement:'assertive' },
  unavailable: { title:'内容不可用',description:'内容可能已变更，或你当前没有访问资格。',announcement:'polite' },
  forbidden: { title:'当前操作不可用',description:'你当前没有此操作的权限，已填写的内容会保留。',announcement:'polite' },
  incompatible: { title:'需要更新客户端',description:'当前版本暂不支持此功能，请更新后重试，已填写的内容会保留。',announcement:'polite' },
  pending: { title:'结果确认中',description:'请先查询处理结果，避免重复提交。',announcement:'polite' },
} as const;
export type BusinessState = keyof typeof stateCopy;
export function statePresentation(state: BusinessState) {
  return { ...stateCopy[state],busy:state==='loading',canRetry:state==='error',canQuery:state==='pending' };
}
