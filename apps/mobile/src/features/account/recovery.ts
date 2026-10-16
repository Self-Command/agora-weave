import { AccountError, type AccountApi } from './api.ts';

/** A new document set always requires a new explicit decision and a new logical command. */
export async function recoverChangedTerms(error: unknown,invalidate: () => void,reload: () => Promise<void>) {
  if (!(error instanceof AccountError) || error.code !== 'TERMS_CHANGED') return false;
  invalidate(); await reload(); return true;
}

export async function confirmRevocation(api: Pick<AccountApi,'operation'>,token: string,command: string,failure: unknown): Promise<boolean> {
  if (!(failure instanceof AccountError) || !['NETWORK_UNCONFIRMED','SERVICE_UNAVAILABLE'].includes(failure.code)) return false;
  try {
    const result = await api.operation(token,command);
    return result.operation_id === command && result.action === 'session.revoke' && result.state === 'succeeded';
  } catch (lookupFailure) {
    if (lookupFailure instanceof AccountError && lookupFailure.code === 'SESSION_INVALID') throw lookupFailure;
    return false;
  }
}
