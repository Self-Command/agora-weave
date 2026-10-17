/** SQL commits the inbox and its durable internal effect in one transaction. */
export function effectResult(value:{code:string;reused?:boolean}){
  if(value.code==='OK')return value.reused?'already_applied':'applied';
  if(['FORBIDDEN','CONFLICT','NOT_FOUND'].includes(value.code))return 'not_applied';
  throw new Error('EFFECT_UNAVAILABLE');
}
