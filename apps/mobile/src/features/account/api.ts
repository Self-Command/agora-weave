export type SessionTokens = { access_token: string; refresh_token: string; expires_at: number };
export type DeviceSession = { id: string; device_label: string; current: boolean; row_version: number; created_at: string; trusted_at: string | null };
export type RegistrationDocuments = { document_set_digest: string; age_declaration_version: string;
  documents: { release_id: string; title: string; body: string; digest: string; kind: string }[] };
export type Challenge = { challenge_id: string; expires_at: string; retry_after: number };
export type AccountOperation = { operation_id: string; action: string; state: 'pending'|'succeeded'|'failed'|'unknown' };

export class AccountError extends Error {
  code: string;
  retryAfter: number;
  constructor(code: string,message: string,retryAfter = 0) { super(message); this.code = code; this.retryAfter = retryAfter; }
}
export function normalizePhone(value: string): string | null {
  const phone = value.replace(/[\s()-]/g,'');
  if (/^1[3-9]\d{9}$/.test(phone)) return '+86' + phone;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function accountApi(base: string | undefined,release: string,development = false) {
  async function call<T>(path: string,method = 'GET',body?: unknown,token?: string): Promise<T> {
    let url: URL;
    try {
      url = new URL(base || '');
      if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' &&
        !(development && url.protocol === 'http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname)))) throw new Error();
    } catch { throw new AccountError('SERVICE_UNAVAILABLE','账号服务暂时不可用，请稍后重试'); }
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(),15000);
    try {
      const response = await fetch(url.toString().replace(/\/$/,'') + path,{ method,signal: abort.signal,
        headers: { 'Content-Type': 'application/json','X-Client-Release': release,...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const envelope = await response.json();
      if (!response.ok) throw new AccountError(envelope.code || 'SERVICE_UNAVAILABLE',
        typeof envelope.message === 'string' ? envelope.message : '账号服务暂时不可用，请稍后重试',
        Number.isSafeInteger(envelope.retry_after_seconds) && envelope.retry_after_seconds > 0 ? envelope.retry_after_seconds : 0);
      if (!envelope || typeof envelope !== 'object' || !('data' in envelope)) throw new Error();
      return envelope.data as T;
    } catch (error) {
      if (error instanceof AccountError) throw error;
      throw new AccountError('NETWORK_UNCONFIRMED','网络连接失败，输入已保留，请重试');
    } finally { clearTimeout(timeout); }
  }
  return {
    documents: () => call<RegistrationDocuments>('/documents/current?kind=terms&surface=app&locale=zh-CN'),
    challenge: (body: unknown) => call<Challenge>('/auth/challenges','POST',body),
    verify: (body: unknown) => call<{ session: SessionTokens; account: { id: string; admitted: boolean } }>('/auth/verify','POST',body),
    refresh: (refresh_token: string) => call<{ session: SessionTokens }>('/auth/refresh','POST',{ refresh_token }),
    operation: (token: string,id: string) => call<AccountOperation>('/operations/' + encodeURIComponent(id),'GET',undefined,token),
    sessions: (token: string,cursor?: string) => call<{ items: DeviceSession[]; next_cursor: string | null; has_more: boolean }>(
      '/me/sessions' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''),'GET',undefined,token),
    revoke: (token: string,id: string,base_version: number,operation_id: string) => call('/me/sessions/' + encodeURIComponent(id),'DELETE',{ base_version,operation_id },token),
    logout: (token: string,operation_id: string) => call('/auth/logout','POST',{ operation_id },token),
  };
}
export type AccountApi = ReturnType<typeof accountApi>;
