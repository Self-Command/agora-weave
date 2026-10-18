import PageContainer from '@/components/layout/page-container';
import { IdentityManagement } from '@/features/management/components/identity-page';
export const metadata = { title: '管理身份' };
export default function IdentityPage() {
  return <PageContainer pageTitle='管理身份' pageDescription='查看当前管理资格与多因素验证状态。'><IdentityManagement /></PageContainer>;
}
