import { passwordGrant, PasswordAuthError } from '../adapters/supabase-admin-password.ts';
import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, type Failure } from '../output.ts';
import { readCommandJson } from '../request-body.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const phone = /^\+[1-9][0-9]{7,14}$/;
const username = /^[a-z0-9][a-z0-9_.-]{2,63}$/;

function unavailable(): Response {
  return Response.json({ request_id: crypto.randomUUID(), code: 'SERVICE_UNAVAILABLE',
    message: '开发测试登录暂不可用', retryable: true },
  { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

function denied(code: 'AUTH_FAILED' | 'RATE_LIMITED' | 'AUTH_UNCONFIRMED'): Response {
  const status = code === 'AUTH_FAILED' ? 401 : code === 'RATE_LIMITED' ? 429 : 503;
  return Response.json({ request_id: crypto.randomUUID(), code,
    message: code === 'AUTH_FAILED' ? '登录信息有误' : code === 'RATE_LIMITED' ? '请求过于频繁，请稍后重试' : '登录结果尚未确认，请稍后重试',
    retryable: status !== 401 },
  { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

/** Real GoTrue password login for the single, provisioned ordinary dev account. */
export async function devTestLogin(request: Request, failure: Failure): Promise<Response> {
  if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 405);
  if (new URL(request.url).search) return failure('INVALID_INPUT', 422);
  if (Deno.env.get('CORE_ENVIRONMENT') !== 'dev' || Deno.env.get('CORE_DEV_TEST_LOGIN_ENABLED') !== 'true') return unavailable();
  const expectedAccount = Deno.env.get('CORE_DEV_TEST_ACCOUNT_ID') || '';
  const expectedPhone = Deno.env.get('CORE_DEV_TEST_PHONE') || '';
  const expectedUsername = Deno.env.get('CORE_DEV_TEST_USERNAME') || '';
  if (!uuid.test(expectedAccount) || !phone.test(expectedPhone) || !username.test(expectedUsername)) return unavailable();
  let raw;
  try { raw = await readCommandJson(request, 2048); }
  catch { return failure('INVALID_INPUT', 422); }
  if (Object.keys(raw).length !== 2 || typeof raw.username !== 'string' || !username.test(raw.username) ||
      typeof raw.password !== 'string' || Object.keys(raw).some(key => !['username', 'password'].includes(key)))
    return failure('INVALID_INPUT', 422);
  if (raw.username !== expectedUsername) return denied('AUTH_FAILED');
  const operationId = crypto.randomUUID();
  let session;
  try {
    session = await passwordGrant(expectedPhone, raw.password, expectedAccount,
      token => principal(new Request(request.url, { headers: { Authorization: `Bearer ${token}` } })));
  } catch (error) {
    return denied(error instanceof PasswordAuthError ? error.code : 'AUTH_UNCONFIRMED');
  }
  if (session.actor.account.toLowerCase() !== expectedAccount.toLowerCase()) return denied('AUTH_FAILED');
  try {
    const [bound] = await database()`SELECT core.complete_dev_test_login_result(${session.actor.account}::uuid,
      ${session.actor.session}::uuid,${operationId}::uuid,${expectedAccount}::uuid,'dev') AS result`;
    if (bound.result?.code === 'SERVICE_UNAVAILABLE' || bound.result?.code === 'CONFIG_UNAVAILABLE') return unavailable();
    if (bound.result?.code !== 'OK' || bound.result?.admitted !== true) return denied('AUTH_FAILED');
  } catch { return denied('AUTH_UNCONFIRMED'); }

  return admittedOutput(failure, async tx => {
    const [row] = await tx`SELECT core.current_identity(${session.actor.account}::uuid,${session.actor.session}::uuid) AS active`;
    if (!row.active || session.actor.expires_at * 1000 <= Date.now()) return failure('SESSION_INVALID', 401);
    return jsonOutput(tx, { session: session.tokens, account: { id: session.actor.account, admitted: true } });
  });
}
