import type { components } from '../../../../../packages/contracts/src/generated/app';

type Schemas = components['schemas'];
export type SessionTokens = Schemas['SessionTokens'];
export type DeviceSession = Schemas['DeviceSession'];
export type RegistrationDocuments = Schemas['RegistrationDocuments'];
export type Challenge = Schemas['OtpChallenge'];
export type AuthVerification = Schemas['VerifyRequest'];
export type AuthReceipt = Schemas['AuthReceipt'];
export type AuthOperation = Schemas['AuthOperation'];
export type AccountOperation = Schemas['AccountOperation'];
export type RecoveryCase = Schemas['RecoveryCase'];

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
    async devTestLogin(username: string,password: string): Promise<AuthReceipt> {
      if (!development) throw new AccountError('SERVICE_UNAVAILABLE','测试登录仅在开发环境可用');
      const result = await call<unknown>('/auth/dev-test-login','POST',{ username,password });
      if (!result || typeof result !== 'object' || !('account' in result) || !('session' in result))
        throw new AccountError('SERVICE_UNAVAILABLE','测试登录响应无效');
      const account = result.account,session = result.session;
      if (!account || typeof account !== 'object' || !('admitted' in account) || account.admitted !== true ||
          !('id' in account) || typeof account.id !== 'string' ||
          !session || typeof session !== 'object' || !('access_token' in session) || typeof session.access_token !== 'string' ||
          !('refresh_token' in session) || typeof session.refresh_token !== 'string' ||
          !('expires_at' in session) || !Number.isSafeInteger(session.expires_at) || Number(session.expires_at)*1000<=Date.now())
        throw new AccountError('SERVICE_UNAVAILABLE','测试登录响应无效');
      return result as AuthReceipt;
    },
    documents: () => call<RegistrationDocuments>('/documents/current?kind=terms&surface=app&locale=zh-CN'),
    challenge: (body: Schemas['OtpChallengeRequest']) => call<Challenge>('/auth/challenges','POST',body),
    verify: (body: AuthVerification) => call<AuthReceipt>('/auth/verify','POST',body),
    authOperation: (body: AuthVerification) => call<AuthOperation>('/auth/operations/' + encodeURIComponent(body.operation_id),'POST',body),
    refresh: (refresh_token: string) => call<{ session: SessionTokens }>('/auth/refresh','POST',{ refresh_token }),
    operation: (token: string,id: string) => call<AccountOperation>('/operations/' + encodeURIComponent(id),'GET',undefined,token),
    requestRecovery: (token: string,mode: 'trusted'|'manual',operation_id: string) => call<RecoveryCase>('/recovery-cases','POST',{ mode,operation_id },token),
    recoveryCase: (token: string,id: string) => call<RecoveryCase>('/recovery-cases/' + encodeURIComponent(id),'GET',undefined,token),
    sessions: (token: string,cursor?: string) => call<Schemas['SessionPage']>(
      '/me/sessions' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''),'GET',undefined,token),
    revoke: (token: string,id: string,base_version: number,operation_id: string) => call('/me/sessions/' + encodeURIComponent(id),'DELETE',{ base_version,operation_id },token),
    logout: (token: string,operation_id: string) => call('/auth/logout','POST',{ operation_id },token),
  };
}
export type AccountApi = ReturnType<typeof accountApi>;
