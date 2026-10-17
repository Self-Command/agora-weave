import { AccountError, type AccountApi, type SessionTokens } from './api.ts';
import { controllerState } from './controller-state.ts';

export interface SessionStorage {
  readSession(): Promise<SessionTokens | null>;
  saveSession(session: SessionTokens): Promise<void>;
  clearSession(): Promise<void>;
}

// Native controller instances share these storage functions. Serialize their reads
// and writes so an already-started old save cannot finish after a newer clear.
const storageTails = new WeakMap<SessionStorage['saveSession'],Promise<void>>();
function inStorageOrder<Value>(storage: SessionStorage,operation: () => Promise<Value>): Promise<Value> {
  const result = (storageTails.get(storage.saveSession) || Promise.resolve()).then(operation);
  storageTails.set(storage.saveSession,result.then(() => undefined,() => undefined));
  return result;
}

export function createSessionController(api: AccountApi,storage: SessionStorage,clock = {
  now: () => Date.now(),
  schedule: (callback: () => void,delay: number) => setTimeout(callback,delay),
  cancel: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
}) {
  const state = controllerState({ session: null as SessionTokens | null,ready: false,error: '',recovery: null as { trusted: boolean } | null,accountGeneration: 0 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false,generation = 0,credentialsRejected = false;
  const current = (ticket: number) => !disposed && ticket === generation;
  function cancelTimer() { if (timer !== undefined) clock.cancel(timer); timer = undefined; }
  function setSession(session: SessionTokens | null,patch: Partial<ReturnType<typeof state.getSnapshot>> = {}) {
    cancelTimer();
    state.update({ ...patch,session });
    const ticket = generation;
    if (session && !disposed) timer = clock.schedule(() => { if (current(ticket)) void restore(); },Math.max(0,session.expires_at*1000-clock.now()));
  }
  async function clearStoredSession(ticket: number) {
    try {
      await inStorageOrder(storage,() => current(ticket) ? storage.clearSession() : Promise.resolve());
      return true;
    } catch {
      if (current(ticket)) state.update({ error: '无法清除本机安全登录信息，请重试。' });
      return false;
    }
  }
  function clearIdentity() {
    const previous = state.getSnapshot();
    setSession(null,{ recovery: null,accountGeneration: previous.accountGeneration + (previous.session ? 1 : 0) });
  }
  async function restore() {
    if (disposed) return;
    const ticket = ++generation;
    cancelTimer();state.update({ ready: false,error: '' });
    try {
      if (credentialsRejected) { await clearStoredSession(ticket); return; }
      let value = await inStorageOrder(storage,() => current(ticket) ? storage.readSession() : Promise.resolve(null));
      if (!current(ticket)) return;
      if (value && value.expires_at <= clock.now()/1000) {
        value = (await api.refresh(value.refresh_token)).session;
        if (!current(ticket)) return;
        const refreshed = value;
        await inStorageOrder(storage,() => current(ticket) ? storage.saveSession(refreshed) : Promise.resolve());
      }
      if (current(ticket)) { if (value) setSession(value); else clearIdentity(); }
    } catch (failure) {
      if (!current(ticket)) return;
      if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') {
        credentialsRejected = true;clearIdentity();await clearStoredSession(ticket);
      } else state.update({ error: failure instanceof Error ? failure.message : '无法读取安全登录信息，请重试' });
    } finally { if (current(ticket)) state.update({ ready: true }); }
  }
  async function signedOut() {
    if (disposed) return;
    const ticket = ++generation;
    credentialsRejected = true;state.update({ ready: true,error: '' });clearIdentity();
    await clearStoredSession(ticket);
  }
  async function authenticated(value: SessionTokens) {
    if (disposed) return;
    const ticket = ++generation;
    cancelTimer();
    await inStorageOrder(storage,() => current(ticket) ? storage.saveSession(value) : Promise.resolve());
    if (current(ticket)) {
      credentialsRejected = false;
      setSession(value,{ ready: true,error: '',recovery: null,accountGeneration: state.getSnapshot().accountGeneration + 1 });
    }
  }
  return {
    getSnapshot: state.getSnapshot,subscribe: state.subscribe,
    start: restore,restore,signedOut,authenticated,
    openRecovery: (trusted: boolean) => { if (!disposed) state.update({ recovery: { trusted } }); },
    closeRecovery: () => { if (!disposed) state.update({ recovery: null }); },
    dispose() { disposed = true; generation++; cancelTimer(); },
  };
}
