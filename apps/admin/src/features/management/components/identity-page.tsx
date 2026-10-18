'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useManagement } from '../session-context';

export function IdentityManagement() {
  const administrator = useManagement();
  return <div className='flex min-w-0 flex-col gap-5'>
    <Card><CardHeader><CardTitle>当前管理身份</CardTitle></CardHeader><CardContent className='grid gap-4 sm:grid-cols-2'>
      <div><p className='text-muted-foreground text-xs'>账号</p><p>{administrator?.account.phone_masked}</p></div>
      <div><p className='text-muted-foreground text-xs'>环境</p><p>{administrator?.environment}</p></div>
      <div><p className='text-muted-foreground mb-2 text-xs'>当前角色</p><div className='flex flex-wrap gap-2'>{administrator?.roles.map(role => <Badge variant='outline' key={role}>{role}</Badge>)}</div></div>
      <div><p className='text-muted-foreground text-xs'>多因素验证</p><p>{administrator?.mfa.aal === 'aal2' && administrator.mfa.verified ? '已验证认证器' : '需要验证'}</p></div>
    </CardContent></Card>
  </div>;
}
