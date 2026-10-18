'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ManagementError } from '../client';
export function ManagementFeedback({ error, message }: { error?: unknown; message?: string }) {
  if (!error && !message) return null;
  return <Alert variant={error ? 'destructive' : 'default'} role={error ? 'alert' : 'status'}>
    <AlertTitle>{error ? '操作未完成' : '操作结果'}</AlertTitle>
    <AlertDescription>{error instanceof Error ? error.message : error ? '管理服务暂时不可用，请保留输入后重试' : message}
      {error instanceof ManagementError ? <span className='block text-xs'>错误：{error.failure.code}{error.failure.retry_after_seconds ? ` · 请在 ${error.failure.retry_after_seconds} 秒后重试` : ''}</span> : null}
    </AlertDescription>
  </Alert>;
}
