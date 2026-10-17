import type { PolicyContext } from './context.ts';

export type AuthorizationStore = {
  context(context: PolicyContext): Promise<{ code: string }>;
  resource(context: PolicyContext,target: string,action: string,purpose: string): Promise<{ code: string; data?: Record<string,unknown> }>;
};
export async function authorize(store: AuthorizationStore,context: PolicyContext,action: string,target: string,purpose = 'read') {
  if (context.principal && context.principal.expires_at*1000<=Date.now()) return { code: 'SESSION_INVALID' };
  const current = await store.context(context);
  if (current.code!=='OK') return current;
  if (!['resource.read','media.read','event.read'].includes(action) || purpose!=='read') return { code: 'FORBIDDEN' };
  if (context.principal?.audience==='share-read' && action==='event.read') return { code: 'FORBIDDEN' };
  return store.resource(context,target,action,purpose);
}
