import { ManagementAuthShell } from '@/features/management/components/auth-shell';
import { ManagementLoginForm } from '@/features/management/components/login-form';
import { cookies } from 'next/headers';
import { managementCookie } from '@/lib/management-session';
export const dynamic = 'force-dynamic';
export const metadata = { title: '管理员登录', robots: { index: false, follow: false } };
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ logout?: string; operation?: string }> }) {
  const params = await searchParams;
  const operation = /^[a-f0-9-]{36}$/i.test(params.operation ?? '') ? params.operation : undefined;
  return <ManagementAuthShell title='管理员登录' description='验证手机号后，继续完成多因素验证。'><ManagementLoginForm logout={params.logout} operation={operation} canRefresh={(await cookies()).has(managementCookie().name)} /></ManagementAuthShell>;
}
