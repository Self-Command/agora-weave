import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { readManagementIdentity } from '@/lib/management-server';
import { ManagementProvider } from '@/features/management/session-context';
import { ManagementHeader } from '@/features/management/components/header';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const preview = (await headers()).get('x-agoraweave-admin-surface') === 'preview';
  const current = preview ? null : await readManagementIdentity();
  if (current && !current.administrator) {
    if (current.status === 401) redirect('/admin/login');
    if ((current.body as { code?: string }).code === 'MFA_REQUIRED') redirect('/admin/mfa');
    return <main className='mx-auto max-w-lg p-8'><Alert variant='destructive'><AlertTitle>管理入口不可用</AlertTitle><AlertDescription>{(current.body as { message?: string }).message}</AlertDescription></Alert><Link href='/admin/login' className='mt-4 inline-block underline'>返回管理登录</Link></main>;
  }
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <ManagementProvider identity={current?.administrator ?? null}><KBar>
      <SidebarProvider defaultOpen={defaultOpen} lang={preview ? 'en' : 'zh-CN'}>
        <a
          href='#main-content'
          className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
        >
          Skip to content
        </a>
        <AppSidebar />
        <SidebarInset id='main-content' tabIndex={-1} className='scroll-mt-16'>
          {preview ? <Header /> : <ManagementHeader />}
          <InfobarProvider defaultOpen={false}>
            <div className='flex min-w-0 flex-1 flex-col'>
            {preview ? <Alert className='mx-4 mt-4 w-auto' role='status' data-testid='template-preview-notice'>
              <AlertTitle>仅本机开发预览 · Kiranism 官方模板</AlertTitle>
              <AlertDescription>页面中的账号、指标、消息和操作均为上游合成样例，未连接 AgoraWeave 真实管理员身份、MFA 或业务数据。此预览不授予管理权限。</AlertDescription>
            </Alert> : null}
            {children}
            </div>
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar></ManagementProvider>
  );
}
