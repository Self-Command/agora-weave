import { AccountError } from './api.ts';

/** A new document set always requires a new explicit decision and a new logical command. */
export async function recoverChangedTerms(error: unknown,invalidate: () => void,reload: () => Promise<void>) {
  if (!(error instanceof AccountError) || error.code !== 'TERMS_CHANGED') return false;
  invalidate(); await reload(); return true;
}
