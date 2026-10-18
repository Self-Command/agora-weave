import PageContainer from '@/components/layout/page-container';
import { ReportCaseList } from '@/features/management/components/moderation-list';

export const metadata = { title: '举报案件' };

export default function ReportCasesPage() {
  return <PageContainer pageTitle='举报案件' pageDescription='查看当前获准读取的案件摘要和处理状态。'><ReportCaseList /></PageContainer>;
}
