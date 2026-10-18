import { principal } from './identity.ts';
import { database } from './database.ts';
import { admittedResource } from './admission.ts';
import { listSessions, revokeSession } from './routes/account-security.ts';
import { refreshSession } from './routes/auth.ts';
import { publicChallenge,publicVerify } from './routes/public-auth.ts';
import { adminPassword } from './routes/admin-password.ts';
import { devTestLogin } from './routes/dev-test-login.ts';
import { adminIdentity } from './routes/admin-identity.ts';
import { configuration } from './routes/configuration.ts';
import { accountOperation } from './routes/operations.ts';
import { recoveryCase } from './routes/recovery.ts';
import { effectiveConfig } from './config/effective.ts';
import { events } from './realtime/gateway.ts';
import { media } from './media/gateway.ts';
import { readCurrentDocuments, readDocument } from './documents/read.ts';
import { latestFeed } from './routes/discovery.ts';
import { createPost } from './routes/publishing.ts';
import { createComment, listComments } from './routes/discussions.ts';
import { resourceLike } from './routes/reactions.ts';
import { accountBlock } from './routes/blocks.ts';
import { getProfile, getProfileContents, updateProfile } from './routes/profiles.ts';
import { createReport, listOwnReports } from './routes/reports.ts';
import { createAppeal, listOwnAppeals, listOwnSanctions } from './routes/appeals.ts';
import { moderationReview } from './routes/moderation-review.ts';
import { createUpload, putUploadPart, completeUpload } from './routes/upload.ts';

