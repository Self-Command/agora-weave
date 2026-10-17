'use client';
import { statePresentation,type BusinessState as State } from '../../../../packages/design/src/states';

export function ReadingState({ state,onRetry }: { state:State;onRetry?:()=>void }) {
  const value=statePresentation(state);
  return <section role={state==='error'?'alert':'status'} aria-live={value.announcement} aria-busy={value.busy} className="reading-state">
    <h2>{value.title}</h2><p>{value.description}</p>
    {value.canRetry && onRetry ? <button type="button" onClick={onRetry}>重试</button> : null}
  </section>;
}
