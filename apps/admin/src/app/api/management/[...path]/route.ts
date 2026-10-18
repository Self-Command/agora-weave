import { NextRequest, NextResponse } from 'next/server';
import { isAdministrator, managementConfiguration, managementPath, sameOriginWrite } from '@/lib/management-policy';
import { isCoreSession, managementCookie, openManagementSession, sealManagementSession, serializeManagementSession } from '@/lib/management-session';
import { callManagementCore, managementFailure } from '@/lib/management-upstream';
import { OTP_KEYS } from '@/features/management/contracts';
import { managementJson } from '@/lib/management-json';
import { issuePasswordCaptcha, passwordCaptchaCookie, verifyPasswordCaptcha } from '@/lib/management-password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const only = (value: Record<string, unknown>, fields: string[]) => Object.keys(value).every(key => fields.includes(key));
function validBody(path: string, body: Record<string, unknown>) {
  if (path === '/auth/password/captcha') return Object.keys(body).length === 0;
  if (path === '/auth/password' || path === '/auth/password/forgot') return only(body, ['username', 'captcha_id', 'captcha_answer', 'operation_id', ...(path === '/auth/password' ? ['password'] : [])]) &&
    typeof body.username === 'string' && /^[a-z0-9][a-z0-9_.-]{2,63}$/.test(body.username) && uuid.test(String(body.captcha_id)) &&
    typeof body.captcha_answer === 'string' && /^\d{6}$/.test(body.captcha_answer) && uuid.test(String(body.operation_id)) &&
    (path !== '/auth/password' || typeof body.password === 'string' && body.password.length > 0 && Buffer.byteLength(body.password, 'utf8') <= 72);
  if (path === '/auth/challenges') return only(body, ['phone', 'purpose', 'operation_id']) && body.purpose === 'login' &&
    typeof body.phone === 'string' && /^\+[1-9]\d{7,14}$/.test(body.phone) && uuid.test(String(body.operation_id));
  if (path === '/auth/verify' || path.startsWith('/auth/operations/')) return only(body, ['challenge_id', 'otp', 'operation_id']) &&
    uuid.test(String(body.challenge_id)) && /^\d{6}$/.test(String(body.otp)) && uuid.test(String(body.operation_id)) &&
    (!path.startsWith('/auth/operations/') || path.endsWith('/' + body.operation_id));
  if (path === '/auth/refresh') return Object.keys(body).length === 0;
  if (path === '/auth/logout') return only(body, ['operation_id']) && uuid.test(String(body.operation_id));
  if (path === '/admin/mfa/factors') return only(body, ['friendly_name']) && typeof body.friendly_name === 'string' && body.friendly_name.length > 0 && body.friendly_name.length <= 64;
  if (path === '/admin/mfa/challenges') return only(body, ['factor_id']) && uuid.test(String(body.factor_id));
  if (path === '/admin/mfa/verify' || path === '/admin/stepup') return only(body, ['factor_id', 'challenge_id', 'code', ...(path === '/admin/stepup' ? ['action_digest'] : [])]) &&
    uuid.test(String(body.factor_id)) && uuid.test(String(body.challenge_id)) && /^\d{6}$/.test(String(body.code)) &&
    (path !== '/admin/stepup' || /^[a-f0-9]{64}$/.test(String(body.action_digest)));
  if (/^\/admin\/revisions\/[a-f0-9-]+\/decision(?:-previews)?$/i.test(path)) {
    const preview = path.endsWith('/decision-previews');
    return only(body, ['operation_id', 'reason', 'decision', ...(preview ? [] : ['base_version', 'preview_id', 'preview_digest', 'stepup_id'])]) &&
      uuid.test(String(body.operation_id)) &&
      typeof body.reason === 'string' && body.reason.trim().length > 0 && body.reason.length <= 1000 &&
      ['approve', 'reject'].includes(String(body.decision)) &&
      (preview || Number.isSafeInteger(body.base_version) && Number(body.base_version) > 0 &&
        uuid.test(String(body.preview_id)) && uuid.test(String(body.stepup_id)) && /^[a-f0-9]{64}$/i.test(String(body.preview_digest)));
  }
  if (path === '/admin/config/previews') {
    const values = body.values;
    return only(body, ['base_version', 'values', 'rollback_version', 'reason', 'operation_id']) &&
      typeof body.base_version === 'string' && typeof body.reason === 'string' && body.reason.trim().length > 0 && body.reason.length <= 2000 &&
      uuid.test(String(body.operation_id)) && (typeof body.rollback_version === 'string' && !('values' in body) ||
        !('rollback_version' in body) && object(values) && Object.keys(values).length === OTP_KEYS.length &&
        OTP_KEYS.every(key => Number.isSafeInteger(values[key]) && Number(values[key]) > 0));
  }
  return ['/admin/config/releases', '/admin/config/rollbacks'].includes(path) && only(body, ['preview_id', 'preview_digest', 'stepup_id', 'operation_id']) &&
    uuid.test(String(body.preview_id)) && uuid.test(String(body.stepup_id)) && uuid.test(String(body.operation_id)) && /^[a-f0-9]{64}$/.test(String(body.preview_digest));
}

