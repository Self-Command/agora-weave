import PageContainer from '@/components/layout/page-container';
import { ContentReviewList } from '@/features/management/components/moderation-list';

export const metadata = { title: '内容审核' };

export default function ContentReviewPage() {
  return <PageContainer pageTitle='内容审核' pageDescription='查看当前获准读取的内容修订及审核状态。'><ContentReviewList /></PageContainer>;
}
