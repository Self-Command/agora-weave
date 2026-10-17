import { AccountError,type AccountApi,type DeviceSession,type SessionTokens } from './api.ts';
import { controllerState,type AccountLifecycle } from './controller-state.ts';
import { confirmRevocation } from './recovery.ts';

export function createSecurityController(api: AccountApi,initialSession: SessionTokens,onSignedOut: () => Promise<void>,
  lifecycle: AccountLifecycle,commandId: () => string,now:()=>number=Date.now) {
  let session=initialSession;
  const state = controllerState({ items: [] as DeviceSession[],next: null as string | null,loading: false,busy: false,error: '',errorCode: '',notice: '',
    revokingId: null as string | null,pendingRevocation: null as { target: string; operationId: string } | null,
    pendingLogout: false,active: lifecycle.isActive() });
  let logoutCommand: string | null = null,generation = 0,unsubscribe: (() => void) | undefined;
  let disposed = false,mutationGeneration = 0;
  let inFlight: { ticket:number;kind:'revoke';target:string;operationId:string }|{ ticket:number;kind:'logout';operationId:string }|null=null;
  const currentMutation = (ticket: number) => !disposed && ticket === mutationGeneration;
  const revocations = new Map<string,{ id: string; version: number }>();
  const tokenCurrent=()=>Number.isFinite(session.expires_at)&&session.expires_at*1000>now();
  function deferExpired() {
    if (tokenCurrent()) return false;
    const pending=inFlight?.kind==='revoke'?{target:inFlight.target,operationId:inFlight.operationId}:state.getSnapshot().pendingRevocation;
    const pendingLogout=state.getSnapshot().pendingLogout||inFlight?.kind==='logout';
    generation++;inFlight=null;
    state.update({items:[],next:null,loading:false,busy:false,revokingId:null,error:'',errorCode:'',notice:'',pendingRevocation:pending,pendingLogout});
    return true;
  }
  async function handleFailure(failure: unknown,current: () => boolean,visibleGeneration = generation) {
    if (!current()) return;
    if (deferExpired()) return;
    if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') {
      state.update({ items: [],next: null,error: '',errorCode: 'SESSION_INVALID',notice: '',pendingRevocation: null,pendingLogout: false }); if (current()) await onSignedOut(); return;
    }
    if (lifecycle.isActive() && visibleGeneration===generation) state.update({ error: failure instanceof Error ? failure.message : '加载失败，请重试',
      errorCode: failure instanceof AccountError ? failure.code : 'SERVICE_UNAVAILABLE' });
  }
  async function load(cursor?: string) {
    if (disposed||deferExpired()) return;
    const ticket = ++generation;
    const current = () => !disposed && ticket === generation;
    state.update({ loading: true,error: '',errorCode: '',...(!cursor ? { items: [],next: null } : {}) });
    try {
      const page = await api.sessions(session.access_token,cursor);
      if (!current() || !lifecycle.isActive()) return;
      if (deferExpired()) return;
      const previous = state.getSnapshot().items;
      state.update({ items: cursor ? [...previous,...page.items.filter(item => !previous.some(old => old.id === item.id))] : page.items,next: page.next_cursor });
    } catch (failure) { await handleFailure(failure,current); }
    finally { if (current()) state.update({ loading: false }); }
  }
  async function revoke(item: DeviceSession) {
    if (disposed||deferExpired()) return;
    const ticket = ++mutationGeneration,current = () => currentMutation(ticket);
    generation++;
    const visibleGeneration=generation;
    state.update({ busy: true,loading: false,error: '',notice: '',revokingId: item.id }); let command = revocations.get(item.id);
    if (!command) { command = { id: commandId(),version: item.row_version }; revocations.set(item.id,command); }
    inFlight={ ticket,kind:'revoke',target:item.id,operationId:command.id };
    try {
      await api.revoke(session.access_token,item.id,command.version,command.id);
      if (!current()) return;
      if (inFlight?.ticket===ticket) inFlight=null;
      revocations.delete(item.id);state.update({ pendingRevocation: null });
      if (deferExpired()) return;
      if (lifecycle.isActive()) { await load();if (current()&&!deferExpired()) state.update({ notice: '该设备登录已撤销，当前设备不受影响。' }); }
    }
    catch (failure) {
      if (!current()) return;
      if (deferExpired()) return;
      try {
        const confirmed = await confirmRevocation(api,session.access_token,command.id,failure);
        if (!current()) return;
        if (confirmed) {
          if (inFlight?.ticket===ticket) inFlight=null;
          revocations.delete(item.id);state.update({ pendingRevocation: null });
          if (deferExpired()) return;
          if (lifecycle.isActive()) { await load();if (current()&&!deferExpired()) state.update({ notice: '该设备登录已撤销，当前设备不受影响。' }); }
          return;
        }
      } catch (lookupFailure) { await handleFailure(lookupFailure,current,visibleGeneration); return; }
      if (!current()) return;
      if (failure instanceof AccountError && ['NETWORK_UNCONFIRMED','SERVICE_UNAVAILABLE'].includes(failure.code)) {
        state.update({ pendingRevocation: { target: item.id,operationId: command.id } });
      }
      if (failure instanceof AccountError && failure.code === 'CONFLICT') {
        revocations.delete(item.id);state.update({ pendingRevocation: null });if (lifecycle.isActive()) await load();
      }
      await handleFailure(failure,current,visibleGeneration);
    } finally {
      if (inFlight?.ticket===ticket) inFlight=null;
      if (current()) state.update({ busy: false,revokingId: null });
    }
  }
  async function queryRevocation() {
    const pending = state.getSnapshot().pendingRevocation;
    if (disposed||deferExpired()||!pending||state.getSnapshot().busy||!lifecycle.isActive()) return;
    const ticket=++mutationGeneration,current=()=>currentMutation(ticket),visibleGeneration=generation;
    state.update({ busy: true,error: '',revokingId: pending.target });
    try {
      const result=await api.operation(session.access_token,pending.operationId);
      if (!current() || !lifecycle.isActive() || visibleGeneration!==generation) return;
      if (deferExpired()) return;
      if (result.operation_id!==pending.operationId || result.action!=='session.revoke') throw new AccountError('CONFLICT','操作结果与本次撤销不匹配，请稍后重试');
      if (result.state==='succeeded') {
        revocations.delete(pending.target);state.update({ pendingRevocation: null });await load();
        if (current()&&!deferExpired()) state.update({ notice: '该设备登录已撤销，当前设备不受影响。' });
      } else if (result.state==='failed') {
        revocations.delete(pending.target);state.update({ pendingRevocation: null,error: '本次撤销未完成，请重新操作。' });
      } else state.update({ error: '撤销结果尚未确认，请稍后再次查询。' });
    } catch (failure) { await handleFailure(failure,current,visibleGeneration); }
    finally { if (current()) state.update({ busy: false,revokingId: null }); }
  }
  async function logout() {
    if (disposed||deferExpired()) return;
    const ticket = ++mutationGeneration,current = () => currentMutation(ticket);
    generation++;
    const visibleGeneration=generation;
    state.update({ busy: true,loading: false,error: '' }); logoutCommand ??= commandId();
    inFlight={ ticket,kind:'logout',operationId:logoutCommand };
    try {
      await api.logout(session.access_token,logoutCommand);
      if (!current()) return;
      generation++;
      state.update({ items: [],next: null }); if (current()) await onSignedOut();
    }
    catch (failure) {
      if (current() && failure instanceof AccountError && ['NETWORK_UNCONFIRMED','SERVICE_UNAVAILABLE'].includes(failure.code)) state.update({ pendingLogout: true });
      await handleFailure(failure,current,visibleGeneration);
    } finally {
      if (inFlight?.ticket===ticket) inFlight=null;
      if (current()) state.update({ busy: false });
    }
  }
  async function queryLogout() {
    if (disposed||deferExpired()||!logoutCommand||!state.getSnapshot().pendingLogout||state.getSnapshot().busy||!lifecycle.isActive()) return;
    const ticket=++mutationGeneration,current=()=>currentMutation(ticket),visibleGeneration=generation;state.update({ busy: true,error: '' });
    try {
      const result=await api.operation(session.access_token,logoutCommand);
      if (!current()) return;
      if (result.operation_id===logoutCommand && result.action==='auth.logout' && result.state==='succeeded') {
        generation++;state.update({ items: [],next: null,pendingLogout: false });await onSignedOut();
      } else if (deferExpired()) return;
      else if (result.operation_id===logoutCommand && result.action==='auth.logout' && result.state==='failed' &&
        lifecycle.isActive() && visibleGeneration===generation) {
        logoutCommand=null;state.update({ pendingLogout: false,error: '本次退出未完成，请重新操作。' });
      } else if (lifecycle.isActive() && visibleGeneration===generation) state.update({ error: '退出结果尚未确认，请稍后再次查询。' });
    } catch (failure) { await handleFailure(failure,current,visibleGeneration); }
    finally { if (current()) state.update({ busy: false }); }
  }
  return {
    getSnapshot: state.getSnapshot,subscribe: state.subscribe,load,revoke,logout,queryRevocation,queryLogout,
    updateSession(value:SessionTokens) {
      if (disposed) return;
      if (session.access_token===value.access_token) { session=value;return; }
      const pending=inFlight?.kind==='revoke'?{ target:inFlight.target,operationId:inFlight.operationId }:state.getSnapshot().pendingRevocation;
      const pendingLogout=state.getSnapshot().pendingLogout||inFlight?.kind==='logout';
      session=value;generation++;mutationGeneration++;inFlight=null;
      state.update({ loading:false,busy:false,revokingId:null,error:'',errorCode:'',notice:'',pendingRevocation:pending,pendingLogout });
    },
    canRequestTrustedRecovery: () => state.getSnapshot().items.some(item => item.current && !!item.trusted_at && Date.parse(item.trusted_at) <= Date.now()),
    start() {
      if (disposed || unsubscribe) return;
      unsubscribe = lifecycle.subscribe(() => {
        generation++;state.update({ items: [],next: null,error: '',errorCode: '',notice: '',active: lifecycle.isActive() });
        if (lifecycle.isActive()) void load();
      });
      return load();
    },
    dispose() { disposed = true; generation++; mutationGeneration++; unsubscribe?.(); unsubscribe = undefined; },
  };
}
