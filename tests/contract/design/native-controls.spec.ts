import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act,createElement,type ComponentType } from 'react';
import { createRoot,type TestInstance } from 'test-renderer';
import { nativeComponent,nativeTheme } from '../../fixtures/core/native-components.ts';
import { accountApi,AccountError,type AuthVerification } from '../../../apps/mobile/src/features/account/api.ts';
import { createAuthController } from '../../../apps/mobile/src/features/account/auth-controller.ts';

(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const controls=nativeComponent('apps/mobile/src/features/account/AccountLayout.tsx');
const state=nativeComponent('apps/mobile/src/components/BusinessState.tsx');
const pages=nativeComponent('apps/mobile/src/features/account/AuthPages.tsx');
type Props=Record<string,unknown>;
const component=(name:string)=>controls[name] as ComponentType<Props>;
const find=(node:TestInstance,test:(node:TestInstance)=>boolean):TestInstance=>{
  if(test(node))return node;
  for(const child of node.children)if(typeof child!=='string'){try{return find(child,test);}catch{/* Try the next rendered child. */}}
  throw new Error('Expected rendered control missing');
};
const textOf=(node:TestInstance):string=>node.children.map(child=>typeof child==='string'?child:textOf(child)).join('');

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
      const disabled=find(root.container,node=>node.type==='Pressable');assert.equal(disabled.props.disabled,true);assert.equal(disabled.props.accessibilityState.busy,false);
    }
  } finally {await act(async()=>root.unmount());}
});

test('NC02: the actual text input forwards typed text and focus callbacks while preserving field-error accessibility',async()=>{
  const values:string[]=[];let focused=0,blurred=0;const root=createRoot();
  try {
    await act(async()=>{root.render(createElement(component('AccountField'),{label:'手机号',value:'',error:'请输入有效手机号',
      onChangeText:(value:string)=>values.push(value),onFocus:()=>focused++,onBlur:()=>blurred++}));});
    const input=find(root.container,node=>node.type==='TextInput');
    assert.equal(input.props.accessibilityLabel,'手机号');assert.equal(input.props.accessibilityHint,'请输入有效手机号');
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

test('NC05: actual account inputs and OTP actions query one uncertain operation after expiry and allow explicit cancellation',async context=>{
  context.mock.timers.enable({apis:['setInterval']});
  let now=1000,ids=0,closed=0;const verified:unknown[]=[],queried:AuthVerification[]=[];
  const controller=createAuthController({...accountApi(undefined,'component-test'),
    challenge:async body=>{assert.deepEqual(body,{phone:'+8613800138000',purpose:'login',operation_id:'command-1'});
      return {challenge_id:'challenge',expires_at:new Date(10_000).toISOString(),retry_after:0};},
    verify:async body=>{verified.push(body);throw new AccountError('NETWORK_UNCONFIRMED','lost response');},
    authOperation:async body=>{queried.push(body);return {operation_id:body.operation_id,state:'unknown'};},
  },async()=>assert.fail('An unknown operation must not publish a session'),()=>`command-${++ids}`,()=>now);
  const root=createRoot();controller.start();
  try {
    await act(async()=>root.render(createElement(pages.AuthPages as ComponentType<Props>,{controller,onClose:()=>closed++})));
    await act(async()=>find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-phone').props.onChangeText('13800138000'));
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code').props.onPress());
    await act(async()=>find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-otp').props.onChangeText('123456'));
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-verify').props.onPress());
    assert.equal(verified.length,1);assert.equal(queried.length,1);
    assert.equal(find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-otp').props.editable,false);
    assert.equal(find(root.container,node=>node.type==='Pressable'&&textOf(node)==='重新获取').props.disabled,true);
    await act(async()=>{now=20_000;context.mock.timers.tick(1000);});
    const query=find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-verify');
    assert.equal(query.props.accessibilityLabel,'登录');assert.equal(query.props.disabled,false);
    await act(async()=>query.props.onPress());assert.equal(verified.length,1);assert.equal(queried.length,2);
    assert.deepEqual(queried[0],verified[0]);assert.deepEqual(queried[1],verified[0]);
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&textOf(node)==='更换手机号').props.onPress());
    assert.equal(controller.getSnapshot().step,'details');assert.equal(controller.getSnapshot().challenge,null);assert.equal(controller.getSnapshot().otp,'');
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.accessibilityLabel==='关闭').props.onPress());assert.equal(closed,1);
  } finally {controller.dispose();await act(async()=>root.unmount());}
});

test('NC06: actual registration controls require active choices and submit the current consent proof with corrected OTP input',async()=>{
  const documents={document_set_digest:'set-1',age_declaration_version:'adult-1',
    documents:[{release_id:'terms-1',digest:'digest-1',kind:'terms',title:'社区条款',body:'当前真实发布内容'}]};
  let ids=0,authenticated=0;const challenges:unknown[]=[],verifications:unknown[]=[];
  const controller=createAuthController({...accountApi(undefined,'component-test'),documents:async()=>documents,
    challenge:async body=>{challenges.push(body);return {challenge_id:'challenge',expires_at:new Date(60_000).toISOString(),retry_after:0};},
    verify:async body=>{verifications.push(body);if(verifications.length===1)throw new AccountError('OTP_INVALID','验证码不正确，请检查后重试。');
      return {session:{access_token:'access',refresh_token:'refresh',expires_at:100},account:{id:'account',admitted:true}};},
  },async()=>{authenticated++;},()=>`command-${++ids}`,()=>1000);
  const root=createRoot();
  try {
    await act(async()=>root.render(createElement(pages.AuthPages as ComponentType<Props>,{controller,onClose:()=>{}})));
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&textOf(node)==='使用邀请码加入').props.onPress());
    assert.equal(controller.getSnapshot().consent,false);assert.equal(controller.getSnapshot().adult,false);
    assert.equal(find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code').props.disabled,true);
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.accessibilityRole==='link').props.onPress());
    assert.equal(find(root.container,node=>node.type==='Modal').props.visible,true);assert.equal(controller.getSnapshot().consent,false);
    await act(async()=>find(root.container,node=>node.type==='Modal').props.onRequestClose());
    await act(async()=>{
      find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-phone').props.onChangeText('13800138000');
      find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-invitation').props.onChangeText(' invite ');
    });
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.accessibilityLabel==='我主动声明已满 18 岁').props.onPress());
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.accessibilityLabel==='我已阅读并同意当前版本的条款').props.onPress());
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code').props.onPress());
    assert.deepEqual(challenges,[{phone:'+8613800138000',purpose:'register',operation_id:'command-1',invitation_ref:'invite',
      age_declaration:{version:'adult-1',declared:true},document_set_digest:'set-1'}]);
    await act(async()=>find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-otp').props.onChangeText('123456'));
    await act(async()=>find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-verify').props.onPress());
    const rejected=find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-otp');
    assert.equal(rejected.props.value,'123456');assert.equal(rejected.props.accessibilityHint,'验证码不正确，请检查后重试。');
    await act(async()=>rejected.props.onChangeText('654321'));
    await act(async()=>find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-otp').props.onSubmitEditing());
    assert.equal(authenticated,1);assert.deepEqual(verifications,[{challenge_id:'challenge',otp:'123456',operation_id:'command-2',
      age_declaration:{version:'adult-1',declared:true},document_set_digest:'set-1',consents:[{release_id:'terms-1',digest:'digest-1',decision:'consented'}]},
    {challenge_id:'challenge',otp:'654321',operation_id:'command-3',age_declaration:{version:'adult-1',declared:true},
      document_set_digest:'set-1',consents:[{release_id:'terms-1',digest:'digest-1',decision:'consented'}]}]);
  } finally {controller.dispose();await act(async()=>root.unmount());}
});

