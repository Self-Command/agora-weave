import { managementConfiguration } from './management-policy';
import type { ApiFailure } from '../features/management/contracts';
import { managementJson } from './management-json';
import { passwordBffHeaders } from './management-password';

export function managementFailure(code: string, status: number, operationId?: string) {
  const messages: Record<string, string> = {
    SESSION_INVALID: '登录已失效，请重新登录', FORBIDDEN: '当前账号无此管理权限',
    MFA_REQUIRED: '请先完成管理员多因素验证', INVALID_INPUT: '请求内容有误，请检查后重试',
    SERVICE_UNAVAILABLE: '管理服务暂时不可用，请稍后重试', AUTH_UNCONFIRMED: '结果尚未确认，请查询原操作',
    CONFIRMATION_REQUIRED: '生产配置变更需要具体发布确认', AUTH_FAILED: '登录信息或图形验证码有误，请重新验证后重试'
  };
  const body: ApiFailure = { request_id: crypto.randomUUID(), code, message: messages[code] ?? messages.SERVICE_UNAVAILABLE,
    retryable: status === 503, ...(operationId ? { operation_id: operationId } : {}) };
  return { status, body };
}

export async function callManagementCore(path: string, options: { method?: string; token?: string; body?: unknown; query?: string } = {}) {
  const config = managementConfiguration(process.env);
  if (!config) return managementFailure('SERVICE_UNAVAILABLE', 503);
  try {
    const response = await fetch(config.base + path + (options.query ?? ''), {
      method: options.method ?? 'GET', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/json', 'X-Client-Release': '0.0.0', 'X-Channel': 'admin',
        ...(path.startsWith('/auth/password') ? passwordBffHeaders(path, options.body) : {}),
        ...(config.anonKey ? { apikey: config.anonKey } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      signal: AbortSignal.timeout(15000)
    });
    // A malformed or oversized upstream response is a dependency failure, never a login success.
    const body = await managementJson(response, 1048576) as Record<string, unknown>;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return managementFailure('SERVICE_UNAVAILABLE', 503);
    if (!response.ok) {
      if (typeof body.code !== 'string' || typeof body.message !== 'string') return managementFailure('SERVICE_UNAVAILABLE', 503);
      // No upstream headers, cookies, stack traces or arbitrary fields cross the BFF boundary.
      const error = { request_id: typeof body.request_id === 'string' ? body.request_id : crypto.randomUUID(),
        code: body.code, message: body.message, retryable: body.retryable === true,
        ...(typeof body.operation_id === 'string' ? { operation_id: body.operation_id } : {}),
        ...(typeof body.retry_after_seconds === 'number' ? { retry_after_seconds: body.retry_after_seconds } : {}),
        ...(typeof body.current_config_version === 'string' ? { current_config_version: body.current_config_version } : {}),
        ...(body.field_errors && typeof body.field_errors === 'object' ? { field_errors: body.field_errors } : {}) };
      return { status: response.status, body: error };
    }
    if (!('data' in body)) return managementFailure('SERVICE_UNAVAILABLE', 503);
    return { status: response.status, body };
  } catch { return managementFailure('SERVICE_UNAVAILABLE', 503); }
}
