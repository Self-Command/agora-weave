'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { managementRequest } from '../client';
export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return <Button variant='outline' disabled={busy} onClick={async () => {
    const operation = crypto.randomUUID();
    setBusy(true);
    try { await managementRequest('/auth/logout', { operation_id: operation });
      window.location.assign('/admin/login?logout=complete');
    } catch { window.location.assign('/admin/login?logout=unconfirmed&operation=' + operation); }
  }}>{busy ? '正在退出…' : '退出登录'}</Button>;
}
