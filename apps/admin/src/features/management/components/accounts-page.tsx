'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { managementRequest, ManagementError } from '../client';
import type { AccountList } from '../contracts';
import { useManagement } from '../session-context';
import { ManagementFeedback } from './feedback';

export function AccountsManagement() {
  const administrator = useManagement();
  const canRead = administrator?.permissions.includes('admin.accounts.read') ?? false;
  const [list, setList] = useState<AccountList | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [previous, setPrevious] = useState<(string | null)[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const requestNumber = useRef(0);

  const load = useCallback(async (next: string | null) => {
    const number = ++requestNumber.current;
    setBusy(true);
    setError(undefined);
    setList(null);
    try {
      const query = new URLSearchParams({ limit: '20' });
      if (next) query.set('cursor', next);
      const result = await managementRequest<AccountList>(`/admin/accounts?${query}`);
      if (requestNumber.current !== number) return false;
      setList(result.data);
      setCursor(next);
      return true;
    } catch (failure) {
      if (requestNumber.current !== number) return false;
      setList(null);
      setError(failure);
      return false;
    } finally {
      if (requestNumber.current === number) setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) void load(null);
    return () => { requestNumber.current += 1; };
  }, [canRead, load]);

  if (!canRead) {
    return <Card><CardHeader><CardTitle>无权读取账号</CardTitle></CardHeader>
      <CardContent className='text-muted-foreground text-sm'>当前管理身份没有账号读取权限。请由有权管理员核对角色授权。</CardContent>
    </Card>;
  }

  const denied = error instanceof ManagementError && error.status === 403;
  const expired = error instanceof ManagementError && error.status === 401;
  return <Card>
    <CardHeader><CardTitle>账号列表</CardTitle><p className='text-muted-foreground text-sm'>仅显示当前有权读取的账号身份信息。</p></CardHeader>
    <CardContent className='space-y-4'>
      <ManagementFeedback error={error} />
      {denied ? <p role='status' className='text-sm'>当前权限已变化，无法继续读取账号。</p> : null}
      {expired ? <p className='text-sm'>管理会话已失效。<Link className='underline' href='/admin/login'>重新登录</Link></p> : null}
      <div className='rounded-lg border' aria-busy={busy}>
        <Table>
          <TableHeader className='bg-muted'><TableRow><TableHead>账号</TableHead><TableHead>状态</TableHead><TableHead>当前角色</TableHead><TableHead>注册时间</TableHead></TableRow></TableHeader>
          <TableBody>
            {list?.items.map(account => <TableRow key={account.id}>
              <TableCell><div>{account.phone_masked}</div><div className='text-muted-foreground text-xs'>{account.id}</div></TableCell>
              <TableCell><Badge variant='outline'>{account.status === 'active' ? '正常' : '已注销'}</Badge></TableCell>
              <TableCell><div className='flex flex-wrap gap-1'>{account.roles.length ? account.roles.map(role => <Badge variant='secondary' key={role}>{role}</Badge>) : '无管理角色'}</div></TableCell>
              <TableCell>{new Date(account.registered_at).toLocaleString('zh-CN')}</TableCell>
            </TableRow>)}
            {!list || list.items.length === 0 ? <TableRow><TableCell colSpan={4} className='h-24 text-center'>
              {busy ? '正在读取账号…' : error ? '账号信息暂时不可用' : '当前没有可读取的账号'}
            </TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button variant='outline' disabled={busy} onClick={() => void load(cursor)}>刷新</Button>
        <div className='flex gap-2'>
          <Button variant='outline' disabled={busy || denied || expired || previous.length === 0} onClick={async () => {
            const target = previous[previous.length - 1];
            if (await load(target)) setPrevious(history => history.slice(0, -1));
          }}>上一页</Button>
          <Button variant='outline' disabled={busy || denied || expired || !list?.has_more || !list.next_cursor} onClick={async () => {
            if (list?.next_cursor && await load(list.next_cursor)) setPrevious(history => [...history, cursor]);
          }}>下一页</Button>
        </div>
      </div>
    </CardContent>
  </Card>;
}
