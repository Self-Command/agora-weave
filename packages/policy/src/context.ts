export type Audience = 'authenticated' | 'share-read';
export type Principal = { account: string; session: string; audience: Audience; expires_at: number };
export type PolicyContext = { principal: Principal | null; environment: 'dev' | 'test' | 'production'; plugin: string; installation_epoch: number };

/** Construct only after verifying the token and resolving server-owned environment/installation facts. */
export function policyContext(principal: Principal | null,environment: string,plugin = 'core',epoch = 1): PolicyContext {
  if (!['dev','test','production'].includes(environment) || !/^[a-z][a-z0-9_.-]{0,63}$/.test(plugin) ||
    !Number.isSafeInteger(epoch) || epoch<1 || principal && principal.expires_at*1000<=Date.now()) throw new Error('SESSION_INVALID');
  return Object.freeze({ principal,environment: environment as PolicyContext['environment'],plugin,installation_epoch: epoch });
}
