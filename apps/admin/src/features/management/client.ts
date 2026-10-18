'use client';

import type { ApiEnvelope, ApiFailure } from './contracts';

export class ManagementError extends Error {
  constructor(public status: number, public failure: ApiFailure) { super(failure.message); }
}

let mutations: Promise<unknown> = Promise.resolve();
export async function managementRequest<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  if (body === undefined) return send<T>(path);
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('agoraweave-admin-session', () => send<T>(path, body)) : send<T>(path, body);
  const result = mutations.then(run, run);
  mutations = result.catch(() => undefined);
  return result;
}

async function send<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  let response: Response;
  try {
    response = await fetch('/api/management' + path, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-AgoraWeave-CSRF': '1' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new ManagementError(503, { request_id: crypto.randomUUID(), code: 'AUTH_UNCONFIRMED',
      message: '网络中断，结果尚未确认。请保留输入并查询原操作。', retryable: true });
  }
  let result;
  try { result = await response.json(); }
  catch { throw new ManagementError(503, { request_id: crypto.randomUUID(), code: 'SERVICE_UNAVAILABLE',
    message: '管理服务响应暂时不可用，请保留输入。', retryable: true }); }
  if (!response.ok) throw new ManagementError(response.status, result as ApiFailure);
  return result as ApiEnvelope<T>;
}

export { totpQrSource } from './qr';
