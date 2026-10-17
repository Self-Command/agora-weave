import { AccountError,type AccountApi,type RecoveryCase,type SessionTokens } from './api.ts';
import { controllerState,type AccountLifecycle } from './controller-state.ts';
import { submitRecoveryRequest } from './recovery.ts';

const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function validRecoveryCase(value:unknown):value is RecoveryCase {
  if (!value||typeof value!=='object') return false;
  const record=value as Record<string,unknown>;
  return typeof record.id==='string'&&uuid.test(record.id)&&
    typeof record.mode==='string'&&['trusted','manual','mfa_emergency'].includes(record.mode)&&
    typeof record.state==='string'&&['received','reviewing','approved','rejected','need_evidence'].includes(record.state)&&
    typeof record.row_version==='number'&&Number.isSafeInteger(record.row_version)&&record.row_version>0&&
    typeof record.created_at==='string'&&Number.isFinite(Date.parse(record.created_at))&&
    typeof record.updated_at==='string'&&Number.isFinite(Date.parse(record.updated_at));
}

export function createRecoveryController(api: AccountApi,initialSession: SessionTokens,onSignedOut: () => Promise<void>,
  lifecycle: AccountLifecycle,commandId: () => string,now:()=>number=Date.now) {
  let session=initialSession;
  const state = controllerState({ record: null as RecoveryCase | null,caseId: null as string | null,busy: false,error: '',errorCode: '',
    pending: null as { operationId: string; mode: 'trusted'|'manual' } | null,active: lifecycle.isActive() });
  let mounted = true,disposed = false,generation = 0,mutationGeneration = 0,unsubscribe: (() => void) | undefined;
  const commands = new Map<string,string>();
  let inFlight:{mutation:number;mode:'trusted'|'manual';operationId:string}|null=null;
  const tokenCurrent=()=>Number.isFinite(session.expires_at)&&session.expires_at*1000>now();
  function deferExpired() {
    if (tokenCurrent()) return false;
    const pending=inFlight?{operationId:inFlight.operationId,mode:inFlight.mode}:state.getSnapshot().pending;
    generation++;inFlight=null;
    state.update({record:null,busy:false,error:'',errorCode:'',pending});
    return true;
  }
  async function handleFailure(failure: unknown) {
    if (disposed) return;
    if (deferExpired()) return;
    if (failure instanceof AccountError && failure.code === 'SESSION_INVALID') { state.update({ record: null,caseId: null,pending: null,error: '',errorCode: 'SESSION_INVALID' }); if (!disposed) await onSignedOut(); return; }
    if (lifecycle.isActive()) state.update({ error: failure instanceof Error ? failure.message : '申请状态暂时不可用，请重试',
      errorCode: failure instanceof AccountError ? failure.code : 'SERVICE_UNAVAILABLE' });
  }
  async function refresh() {
    if (disposed||deferExpired()) return;
    const caseId = state.getSnapshot().caseId;
    if (!caseId) return;
    const ticket = ++generation;
    state.update({ busy: true,error: '',errorCode: '',record: null });
    try {
      const result = await api.recoveryCase(session.access_token,caseId);
      if (!validRecoveryCase(result)||result.id!==caseId) throw new AccountError('SERVICE_UNAVAILABLE','当前申请状态暂时不可用，请重新查询。');
      if (ticket===generation&&lifecycle.isActive()&&!deferExpired()) state.update({ record: result });
    } catch (failure) { if (ticket === generation) await handleFailure(failure); }
    finally { if (ticket === generation) state.update({ busy: false }); }
  }
  async function submit(mode: 'trusted'|'manual') {
    if (disposed||deferExpired()) return;
    const ticket = ++generation,mutation = ++mutationGeneration;
    state.update({ busy: true,error: '',errorCode: '' });
    let command = commands.get(mode);
    if (!command) { command = commandId(); commands.set(mode,command); }
    inFlight={mutation,mode,operationId:command};
    try {
      await submitRecoveryRequest(async () => {
        const result=await api.requestRecovery(session.access_token,mode,command);
        if (!validRecoveryCase(result)) throw new AccountError('NETWORK_UNCONFIRMED','提交结果尚未确认，请查询本次申请。');
        return result;
      },{
        mounted: () => mounted && mutation === mutationGeneration,active: () => lifecycle.isActive()&&tokenCurrent(),current: () => ticket === generation,
        remember: result => {
          if (inFlight?.mutation===mutation) inFlight=null;
          state.update({ caseId: result.id,pending: null });commands.delete(mode);
          deferExpired();
        },show: record => state.update({ record }),refresh,
      });
    } catch (failure) {
      if (!disposed&&mutation===mutationGeneration&&deferExpired()) return;
      if (!disposed && mutation === mutationGeneration && failure instanceof AccountError && ['NETWORK_UNCONFIRMED','SERVICE_UNAVAILABLE'].includes(failure.code)) {
        state.update({ pending: { operationId: command,mode } });
      }
      if (!disposed && ticket === generation && mutation === mutationGeneration) await handleFailure(failure);
    }
    finally {
      if (inFlight?.mutation===mutation) inFlight=null;
      if (!disposed && ticket === generation && mutation === mutationGeneration) state.update({ busy: false });
    }
  }
  async function queryPending() {
    const pending=state.getSnapshot().pending;
    if (disposed||deferExpired()||!pending||state.getSnapshot().busy||!lifecycle.isActive()) return;
    const ticket=++generation;state.update({ busy: true,error: '',errorCode: '' });
    try {
      const result=await api.operation(session.access_token,pending.operationId);
      if (disposed || ticket!==generation || !lifecycle.isActive()) return;
      if (deferExpired()) return;
      if (result.operation_id!==pending.operationId || result.action!=='recovery.request') throw new AccountError('CONFLICT','操作结果与本次申请不匹配，请稍后重试');
      if (result.state==='succeeded') {
        // The operation query deliberately has no private result_ref. Replay the
        // same logical command to retrieve its existing case under current auth.
        await submit(pending.mode);
      } else if (result.state==='failed') {
        commands.delete(pending.mode);state.update({ pending: null,error: '本次申请未受理，请重新提交。' });
      } else state.update({ error: '提交结果尚未确认，请稍后再次查询。' });
    } catch (failure) { if (!disposed && ticket===generation) await handleFailure(failure); }
    finally { if (!disposed && ticket===generation) state.update({ busy: false }); }
  }
  return {
    getSnapshot: state.getSnapshot,subscribe: state.subscribe,refresh,submit,queryPending,
    updateSession(value:SessionTokens) {
      if (disposed) return;
      if (session.access_token===value.access_token) { session=value;return; }
      const pending=inFlight?{operationId:inFlight.operationId,mode:inFlight.mode}:state.getSnapshot().pending;
      session=value;generation++;mutationGeneration++;inFlight=null;
      state.update({ busy:false,error:'',errorCode:'',pending });
    },
    start() {
      if (disposed || unsubscribe) return;
      mounted = true;
      unsubscribe = lifecycle.subscribe(() => {
        generation++; state.update({ record: null,busy: false,error: '',errorCode: '',active: lifecycle.isActive() });
        if (lifecycle.isActive()) void refresh();
      });
    },
    dispose() { disposed = true; mounted = false; generation++; mutationGeneration++; unsubscribe?.(); unsubscribe = undefined; },
  };
}
