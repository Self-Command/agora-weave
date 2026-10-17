'use client';
import { statePresentation,type BusinessState as State } from '../../../../packages/design/src/states';
import { Button } from './ui/button';

export function BusinessState({ state,onRetry,onQuery }: { state:State;onRetry?:()=>void;onQuery?:()=>void }) {
  const value=statePresentation(state);
  return <section role={state==='error'?'alert':'status'} aria-live={value.announcement} aria-busy={value.busy} className="business-state">
    <h2>{value.title}</h2><p>{value.description}</p>
    {value.canRetry && onRetry ? <Button onClick={onRetry} className="business-state-action">重试</Button> : null}
    {value.canQuery && onQuery ? <Button onClick={onQuery} className="business-state-action">查询结果</Button> : null}
  </section>;
}
