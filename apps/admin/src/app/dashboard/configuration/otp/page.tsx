import PageContainer from '@/components/layout/page-container';
import { OtpConfigurationEditor } from '@/features/management/components/otp-configuration';
export const metadata = { title: '验证码配置' };
export default function OtpConfigurationPage() {
  return <PageContainer pageTitle='验证码配置' pageDescription='查看发送与验证限制，预览变更并验证后生效。'><OtpConfigurationEditor /></PageContainer>;
}