test('NC07: a real login request failure explicitly clears native button busy while retaining input and enabling retry',async()=>{
  let rejectRequest!:(failure:unknown)=>void;
  const request=new Promise<never>((_resolve,reject)=>{rejectRequest=reject;});
  const controller=createAuthController({...accountApi(undefined,'component-test'),challenge:async()=>request},
    async()=>assert.fail('Failed SMS request cannot authenticate'),()=> 'operation',()=>1000);
  const root=createRoot();let pending:Promise<void>|undefined;
  try {
    await act(async()=>root.render(createElement(pages.AuthPages as ComponentType<Props>,{controller,onClose:()=>{}})));
    await act(async()=>find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-phone').props.onChangeText('13800138000'));
    await act(async()=>{pending=find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code').props.onPress();});
    const busy=find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code');
    assert.equal(controller.getSnapshot().busy,true);assert.equal(busy.props.disabled,true);assert.equal(busy.props.accessibilityState.busy,true);
    assert.equal(busy.props.accessibilityLabel,'正在获取验证码');
    assert.equal(find(root.container,node=>node.type==='ActivityIndicator').props.size,'small');
    await act(async()=>{rejectRequest(new AccountError('SERVICE_UNAVAILABLE','账号服务暂时不可用，请稍后重试'));await pending;});
    const ready=find(root.container,node=>node.type==='Pressable'&&node.props.testID==='account-send-code');
    assert.equal(controller.getSnapshot().busy,false);assert.equal(controller.getSnapshot().pending,null);
    assert.equal(ready.props.disabled,false);assert.equal(ready.props.accessibilityState.disabled,false);
    assert.equal(ready.props.accessibilityState.busy,false);assert.equal(ready.props.accessibilityLabel,'获取验证码');
    assert.equal(find(root.container,node=>node.type==='TextInput'&&node.props.testID==='account-phone').props.value,'13800138000');
    assert.throws(()=>find(ready,node=>node.type==='ActivityIndicator'),/Expected rendered control missing/);
  } finally {controller.dispose();await act(async()=>root.unmount());}
});
