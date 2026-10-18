import assert from 'node:assert/strict';
import { afterEach,test } from 'node:test';
import { guestFeedApi,FeedError,type LatestPost,type LatestPage,type GuestFeedApi } from '../../../apps/mobile/src/features/feed/api.ts';
import { createGuestFeedController } from '../../../apps/mobile/src/features/feed/feed-controller.ts';

const savedFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=savedFetch;});
const id=(n:number)=>`90000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const item=(n:number):LatestPost=>({id:id(n),author_id:id(50),revision_id:id(100+n),body:'Controlled public body '+n,
  row_version:1,visibility:'public',created_at:'2026-10-17T00:00:00.123456Z'});
const detail=(n:number)=>{const {created_at,...body}=item(n);void created_at;return body;};
const page=(items:LatestPost[]=[],next:string|null=null):LatestPage=>({items,next_cursor:next,has_more:next!==null,config_version:'fixture-current'});
const deferred=<T>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return {promise,resolve};};
function lifecycle() {
  let active=true;const listeners=new Set<()=>void>();
  return {isActive:()=>active,subscribe:(fn:()=>void)=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},
    set(value:boolean){active=value;listeners.forEach(fn=>fn());}};
}
const api=(patch:Partial<GuestFeedApi>={}):GuestFeedApi=>({latest:async()=>page(),post:async value=>detail(Number(value.slice(-12))),...patch});

test('FM01: anonymous latest and detail send only read requests without Authorization, cookies or phone-service dependencies',async()=>{
  const requests:{url:string;init?:RequestInit}[]=[];
  globalThis.fetch=async(input,init)=>{
    const url=String(input);requests.push({url,init});
    return Response.json({config_version:'fixture-current',data:url.includes('/posts/') ? detail(1) : {items:[item(1)],next_cursor:null,has_more:false}});
  };
  const client=guestFeedApi('https://api.example.invalid/core/api/v1','fixture-v1');
  assert.equal((await client.latest()).items[0].id,id(1));
  assert.equal((await client.post(id(1))).id,id(1));
  assert.deepEqual(requests.map(entry=>entry.url),['https://api.example.invalid/core/api/v1/feeds/latest','https://api.example.invalid/core/api/v1/posts/'+id(1)]);
  for (const {init} of requests) {
    assert.equal(init?.method,'GET');assert.equal(init?.credentials,'omit');assert.equal(init?.cache,'no-store');
    assert.equal(new Headers(init?.headers).has('Authorization'),false);
    assert.equal(new Headers(init?.headers).get('X-Client-Release'),'fixture-v1');assert.equal(init?.body,undefined);
  }
  for (const base of ['http://api.example.invalid','https://user:pass@api.example.invalid','https://api.example.invalid?token=secret']) {
    await assert.rejects(guestFeedApi(base,'fixture-v1').latest(),(error:unknown)=>error instanceof FeedError && error.code==='SERVICE_UNAVAILABLE');
  }
  assert.equal(requests.length,2);
});

test('FM02: malformed pages, nonpublic projections, duplicate ids and mismatched detail ids never become visible client data',async()=>{
  const valid={items:[item(1)],next_cursor:null,has_more:false};
  for (const data of [{...valid,items:[{...item(1),visibility:'self'}]}, {...valid,items:[item(1),item(1)]},
    {...valid,items:[],has_more:true,next_cursor:'cursor'},
    {...valid,items:[{...item(1),secret_ref:'hidden'}]}, {...valid,next_cursor:'old'}, {...valid,items:Array(51).fill(item(1))}]) {
    globalThis.fetch=async()=>Response.json({config_version:'fixture-current',data});
    await assert.rejects(guestFeedApi('https://api.example.invalid','fixture-v1').latest(),FeedError);
  }
  globalThis.fetch=async()=>Response.json({config_version:'fixture-current',data:detail(2)});
  await assert.rejects(guestFeedApi('https://api.example.invalid','fixture-v1').post(id(1)),FeedError);
  let called=false;globalThis.fetch=async()=>{called=true;throw new Error();};
  await assert.rejects(guestFeedApi('https://api.example.invalid','fixture-v1').post('../me'),FeedError);
  await assert.rejects(guestFeedApi('https://api.example.invalid','fixture-v1').latest('bad cursor'),FeedError);
  assert.equal(called,false);
});

test('FM03: empty results stay empty and refresh failure clears old summaries with a truthful retry state',async()=>{
  let fail=false,empty=false;
  const controller=createGuestFeedController(api({latest:async()=>{if(fail)throw new FeedError('NETWORK_UNCONFIRMED','Network failed');return page(empty?[]:[item(1)]);}}),lifecycle());
  await controller.refresh();assert.equal(controller.getSnapshot().items.length,1);
  fail=true;await controller.refresh();assert.deepEqual(controller.getSnapshot().items,[]);assert.equal(controller.getSnapshot().errorCode,'NETWORK_UNCONFIRMED');
  fail=false;empty=true;await controller.refresh();assert.deepEqual(controller.getSnapshot().items,[]);assert.equal(controller.getSnapshot().error,'');assert.equal(controller.getSnapshot().loading,false);
  controller.dispose();
});

test('FM04: backgrounding clears public outputs and late requests cannot overwrite a newer refresh or disposed controller',async()=>{
  const pending=deferred<LatestPage>(),visibility=lifecycle();let calls=0;
  const controller=createGuestFeedController(api({latest:async()=>++calls===1 ? pending.promise : page([item(2)])}),visibility);
  const first=controller.refresh();await controller.refresh();assert.equal(controller.getSnapshot().items[0].id,id(2));
  pending.resolve(page([item(1)]));await first;assert.equal(controller.getSnapshot().items[0].id,id(2));
  visibility.set(false);assert.deepEqual(controller.getSnapshot().items,[]);assert.equal(controller.getSnapshot().active,false);
  controller.dispose();visibility.set(true);assert.equal(calls,2);
});

test('FM05: pagination rechecks retained bodies, removes unavailable posts, deduplicates ids and clears invalidated cursor output',async()=>{
  let broken=false;const calls:string[]=[];
  const controller=createGuestFeedController(api({latest:async cursor=>{
    if (broken)throw new FeedError('INVALID_INPUT','Refresh required');
    return cursor ? page([item(2),item(3)],'page3') : page([item(1),item(2)],'page2');
  },post:async value=>{calls.push(value);if(value===id(1))throw new FeedError('NOT_FOUND','Unavailable');return {...detail(2),body:'Current approved body'};}}),lifecycle());
  await controller.refresh();await controller.loadMore();
  assert.deepEqual(calls,[id(1),id(2)]);assert.deepEqual(controller.getSnapshot().items.map(value=>value.id),[id(2),id(3)]);
  assert.equal(controller.getSnapshot().items[0].body,'Current approved body');
  broken=true;await controller.loadMore();assert.deepEqual(controller.getSnapshot().items,[]);assert.equal(controller.getSnapshot().next,null);assert.equal(controller.getSnapshot().errorCode,'INVALID_INPUT');
  controller.dispose();
});

test('FM06: detail reads clear previous bodies, ignore late navigation results and remove a newly unavailable list item',async()=>{
  const old=deferred<ReturnType<typeof detail>>();let unavailable=false;
  const controller=createGuestFeedController(api({latest:async()=>page([item(1),item(2)]),post:async value=>{
    if(value===id(1))return old.promise;if(unavailable)throw new FeedError('NOT_FOUND','Unavailable');return detail(2);
  }}),lifecycle());
  await controller.refresh();const first=controller.openPost(id(1));assert.equal(controller.getSnapshot().detail,null);
  await controller.openPost(id(2));old.resolve(detail(1));await first;assert.equal(controller.getSnapshot().detail?.id,id(2));
  unavailable=true;await controller.openPost(id(2));assert.equal(controller.getSnapshot().detail,null);assert.equal(controller.getSnapshot().detailErrorCode,'NOT_FOUND');
  assert.deepEqual(controller.getSnapshot().items.map(value=>value.id),[id(1)]);
  await controller.closePost();assert.equal(controller.getSnapshot().detailId,null);controller.dispose();
});
