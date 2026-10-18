import PageContainer from '@/components/layout/page-container';
import { AccountsManagement } from '@/features/management/components/accounts-page';

export const metadata = { title: '账号列表' };

export default function AccountsPage() {
  return <PageContainer pageTitle='账号列表' pageDescription='查看当前获准读取的账号。'><AccountsManagement /></PageContainer>;
}
