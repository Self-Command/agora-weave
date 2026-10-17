export type EffectLease={id:string;lease:string};
export type EffectStore={claim():Promise<EffectLease[]>;complete(lease:EffectLease):Promise<void>};
export async function drainOutbox(store:EffectStore){
  const leases=await store.claim();
  for(const lease of leases)await store.complete(lease);
  return leases.length;
}
