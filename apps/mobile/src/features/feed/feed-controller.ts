import { controllerState,type AccountLifecycle } from '../account/controller-state.ts';
import { FeedError,type GuestFeedApi,type LatestPost,type PublicPost } from './api.ts';

export function createGuestFeedController(api:GuestFeedApi,lifecycle:AccountLifecycle) {
  const state=controllerState({ items:[] as LatestPost[],next:null as string|null,hasMore:false,loading:false,loadingMore:false,
    error:'',errorCode:'',configVersion:'',detail:null as PublicPost|null,detailId:null as string|null,detailLoading:false,
    detailError:'',detailErrorCode:'',active:lifecycle.isActive() });
  let generation=0,detailGeneration=0,disposed=false;
  const current=(ticket:number)=>!disposed && lifecycle.isActive() && generation===ticket;
  const failure=(error:unknown)=>({ error:error instanceof Error ? error.message : '暂时无法加载，请重试',
    errorCode:error instanceof FeedError ? error.code : 'SERVICE_UNAVAILABLE' });
  async function refresh() {
    if (disposed || !lifecycle.isActive()) return;
    const ticket=++generation;
    state.update({ items:[],next:null,hasMore:false,loading:true,loadingMore:false,error:'',errorCode:'',configVersion:'' });
    try {
      const page=await api.latest();
      if (current(ticket)) state.update({ items:page.items,next:page.next_cursor,hasMore:page.has_more,configVersion:page.config_version });
    } catch (error) { if (current(ticket)) state.update(failure(error)); }
    finally { if (current(ticket)) state.update({ loading:false }); }
  }
  async function loadMore() {
    const previous=state.getSnapshot();
    if (disposed || !lifecycle.isActive() || previous.loading || previous.loadingMore || !previous.next || !previous.hasMore) return;
    const ticket=++generation;
    // Hide retained summaries while their current public qualification is checked.
    state.update({ items:[],loadingMore:true,error:'',errorCode:'' });
    const retained:LatestPost[]=[];
    let retainedCurrent=false;
    try {
      for (let index=0;index<previous.items.length;index+=4) {
        const batch=await Promise.all(previous.items.slice(index,index+4).map(async item=>{
          try { const value=await api.post(item.id);return value.visibility==='public'?{ ...value,visibility:'public' as const,created_at:item.created_at }:null; }
          catch (error) { if (error instanceof FeedError && error.code==='NOT_FOUND') return null; throw error; }
        }));
        if (!current(ticket)) return;
        retained.push(...batch.filter((item):item is LatestPost=>item!==null));
      }
      retainedCurrent=true;
      const page=await api.latest(previous.next);
      if (!current(ticket)) return;
      if (page.config_version!==previous.configVersion) throw new FeedError('INVALID_INPUT','内容列表已变化，请刷新重试');
      const seen=new Set(retained.map(item=>item.id));
      state.update({ items:[...retained,...page.items.filter(item=>!seen.has(item.id))],next:page.next_cursor,hasMore:page.has_more });
    } catch (error) {
      if (current(ticket)) {
        const retryable=retainedCurrent && error instanceof FeedError && ['NETWORK_UNCONFIRMED','SERVICE_UNAVAILABLE'].includes(error.code);
        state.update({ ...failure(error),items:retryable ? retained : [],next:retryable ? previous.next : null,hasMore:retryable });
      }
    }
    finally { if (current(ticket)) state.update({ loadingMore:false }); }
  }
  async function openPost(id:string) {
    if (disposed || !lifecycle.isActive()) return;
    const ticket=++detailGeneration;
    state.update({ detail:null,detailId:id,detailLoading:true,detailError:'',detailErrorCode:'' });
    try {
      const item=await api.post(id);
      if (!disposed && lifecycle.isActive() && ticket===detailGeneration) state.update({ detail:item });
    } catch (error) {
      if (disposed || !lifecycle.isActive() || ticket!==detailGeneration) return;
      const result=failure(error);
      state.update({ detail:null,detailError:result.error,detailErrorCode:result.errorCode,
        items:state.getSnapshot().items.filter(item=>item.id!==id) });
    } finally { if (!disposed && lifecycle.isActive() && ticket===detailGeneration) state.update({ detailLoading:false }); }
  }
  async function closePost() {
    if (disposed) return;
    detailGeneration++;
    state.update({ detail:null,detailId:null,detailLoading:false,detailError:'',detailErrorCode:'' });
    await refresh();
  }
  const unsubscribe=lifecycle.subscribe(()=>{
    if (disposed) return;
    generation++;detailGeneration++;
    const detailId=state.getSnapshot().detailId,active=lifecycle.isActive();
    state.update({ active,items:[],next:null,hasMore:false,loading:false,loadingMore:false,error:'',errorCode:'',
      detail:null,detailLoading:false,detailError:'',detailErrorCode:'' });
    if (active) { if (detailId) void openPost(detailId);else void refresh(); }
  });
  return { getSnapshot:state.getSnapshot,subscribe:state.subscribe,refresh,loadMore,openPost,closePost,
    dispose() { disposed=true;generation++;detailGeneration++;unsubscribe(); } };
}