const messages: Record<string, string> = { SESSION_INVALID: '登录已失效，请重新登录',
  NOT_FOUND: '内容不可用', FORBIDDEN: '当前入口不支持此操作', METHOD_NOT_ALLOWED: '不支持此操作',
  INVALID_INPUT: '请求内容有误，请检查后重试', CONFLICT: '状态已变化，请刷新后重试',
  TERMS_UNAVAILABLE: '注册条款暂时不可用，请稍后重试',
  CONFIG_UNAVAILABLE: '配置暂时不可用，请稍后重试', SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后重试' };
const failure = (code: string, status: number) => Response.json({ request_id: crypto.randomUUID(), code,
  message: messages[code], retryable: status === 503 }, { status, headers: { 'Cache-Control': 'no-store' } });

Deno.serve(async (request: Request) => {
  let actor;
  try { actor = await principal(request); }
  catch (error) { return error instanceof Error && error.message === 'SERVICE_UNAVAILABLE'
    ? failure('SERVICE_UNAVAILABLE', 503) : failure('SESSION_INVALID', 401); }
  const path = new URL(request.url).pathname.replace(/^\/core\/api\/v1/, '');
  // Share principals have a method and route whitelist before any private handler.
  if (actor?.audience === 'share-read' && !((request.method === 'GET' || request.method === 'HEAD') &&
    (/^\/posts\/[0-9a-f-]{36}$/i.test(path) && request.method==='GET' || /^\/media\/[a-f0-9-]{36}$/i.test(path) ||
      request.method==='GET' && (path === '/config/effective' || path === '/documents/current' ||
        /^\/documents\/[a-z0-9_.-]{2,128}\/releases\/(current|[a-f0-9-]{36})$/i.test(path))))) {
    return failure('FORBIDDEN', 403);
  }
  if (!actor && path.startsWith('/me/')) return failure('SESSION_INVALID', 401);
  try {
    // A completed logout may return only its exact durable receipt to the same
    // signature-verified session. The command function rejects all new actions.
    const logoutReceipt=request.method==='POST' && path==='/auth/logout' && actor?.audience==='authenticated';
    const context=await database().begin(async tx=>{
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      const [row]=await tx`SELECT core.policy_context_result(${logoutReceipt?null:actor?.account ?? null}::uuid,
        ${logoutReceipt?null:actor?.session ?? null}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
      return row;
    });
    if (context.result.code!=='OK') return failure(context.result.code,context.result.code==='SESSION_INVALID'?401:503);
    if (path.startsWith('/admin/config/')) return await configuration(request,path,actor,failure);
    if (path === '/admin/contents' || path === '/admin/cases' ||
      /^\/admin\/revisions\/[0-9a-f-]{36}\/decision(?:-previews)?$/i.test(path))
      return await moderationReview(request,path,actor,failure);
    if (path.startsWith('/admin/')) return await adminIdentity(request,path,actor,failure);
    if (path === '/auth/password/captcha' || path === '/auth/password' || path === '/auth/password/forgot') return await adminPassword(request,path,failure);
    if (path === '/auth/dev-test-login') return await devTestLogin(request,failure);
    if (path === '/auth/refresh') return request.method === 'POST' ? await refreshSession(request,failure) : failure('METHOD_NOT_ALLOWED',405);
    if (path === '/auth/challenges') return await publicChallenge(request,failure);
    if (path === '/auth/verify') return await publicVerify(request,failure);
    const authOperation=path.match(/^\/auth\/operations\/([a-f0-9-]{36})$/i);
    if (authOperation) return await publicVerify(request,failure,authOperation[1]);
    if (path === '/documents/current') return await readCurrentDocuments(request,failure);
    if (path === '/config/effective') return await effectiveConfig(request,failure);
    if (path === '/feeds/latest') return await latestFeed(request,failure);
    if (path === '/posts') return await createPost(request,failure);
    if (path === '/uploads') return await createUpload(request,failure);
    const uploadPart = path.match(/^\/uploads\/([a-f0-9-]{36})\/parts\/([0-9]+)$/i);
    if (uploadPart) return await putUploadPart(request,uploadPart[1],uploadPart[2],failure);
    const uploadComplete = path.match(/^\/uploads\/([a-f0-9-]{36})\/complete$/i);
    if (uploadComplete) return await completeUpload(request,uploadComplete[1],failure);
    if (path === '/events') return await events(request,failure);
    const mediaTarget = path.match(/^\/media\/([a-f0-9-]{36})$/i);
    if (mediaTarget) return await media(request,mediaTarget[1],failure);
    const documentTarget = path.match(/^\/documents\/([a-z0-9_.-]{2,128})\/releases\/(current|[a-f0-9-]{36})$/i);
    if (documentTarget) return await readDocument(request,documentTarget[1],failure,documentTarget[2]);
    if (path === '/auth/logout') return request.method === 'POST' ? await revokeSession(request,null,failure) : failure('METHOD_NOT_ALLOWED',405);
    if (path === '/recovery-cases') return request.method === 'POST' ? await recoveryCase(request,null,failure) : failure('METHOD_NOT_ALLOWED',405);
    const recoveryTarget = path.match(/^\/recovery-cases\/([a-f0-9-]{36})$/i);
    if (recoveryTarget) return request.method === 'GET' ? await recoveryCase(request,recoveryTarget[1],failure) : failure('METHOD_NOT_ALLOWED',405);
    const operationTarget = path.match(/^\/operations\/([a-f0-9-]{36})$/i);
    if (operationTarget) return request.method === 'GET' ? await accountOperation(request,operationTarget[1],failure) : failure('METHOD_NOT_ALLOWED',405);
    const sessionTarget = path.match(/^\/me\/sessions\/([a-f0-9-]{36})$/i);
    if (sessionTarget) return request.method === 'DELETE' ? await revokeSession(request,sessionTarget[1],failure) : failure('METHOD_NOT_ALLOWED',405);
    const sql = database();
    if (actor) {
      const [current] = await sql`SELECT core.current_identity(${actor.account}::uuid,${actor.session}::uuid) AS active`;
      if (!current.active) return failure('SESSION_INVALID', 401);
    }
    if (path === '/me/preferences' && request.method === 'PUT') return failure('METHOD_NOT_ALLOWED', 405);
    if (path === '/me/profile') return await updateProfile(request,failure);
    if (path === '/reports') return await createReport(request,failure);
    if (path === '/me/reports') return await listOwnReports(request,failure);
    if (path === '/me/sanctions') return await listOwnSanctions(request,failure);
    if (path === '/appeals') return request.method === 'GET' ?
      await listOwnAppeals(request,failure) : await createAppeal(request,failure);
    const profileTarget = path.match(/^\/profiles\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
    if (profileTarget) return await getProfile(request,profileTarget[1],failure);
    const contentsTarget = path.match(/^\/profiles\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/contents$/i);
    if (contentsTarget) return await getProfileContents(request,contentsTarget[1],failure);
    if (path === '/me/sessions') return request.method === 'GET' ? await listSessions(request, failure) : failure('METHOD_NOT_ALLOWED',405);
    const target = path.match(/^\/posts\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
    const comments = path.match(/^\/posts\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/comments$/i);
    if (comments) return request.method === 'GET' ? await listComments(request,comments[1],failure) :
      request.method === 'POST' ? await createComment(request,comments[1],failure) : failure('METHOD_NOT_ALLOWED',405);
    const likeTarget = path.match(/^\/resources\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/likes$/i);
    if (likeTarget) return await resourceLike(request,likeTarget[1],failure);
    const blockTarget = path.match(/^\/me\/blocks\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
    if (blockTarget) return await accountBlock(request,blockTarget[1],failure);
    if (!target) return failure('NOT_FOUND', 404);
    if (request.method !== 'GET') return failure('METHOD_NOT_ALLOWED', 405);
    return await admittedResource(request, target[1], failure);
  } catch { return failure('SERVICE_UNAVAILABLE', 503); }
});
