import PageContainer from '@/components/layout/page-container';
import { AppealReviewList } from '@/features/management/components/moderation-list';

export const metadata = { title: '申诉复核' };

export default function AppealsPage() {
  return <PageContainer pageTitle='申诉复核' pageDescription='查看当前获准读取的申诉与独立复核状态。'><AppealReviewList /></PageContainer>;
}
