import { Text,View } from 'react-native';
import type { components } from '../../../../packages/contracts/src/generated/app';
import { AppButton } from './AppChrome';

export type OwnedRevision=components['schemas']['ContentRevision'];
export const reviewLabels={pending:'待审核',approved:'审核通过',rejected:'审核未通过'} as const;
export const publicationLabels={preparing:'准备中',awaiting_review:'等待审核',published:'已发布',rejected:'未通过',restricted:'已受限',failed:'失败',cancelled:'已取消'} as const;

/** Shared presentation of the author's private revision status, separate from public post cards. */
export function ContentRevisionCard({item,onOpen,onManage}:{item:OwnedRevision;onOpen:()=>void;onManage?:()=>void}) {
  return <View className="gap-2 border-b border-line px-6 py-5">
    <Text className="text-[14px] font-semibold text-fg">{reviewLabels[item.review_state]} · {publicationLabels[item.publication_state]}</Text>
    <Text className="text-[12px] text-secondary">{item.submitted_at.slice(0,10)} · 编号 {item.resource_id.slice(0,8)}</Text>
    {item.body?<Text className="text-[15px] leading-7 text-fg">{item.body}</Text>:null}
    {item.media_refs.length?<Text className="text-[12px] text-secondary">{item.media_refs.length} 张图片</Text>:null}
    {item.review_state==='pending'?<Text className="text-[12px] leading-5 text-secondary">已受理，审核通过后才会按可见范围展示。</Text>:null}
    {item.publication_state==='published'?<AppButton label="查看帖子" tone="text" onPress={onOpen}/>:null}
    {onManage?<AppButton label="管理内容" tone="outline" onPress={onManage}/>:null}
  </View>;
}