function response(result: { status: number; body: unknown }, operationId?: unknown) {
  const body = result.status >= 400 && object(result.body) && typeof operationId === 'string'
    ? { ...result.body, operation_id: operationId } : result.body;
  return NextResponse.json(body, { status: result.status, headers: { 'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' } });
}

async function execute(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = managementPath((await context.params).path, request.method);
  if (!path) return response(managementFailure('FORBIDDEN', 403));
  if (request.method === 'POST' && !sameOriginWrite(request)) return response(managementFailure('FORBIDDEN', 403));
  const cookie = managementCookie();
  const encrypted = request.cookies.get(cookie.name)?.value;
  const config = managementConfiguration(process.env);
  if (!config || !/^[a-f0-9]{64}$/i.test(process.env.AGORAWEAVE_ADMIN_SESSION_KEY ?? '')) {
    const result = response(managementFailure('SERVICE_UNAVAILABLE', 503));
    if (path === '/auth/logout') result.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
    return result;
  }
  let body: Record<string, unknown> | undefined;
  if (request.method === 'POST') {
    try {
      if (Number(request.headers.get('content-length')) > 16384) throw new Error();
      const parsed: unknown = await managementJson(request, 16384);
      if (!object(parsed) || !validBody(path, parsed)) throw new Error();
      body = parsed;
    } catch { return response(managementFailure('INVALID_INPUT', 422)); }
  }
  const query = request.nextUrl.searchParams;
  const allowedQuery = ['/admin/accounts', '/admin/contents', '/admin/cases', '/admin/appeals'].includes(path) ? ['limit', 'cursor'] :
    path === '/admin/config/definitions' ? ['group'] : [];
  if ([...query.keys()].some(key => !allowedQuery.includes(key) || query.getAll(key).length !== 1) ||
    query.has('limit') && (!/^[1-9]\d?$/.test(query.get('limit') ?? '') || Number(query.get('limit')) > 50) ||
    query.has('cursor') && !/^[A-Za-z0-9_-]{1,2048}$/.test(query.get('cursor') ?? '') ||
    path === '/admin/config/definitions' && query.get('group') !== 'otp') return response(managementFailure('INVALID_INPUT', 422));
  if (path === '/auth/password/captcha') {
    try {
      const captcha = issuePasswordCaptcha();
      const registered = await callManagementCore(path, { method: 'POST', body: { captcha_id: captcha.data.captcha_id, expires_at: captcha.data.expires_at } });
      if (registered.status !== 200) return response(registered);
      const output = response({ status: 200, body: { request_id: crypto.randomUUID(), data: captcha.data } });
      const cookie = passwordCaptchaCookie(); output.cookies.set(cookie.name, captcha.cookie, cookie.options);
      return output;
    } catch { return response(managementFailure('SERVICE_UNAVAILABLE', 503)); }
  }
  if (path === '/auth/password' || path === '/auth/password/forgot') {
    const captcha = passwordCaptchaCookie(); let valid = false;
    try { valid = verifyPasswordCaptcha(request.cookies.get(captcha.name)?.value, String(body!.captcha_id), String(body!.captcha_answer)); }
    catch { return response(managementFailure('SERVICE_UNAVAILABLE', 503)); }
    body = { username: body!.username, captcha_id: body!.captcha_id, operation_id: body!.operation_id, captcha_valid: valid,
      ...(valid && path === '/auth/password' ? { password: body!.password } : {}) };
    if (!valid) {
      // The signed core call consumes the durable challenge even on a wrong
      // answer. Clearing a browser cookie alone cannot prevent replay.
      const result = await callManagementCore(path, { method: 'POST', body });
      return response(result.status === 503 ? result : managementFailure('AUTH_FAILED', 401), body.operation_id);
    }
  }
  return serializeManagementSession(encrypted, async () => {
    let session;
    try { session = openManagementSession(encrypted); }
    catch {
      const result = response(managementFailure('SERVICE_UNAVAILABLE', 503));
      if (path === '/auth/logout') result.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
      return result;
    }
    if (path === '/auth/logout') {
      const result = response(session ? await callManagementCore(path, { method: 'POST', token: session.access_token, body }) : managementFailure('SESSION_INVALID', 401), body?.operation_id);
      result.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
      return result;
    }
    const login = path === '/auth/challenges' || path === '/auth/verify' || path.startsWith('/auth/operations/') || path === '/auth/password' || path === '/auth/password/forgot';
    if (!login && !session) return response(managementFailure('SESSION_INVALID', 401));
    if (!login && path !== '/auth/refresh') {
      const current = await callManagementCore('/admin/session', { token: session!.access_token });
      if (current.status !== 200) return response(current);
      const administrator = (current.body as Record<string, unknown>).data;
      if (!isAdministrator(administrator, config.environment)) return response(managementFailure('FORBIDDEN', 403));
      const mfaGuide = path === '/admin/session' || path.startsWith('/admin/mfa/');
      if (!mfaGuide && (!administrator.mfa.verified || administrator.mfa.aal !== 'aal2')) return response(managementFailure('MFA_REQUIRED', 403));
      if (path === '/admin/session') return response(current);
    }
    if (config.environment === 'production' && request.method === 'POST' && path.startsWith('/admin/config/')) {
      return response(managementFailure('CONFIRMATION_REQUIRED', 503));
    }
    const result = await callManagementCore(path, { method: request.method,
      token: login || path === '/auth/refresh' ? undefined : session?.access_token,
      body: path === '/auth/refresh' ? { refresh_token: session!.refresh_token } : body, query: request.nextUrl.search });
    if (result.status < 200 || result.status >= 300) {
      const output = response(result, body?.operation_id);
      if (login && [401, 403].includes(result.status)) output.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
      return output;
    }
    const resultBody = result.body as Record<string, unknown>;
    const data = resultBody.data;
    const sessionResult = object(data) ? data.session : undefined;
    if (sessionResult !== undefined) {
      if (!isCoreSession(sessionResult)) return response(managementFailure('SERVICE_UNAVAILABLE', 503));
      // Recheck immediately before persisting a newly issued token. Cookies alone never grant access.
      const current = await callManagementCore('/admin/session', { token: sessionResult.access_token });
      const administrator = (current.body as Record<string, unknown>).data;
      if (current.status !== 200) {
        const output = response(current);
        if (login) output.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
        return output;
      }
      if (!isAdministrator(administrator, config.environment)) return response(managementFailure('FORBIDDEN', 403));
      if (['/admin/mfa/verify', '/admin/stepup'].includes(path) && (administrator.mfa.aal !== 'aal2' || !administrator.mfa.verified)) {
        return response(managementFailure('MFA_REQUIRED', 403));
      }
      let value: string;
      try { value = sealManagementSession(sessionResult); } catch { return response(managementFailure('SERVICE_UNAVAILABLE', 503)); }
      const publicData = path === '/admin/stepup' && object(data) ? { stepup_id: data.stepup_id, expires_at: data.expires_at } : { administrator };
      const output = response({ status: result.status, body: { ...resultBody, data: publicData } });
      output.cookies.set(cookie.name, value, cookie.options);
      return output;
    }
    if (path === '/auth/verify' || path === '/auth/password' || path === '/auth/refresh' || path === '/admin/mfa/verify' || path === '/admin/stepup') {
      return response(managementFailure('SERVICE_UNAVAILABLE', 503));
    }
    const output = response(result);
    if (path === '/auth/challenges') output.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
    return output;
  });
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const output = await execute(request, context);
  if (request.method === 'POST' && /\/auth\/password(?:\/forgot)?$/.test(request.nextUrl.pathname)) {
    const cookie = passwordCaptchaCookie(); output.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
  }
  return output;
}

export const GET = handle;
export const POST = handle;
