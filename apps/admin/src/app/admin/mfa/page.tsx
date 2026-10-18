import { redirect } from 'next/navigation';
import { readManagementIdentity } from '@/lib/management-server';
import { ManagementAuthShell } from '@/features/management/components/auth-shell';
import { ManagementMfaForm } from '@/features/management/components/mfa-form';
import { LogoutButton } from '@/features/management/components/logout-button';
export const dynamic = 'force-dynamic';
export const metadata = { title: '管理员多因素验证', robots: { index: false, follow: false } };
export default async function AdminMfa() {
  const current = await readManagementIdentity(false);
  if (current.status === 401) redirect('/admin/login');
  return <ManagementAuthShell title='管理员多因素验证' description='请输入当前认证器生成的六位验证码。'>
    {current.administrator ? <ManagementMfaForm /> : <div className='space-y-4'><p role='alert'>{(current.body as { message?: string }).message}</p><LogoutButton /></div>}
  </ManagementAuthShell>;
}
