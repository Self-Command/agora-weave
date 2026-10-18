import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: '处罚管理' };

export default function SanctionsPage() {
  return <PageContainer pageTitle='处罚管理' pageDescription='查看处罚能力的当前接入状态。'>
    <Card>
      <CardHeader><CardTitle>处罚记录暂不可读取</CardTitle></CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <p role='status'>当前管理契约尚无处罚列表读取接口，无法展示真实记录和状态。</p>
        <p className='text-muted-foreground'>功能限制、临时封禁、永久封禁及撤销必须分别核对目标、期限、理由和当前权限。具体动作绑定的再次验证与后端处置接通后才能提交；目前不可创建或撤销处罚。</p>
      </CardContent>
    </Card>
  </PageContainer>;
}
