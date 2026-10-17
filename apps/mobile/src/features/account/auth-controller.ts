import { AccountError,normalizePhone,type AccountApi,type Challenge,type RegistrationDocuments,type SessionTokens } from './api.ts';
import { controllerState } from './controller-state.ts';
import { recoverChangedTerms } from './recovery.ts';

export function createAuthController(api: AccountApi,onAuthenticated: (session: SessionTokens) => Promise<void>,commandId: () => string,
  now: () => number = Date.now) {
  const state = controllerState({ mode: 'login' as 'login'|'register',phone: '',invitation: '',otp: '',adult: false,consent: false,
    step: 'details' as 'details'|'otp',pending: null as 'send'|'verify'|null,
    documents: null as RegistrationDocuments | null,challenge: null as Challenge | null,retryAt: 0,now: now(),busy: false,loadingDocuments: false,error: '',
    errorCode: '',fieldErrors: {} as Partial<Record<'phone'|'invitation'|'otp',string>> });
  let verifyCommand: string | null = null,challengeCommand: string | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let disposed = false,generation = 0,documentGeneration = 0;
  const current = (ticket: number) => !disposed && ticket === generation;
  async function reloadDocuments() {
    if (disposed) return;
    const ticket = ++documentGeneration;
    const currentDocuments = () => !disposed && ticket === documentGeneration;
    state.update({ loadingDocuments: true,consent: false,documents: null,error: '',errorCode: '',fieldErrors: {} });
    try { const documents = await api.documents(); if (currentDocuments()) state.update({ documents }); }
    catch (failure) { if (currentDocuments()) state.update({ error: failure instanceof Error ? failure.message : '条款暂时不可用，请重试',
      errorCode: failure instanceof AccountError ? failure.code : 'TERMS_UNAVAILABLE' }); }
    finally { if (currentDocuments()) state.update({ loadingDocuments: false }); }
  }
  async function loadDocuments() {
    if (disposed) return;
    generation++; state.update({ busy: false,pending: null });
    await reloadDocuments();
  }
  function changeMode() {
    if (disposed) return;
    generation++; documentGeneration++;
    const previous = state.getSnapshot().mode;
    state.update({ mode: previous === 'login' ? 'register' : 'login',step: 'details',error: '',errorCode: '',fieldErrors: {},
      otp: '',challenge: null,adult: false,consent: false,busy: false,pending: null,loadingDocuments: false });
    verifyCommand = null; challengeCommand = null;
    if (previous === 'login') void reloadDocuments();
  }
  async function sendCode() {
    if (disposed || state.getSnapshot().busy) return;
    const ticket = ++generation;
    const value = state.getSnapshot(),normalized = normalizePhone(value.phone);
    const fieldErrors: typeof value.fieldErrors = {};
    if (!normalized) fieldErrors.phone = '请输入有效手机号';
    if (value.mode === 'register' && !value.invitation.trim()) fieldErrors.invitation = '请输入邀请码';
    if (Object.keys(fieldErrors).length) {
      state.update({ error: fieldErrors.phone || fieldErrors.invitation || '',errorCode: 'INVALID_INPUT',fieldErrors }); return;
    }
    if (value.mode === 'register' && (!value.adult || !value.consent || !value.documents || value.loadingDocuments)) {
      state.update({ error: '请主动声明已满 18 岁，并阅读和明确同意当前条款',errorCode: 'CONSENT_REQUIRED',fieldErrors: {} }); return;
    }
    state.update({ busy: true,pending: 'send',error: '',errorCode: '',fieldErrors: {} }); challengeCommand ??= commandId();
    try {
      const result = await api.challenge({ phone: normalized,purpose: value.mode,operation_id: challengeCommand,
        ...(value.mode === 'register' ? { invitation_ref: value.invitation.trim(),age_declaration: { version: value.documents!.age_declaration_version,declared: value.adult },
          document_set_digest: value.documents!.document_set_digest } : {}) });
      if (!current(ticket)) return;
      state.update({ step: 'otp',challenge: result,retryAt: now() + result.retry_after*1000,now: now(),otp: '' });
      verifyCommand = null; challengeCommand = null;
    } catch (failure) {
      if (!current(ticket)) return;
      const errorCode = failure instanceof AccountError ? failure.code : 'SERVICE_UNAVAILABLE';
      const error = errorCode === 'SERVICE_UNAVAILABLE' ? '短信服务暂时不可用，请稍后重试。输入已保留。' :
        failure instanceof Error ? failure.message : '验证码发送失败，请重试';
      state.update({ error,errorCode,fieldErrors: errorCode === 'INVITATION_INVALID' ? { invitation: error } : {} });
      if (failure instanceof AccountError && failure.retryAfter > 0) state.update({ retryAt: now() + failure.retryAfter*1000 });
      if (await recoverChangedTerms(failure,() => { state.update({ consent: false }); challengeCommand = null; },reloadDocuments) && current(ticket)) {
        state.update({ error: '条款已更新，请查看当前版本并重新确认',errorCode: 'TERMS_CHANGED' });
      }
    } finally { if (current(ticket)) state.update({ busy: false,pending: null }); }
  }
  async function verify() {
    if (disposed || state.getSnapshot().busy) return;
    const ticket = ++generation;
    const value = state.getSnapshot();
    if (!value.challenge || !/^\d{6}$/.test(value.otp)) {
      state.update({ error: '请输入短信中的 6 位验证码',errorCode: 'OTP_INVALID',fieldErrors: { otp: '请输入短信中的 6 位验证码' } }); return;
    }
    if (!Number.isFinite(Date.parse(value.challenge.expires_at)) || Date.parse(value.challenge.expires_at) <= now()) {
      state.update({ error: '验证码已过期，请重新获取',errorCode: 'OTP_EXPIRED',fieldErrors: { otp: '验证码已过期，请重新获取' } }); return;
    }
    if (value.mode === 'register' && (!value.adult || !value.consent || !value.documents)) {
      state.update({ error: '请主动声明年龄资格并明确同意当前条款',errorCode: 'CONSENT_REQUIRED',fieldErrors: {} }); return;
    }
    state.update({ busy: true,pending: 'verify',error: '',errorCode: '',fieldErrors: {} }); verifyCommand ??= commandId();
    try {
      const result = await api.verify({ challenge_id: value.challenge.challenge_id,otp: value.otp,operation_id: verifyCommand,
        ...(value.mode === 'register' ? { age_declaration: { version: value.documents!.age_declaration_version,declared: value.adult },
          document_set_digest: value.documents!.document_set_digest,consents: value.documents!.documents.map(doc => ({ release_id: doc.release_id,digest: doc.digest,decision: 'consented' })) } : {}) });
      if (!current(ticket)) return;
      if (!result.account?.admitted) throw new Error('账号尚未完成加入，请重试');
      await onAuthenticated(result.session);
    } catch (failure) {
      if (!current(ticket)) return;
      const error = failure instanceof Error ? failure.message : '验证失败，请重试';
      const errorCode = failure instanceof AccountError ? failure.code : 'SERVICE_UNAVAILABLE';
      state.update({ error,errorCode,fieldErrors: { otp: error } });
      if (failure instanceof AccountError && failure.retryAfter > 0) state.update({ retryAt: now() + failure.retryAfter*1000 });
      if (await recoverChangedTerms(failure,() => {
        state.update({ consent: false,challenge: null,otp: '' }); verifyCommand = null; challengeCommand = null;
      },reloadDocuments) && current(ticket)) state.update({ error: '条款已更新，请查看当前版本并重新获取验证码',errorCode: 'TERMS_CHANGED' });
    } finally { if (current(ticket)) state.update({ busy: false,pending: null }); }
  }
  function edit(patch: Parameters<typeof state.update>[0]) {
    if (!disposed) { generation++; state.update({ ...patch,busy: false,pending: null,error: '',fieldErrors: {} }); }
  }
  return {
    getSnapshot: state.getSnapshot,subscribe: state.subscribe,
    start() { if (!disposed && timer === undefined) timer = setInterval(() => { if (!disposed) state.update({ now: now() }); },1000); },
    dispose() { disposed = true; generation++; documentGeneration++; if (timer !== undefined) clearInterval(timer); timer = undefined; },
    loadDocuments,changeMode,sendCode,verify,
    remaining: () => Math.max(0,Math.ceil((state.getSnapshot().retryAt-state.getSnapshot().now)/1000)),
    setPhone(value: string) { edit({ phone: value,step: 'details',challenge: null,otp: '',retryAt: 0 }); challengeCommand = null; verifyCommand = null; },
    setInvitation(value: string) { edit({ invitation: value }); challengeCommand = null; },
    setAdult(value: boolean) { edit({ adult: value }); challengeCommand = null; },
    setConsent(value: boolean) {
      if (value && (!state.getSnapshot().documents || state.getSnapshot().loadingDocuments)) return;
      edit({ consent: value });
    },
    setOtp(value: string) { edit({ otp: value.replace(/\D/g,'').slice(0,6) }); verifyCommand = null; },
    changeDetails() { edit({ step: 'details',challenge: null,otp: '' }); verifyCommand = null; challengeCommand = null; },
  };
}
