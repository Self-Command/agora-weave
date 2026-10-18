import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { InteractiveGridPattern } from '@/features/auth/components/interactive-grid';

export function ManagementAuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main lang='zh-CN' className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
    <div className='bg-sidebar text-sidebar-foreground relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
      <div className='relative z-20 text-lg font-medium'>AgoraWeave 管理</div>
      <InteractiveGridPattern className='mask-[radial-gradient(400px_circle_at_center,white,transparent)] inset-x-0 inset-y-[0%] h-full skew-y-12' />
      <div className='relative z-20 mt-auto space-y-2'><p className='text-lg'>安全、清晰地管理社区。</p><p className='text-sidebar-foreground/70 text-sm'>仅限已获授权的管理员。登录后需验证认证器。</p></div>
    </div>
    <div className='flex w-full flex-col items-center justify-center gap-4 p-4 lg:p-8'>
      <div className='flex w-full max-w-md justify-end'><ThemeModeToggle /></div>
      <Card className='w-full max-w-md'><CardHeader><CardTitle><h1 className='text-xl font-semibold'>{title}</h1></CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>
    </div>
  </main>;
}
