import assert from 'node:assert/strict';
import { test } from 'node:test';
import { design,themes } from '../../../packages/design/src/tokens.ts';
import { statePresentation } from '../../../packages/design/src/states.ts';
const luminance=(value:string)=>{
  const parts=value.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return parts[0]*0.2126+parts[1]*0.7152+parts[2]*0.0722;
};
test('DS01: necessary text, errors and inverse buttons have sufficient contrast in both actual palettes',()=>{
  for(const colors of Object.values(themes))for(const foreground of [colors.fg,colors.secondary,colors.error]){
    const pair=[luminance(foreground),luminance(colors.bg)].sort((a,b)=>b-a);assert.ok((pair[0]+0.05)/(pair[1]+0.05)>=4.5);
  }
  assert.ok(design.touch.ios>=44);assert.ok(design.touch.android>=48);assert.ok(design.touch.web>=44);assert.equal(design.motion.reduced,0);
});
test('DS02: loading, unavailable, unknown outcome and retryable failure have distinct truthful actions and text',()=>{
  assert.equal(statePresentation('loading').busy,true);assert.equal(statePresentation('loading').canRetry,false);
  assert.equal(statePresentation('error').canRetry,true);assert.match(statePresentation('error').description,/保留/);
  assert.equal(statePresentation('pending').canQuery,true);assert.equal(statePresentation('pending').canRetry,false);
  assert.equal(statePresentation('unavailable').canRetry,false);assert.notEqual(statePresentation('empty').title,statePresentation('unavailable').title);
  for(const state of ['forbidden','incompatible'] as const) {
    assert.equal(statePresentation(state).busy,false);assert.equal(statePresentation(state).canRetry,false);assert.equal(statePresentation(state).canQuery,false);
    assert.match(statePresentation(state).description,/保留/);
  }
  assert.notEqual(statePresentation('forbidden').title,statePresentation('incompatible').title);
});
