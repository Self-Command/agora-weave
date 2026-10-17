import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act,createElement,type ComponentType } from 'react';
import { createRoot,type TestInstance } from 'test-renderer';
import { nativeComponent,nativeTheme } from '../../fixtures/core/native-components.ts';

(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const controls=nativeComponent('apps/mobile/src/features/account/AccountLayout.tsx');
const state=nativeComponent('apps/mobile/src/components/BusinessState.tsx');
type Props=Record<string,unknown>;
const component=(name:string)=>controls[name] as ComponentType<Props>;
const find=(node:TestInstance,test:(node:TestInstance)=>boolean):TestInstance=>{
  if(test(node))return node;
  for(const child of node.children)if(typeof child!=='string'){try{return find(child,test);}catch{/* Try the next rendered child. */}}
  throw new Error('Expected rendered control missing');
};

test('NC01: the actual named primary control binds its action and renders disabled and busy states consistently',async()=>{
  let pressed=0;const root=createRoot();
  try {
    for(const theme of ['light','dark'] as const) {
      nativeTheme(theme);
      await act(async()=>{root.render(createElement(component('AccountButton'),{title:'获取验证码',onPress:()=>pressed++}));});
      const button=find(root.container,node=>node.type==='Pressable');
      assert.equal(button.props.accessibilityLabel,'获取验证码');assert.equal(button.props.disabled,false);
      await act(async()=>{button.props.onPress();});assert.equal(pressed,theme==='light'?1:2);
      await act(async()=>{root.render(createElement(component('AccountButton'),{title:'获取验证码',onPress:()=>pressed++,busy:true}));});
      const busy=find(root.container,node=>node.type==='Pressable');assert.equal(busy.props.disabled,true);assert.equal(busy.props.accessibilityState.busy,true);
      await act(async()=>{root.render(createElement(component('AccountButton'),{title:'获取验证码',onPress:()=>pressed++,disabled:true}));});
      const disabled=find(root.container,node=>node.type==='Pressable');assert.equal(disabled.props.disabled,true);assert.equal(disabled.props.accessibilityState.busy,undefined);
    }
  } finally {await act(async()=>root.unmount());}
});

test('NC02: the actual text input forwards typed text and focus callbacks while preserving field-error accessibility',async()=>{
  const values:string[]=[];let focused=0,blurred=0;const root=createRoot();
  try {
    await act(async()=>{root.render(createElement(component('AccountField'),{label:'手机号',value:'',error:'请检查手机号',
      onChangeText:(value:string)=>values.push(value),onFocus:()=>focused++,onBlur:()=>blurred++}));});
    const input=find(root.container,node=>node.type==='TextInput');
    assert.equal(input.props.accessibilityLabel,'手机号');assert.equal(input.props.accessibilityHint,'请检查手机号');
    await act(async()=>{input.props.onChangeText('13800138000');input.props.onFocus({nativeEvent:{}});});
    await act(async()=>{find(root.container,node=>node.type==='TextInput').props.onBlur({nativeEvent:{}});});
    assert.deepEqual(values,['13800138000']);assert.equal(focused,1);assert.equal(blurred,1);
  } finally {await act(async()=>root.unmount());}
});

test('NC03: the actual declaration control emits the next checked value and exposes disabled without changing the supplied state',async()=>{
  const changes:boolean[]=[];const root=createRoot();
  try {
    await act(async()=>{root.render(createElement(component('AccountCheck'),{label:'已满18岁',checked:false,onChange:(value:boolean)=>changes.push(value)}));});
    const checkbox=find(root.container,node=>node.type==='Pressable');
    assert.equal(checkbox.props.accessibilityState.checked,false);
    await act(async()=>{checkbox.props.onPress();});assert.deepEqual(changes,[true]);
    await act(async()=>{root.render(createElement(component('AccountCheck'),{label:'已满18岁',checked:true,disabled:true,onChange:(value:boolean)=>changes.push(value)}));});
    const disabled=find(root.container,node=>node.type==='Pressable');assert.equal(disabled.props.disabled,true);assert.equal(disabled.props.accessibilityState.checked,true);
  } finally {await act(async()=>root.unmount());}
});

test('NC04: actual error and pending components route retry and query to distinct actions and truthful feedback',async()=>{
  let retried=0,queried=0;const root=createRoot();
  try {
    const BusinessState=state.BusinessState as ComponentType<Props>;
    await act(async()=>{root.render(createElement(BusinessState,{state:'error',onRetry:()=>retried++,onQuery:()=>queried++}));});
    const retry=find(root.container,node=>node.type==='ComposeButton');await act(async()=>{retry.props.onClick();});
    assert.equal(retried,1);assert.equal(queried,0);
    await act(async()=>{root.render(createElement(BusinessState,{state:'pending',onRetry:()=>retried++,onQuery:()=>queried++}));});
    const query=find(root.container,node=>node.type==='ComposeButton');await act(async()=>{query.props.onClick();});
    assert.equal(retried,1);assert.equal(queried,1);
    await act(async()=>{root.render(createElement(BusinessState,{state:'loading'}));});
    assert.equal(find(root.container,node=>node.type==='ActivityIndicator').props.accessibilityLabel,'正在加载');
  } finally {await act(async()=>root.unmount());}
});
