import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import type { ComponentType } from 'react';
import type { TestInstance } from 'test-renderer';

const require = createRequire(resolve(process.cwd(), 'package.json'));
const React = require('react') as typeof import('react');
const { createRoot } = require('test-renderer') as typeof import('test-renderer');
const ts = require('typescript') as typeof import('typescript');
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
type Props = Record<string, unknown>;
type Call = { path: string; body: Record<string, string> };
const challengeId = '00000000-0000-4000-8000-000000000001';
const json = (data: unknown, status = 200) => new Response(JSON.stringify(status < 400 ? { data } : data), { status, headers: { 'Content-Type': 'application/json' } });

function loginComponent(transport: typeof fetch) {
  const source = resolve(fileURLToPath(new URL('../../../', import.meta.url)), 'apps/admin/src');
  const cache = new Map<string, Record<string, unknown>>();
  const visited: string[] = [];
  const host = (tag: string) => (props: Props) => React.createElement(tag, props);
  const inputOtp = (props: Props) => React.createElement(React.Fragment, null,
    React.createElement('input', { ...props, children: undefined }), props.children as React.ReactNode);
  const selectRoot = (props: Props) => React.createElement('select', { ...props,
    onChange: (event: { target: { value: string } }) => (props.onValueChange as (value: string) => void)(event.target.value)
  });
  const otpContext = React.createContext({ slots: [] });
  const load = (file: string): Record<string, unknown> => {
    const full = resolve(file);
    if (!full.startsWith(source + sep)) throw new Error('Admin component source outside its explicit scope');
    const previous = cache.get(full); if (previous) return previous;
    const module = { exports: {} as Record<string, unknown> }; cache.set(full, module.exports);
    const imported = (name: string): unknown => {
      if (name === 'react' || name === 'react/jsx-runtime') return require(name);
      if (name === 'next/image') return { default: host('img') };
      // Replace only browser-library host primitives; production form, fields, buttons and hooks execute.
      if (name === '@base-ui/react/input') return { Input: host('input') };
      if (name === '@base-ui/react/button') return { Button: host('button') };
      if (name === '@base-ui/react/separator') return { Separator: host('hr') };
      if (name === '@base-ui/react/select') return { Select: { Root: selectRoot, Group: host('optgroup'), Value: host('span'),
        Trigger: host('button'), Icon: host('span'), Portal: host('div'), Positioner: host('div'), Popup: host('div'),
        List: host('div'), GroupLabel: host('span'), Item: host('option'), ItemText: host('span'), ItemIndicator: host('span'),
        Separator: host('hr'), ScrollUpArrow: host('div'), ScrollDownArrow: host('div') } };
      if (name === 'input-otp') return { OTPInput: inputOtp, OTPInputContext: otpContext };
      if (name === '@tabler/icons-react') return { IconLoader: host('svg'), IconMinus: host('svg'), IconSelector: host('svg'),
        IconCheck: host('svg'), IconChevronUp: host('svg'), IconChevronDown: host('svg') };
      if (['class-variance-authority', 'clsx', 'tailwind-merge'].includes(name)) return require(name);
      if (name.startsWith('.') || name.startsWith('@/')) {
        const base = name.startsWith('@/') ? resolve(source, name.slice(2)) : resolve(dirname(full), name);
        const target = [base, base + '.ts', base + '.tsx'].find(candidate => existsSync(candidate));
        if (target) return load(target);
      }
      throw new Error('Unexpected admin component import: ' + name);
    };
    const compiled = ts.transpileModule(readFileSync(full, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX
    } }).outputText;
    runInNewContext(compiled, { module, exports: module.exports, require: imported, crypto, fetch: transport,
      Response, Request, TextEncoder, Error, atob, encodeURIComponent, decodeURIComponent,
      window: { location: { assign: (value: string) => visited.push(value) } } }, { filename: full });
    return module.exports;
  };
  return { Component: load(resolve(source, 'features/management/components/login-form.tsx')).ManagementLoginForm as ComponentType<Props>, visited };
}

function find(node: TestInstance, predicate: (value: TestInstance) => boolean): TestInstance {
  if (predicate(node)) return node;
  for (const child of node.children) if (typeof child !== 'string') {
    try { return find(child, predicate); } catch { /* Search the next rendered child. */ }
  }
  throw new Error('Expected rendered admin control missing');
}
const textOf = (node: TestInstance): string => node.children.map(child => typeof child === 'string' ? child : textOf(child)).join('');
const event = async (action: () => void) => React.act(async () => { action(); await new Promise(resolve => setTimeout(resolve, 0)); });
const submit = (container: TestInstance) => find(container, node => node.type === 'form').props.onSubmit({ preventDefault() {} });
const input = (container: TestInstance, id: string) => find(container, node => node.type === 'input' && node.props.id === id);
const button = (container: TestInstance, title: string) => find(container, node => node.type === 'button' && textOf(node) === title);

for (const initial of ['network', '5xx', 'AUTH_UNCONFIRMED'] as const) {
  test(`AC01-${initial}: actual login controls freeze the original proof and route submit/resend exclusively to its query`, async () => {
    const calls: Call[] = [];
    const transport: typeof fetch = async (url, options) => {
      const call = { path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }; calls.push(call);
      if (call.path.endsWith('/auth/challenges')) return json({ challenge_id: challengeId, expires_at: '2099-01-01T00:00:00Z', retry_after: 60 });
      if (call.path.endsWith('/auth/verify')) {
        if (initial === 'network') throw new Error('synthetic transport interruption');
        return json({ code: initial === '5xx' ? 'SERVICE_UNAVAILABLE' : 'AUTH_UNCONFIRMED', message: '结果未确认', retryable: true }, initial === '5xx' ? 503 : 422);
      }
      return json({ state: 'unknown' });
    };
    const { Component } = loginComponent(transport), root = createRoot();
    try {
      await React.act(async () => { root.render(React.createElement(Component)); });
      await event(() => input(root.container, 'admin-phone').props.onChange({ target: { value: '+15555550123' } }));
      await event(() => submit(root.container));
      await event(() => input(root.container, 'management-code').props.onChange('123456'));
      await event(() => submit(root.container));
      const original = calls.find(call => call.path.endsWith('/auth/verify'))!;
      assert.equal(input(root.container, 'management-code').props.disabled, true);
      assert.equal(input(root.container, 'management-code').props.value, '123456');
      assert.equal(input(root.container, 'admin-phone').props.disabled, true);
      assert.equal(button(root.container, '查询验证结果').props.disabled, false);
      // Even a stale host event cannot replace the frozen OTP proof.
      await event(() => input(root.container, 'management-code').props.onChange('654321'));
      assert.equal(input(root.container, 'management-code').props.value, '123456');
      await event(() => submit(root.container));
      await event(() => find(root.container, node => node.type === 'button' && node.props['data-testid'] === 'admin-resend-code').props.onClick());
      const queries = calls.filter(call => call.path.includes('/auth/operations/'));
      assert.equal(queries.length, 2);
      for (const query of queries) { assert.deepEqual(query.body, original.body); assert.ok(query.path.endsWith('/' + original.body.operation_id)); }
      assert.equal(calls.filter(call => call.path.endsWith('/auth/verify')).length, 1);
      assert.equal(calls.filter(call => call.path.endsWith('/auth/challenges')).length, 1);
      await event(() => button(root.container, '更换手机号').props.onClick());
      assert.equal(input(root.container, 'admin-phone').props.value, '');
      assert.equal(input(root.container, 'admin-phone').props.disabled, false);
      assert.equal(button(root.container, '获取验证码').props.disabled, false);
    } finally { await React.act(async () => root.unmount()); }
  });
}

test('AC02: actual controls release only a known terminal failure and retain OTP input for a corrected new attempt', async () => {
  const calls: Call[] = [];
  const transport: typeof fetch = async (url, options) => {
    calls.push({ path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> });
    if (String(url).endsWith('/auth/challenges')) return json({ challenge_id: challengeId, expires_at: '2099-01-01T00:00:00Z', retry_after: 60 });
    return json({ code: 'OTP_INVALID', message: '验证码有误', retryable: false }, 422);
  };
  const { Component } = loginComponent(transport), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => input(root.container, 'admin-phone').props.onChange({ target: { value: '+15555550123' } }));
    await event(() => submit(root.container));
    await event(() => input(root.container, 'management-code').props.onChange('123456'));
    await event(() => submit(root.container));
    assert.equal(input(root.container, 'management-code').props.disabled, false);
    assert.equal(input(root.container, 'management-code').props.value, '123456');
    await event(() => input(root.container, 'management-code').props.onChange('654321'));
    await event(() => submit(root.container));
    const verifies = calls.filter(call => call.path.endsWith('/auth/verify'));
    assert.equal(verifies.length, 2); assert.notEqual(verifies[0].body.operation_id, verifies[1].body.operation_id);
    assert.equal(verifies[0].body.otp, '123456'); assert.equal(verifies[1].body.otp, '654321');
  } finally { await React.act(async () => root.unmount()); }
});

test('AC03: ambiguous query errors keep the proof frozen until the explicit abandon control clears challenge and OTP', async () => {
  const calls: Call[] = [];
  let queries = 0;
  const transport: typeof fetch = async (url, options) => {
    const path = String(url); calls.push({ path, body: JSON.parse(String(options?.body)) as Record<string, string> });
    if (path.endsWith('/auth/challenges')) return json({ challenge_id: challengeId, expires_at: '2099-01-01T00:00:00Z', retry_after: 0 });
    if (path.endsWith('/auth/verify')) return json({ code: 'AUTH_UNCONFIRMED', message: '结果未确认' }, 503);
    queries++;
    return json({ code: queries === 1 ? 'CONFLICT' : 'NOT_FOUND', message: '尚未取得原结果' }, queries === 1 ? 409 : 404);
  };
  const { Component } = loginComponent(transport), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => input(root.container, 'admin-phone').props.onChange({ target: { value: '+15555550123' } }));
    await event(() => submit(root.container));
    await event(() => input(root.container, 'management-code').props.onChange('123456'));
    await event(() => submit(root.container));
    await event(() => submit(root.container));
    await event(() => submit(root.container));
    assert.equal(queries, 2); assert.equal(input(root.container, 'management-code').props.disabled, true);
    assert.equal(calls.filter(call => call.path.endsWith('/auth/verify')).length, 1);
    await event(() => button(root.container, '放弃本次验证').props.onClick());
    assert.equal(input(root.container, 'admin-phone').props.value, '+15555550123');
    await event(() => submit(root.container));
    assert.equal(input(root.container, 'management-code').props.value, '');
    assert.equal(input(root.container, 'management-code').props.disabled, false);
    assert.equal(calls.filter(call => call.path.endsWith('/auth/challenges')).length, 2);
  } finally { await React.act(async () => root.unmount()); }
});

const captchaImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const captcha = (count = 1) => ({ captcha_id: '00000000-0000-4000-8000-' + String(count).padStart(12, '0'), image_data_url: captchaImage, expires_at: '2099-01-01T00:00:00Z' });
async function fillPassword(container: TestInstance, answer = '123456') {
  await event(() => input(container, 'admin-username').props.onChange({ target: { value: ' Synthetic.Admin ' } }));
  await event(() => input(container, 'admin-password').props.onChange({ target: { value: 'synthetic-password-1234' } }));
  await event(() => input(container, 'admin-captcha').props.onChange({ target: { value: answer } }));
}

test('AC04: actual password controls display the server PNG, submit its proof once, clear the password and continue to MFA', async () => {
  const calls: Call[] = [];
  const { Component, visited } = loginComponent(async (url, options) => {
    const call = { path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }; calls.push(call);
    assert.equal(options?.credentials, 'same-origin'); assert.equal(new Headers(options?.headers).get('X-AgoraWeave-CSRF'), '1');
    if (call.path.endsWith('/captcha')) { assert.deepEqual(call.body, {}); return json(captcha()); }
    assert.ok(call.path.endsWith('/auth/password')); return json({ administrator: { mfa: { aal: 'aal1', verified: false } } });
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    assert.equal(input(root.container, 'admin-phone').props.value, '');
    await event(() => button(root.container, '用户名密码').props.onClick());
    const image = find(root.container, node => node.type === 'img' && node.props.alt === '随机验证码图片');
    assert.equal(image.props.src, captchaImage); assert.equal(image.props.unoptimized, true);
    assert.equal(input(root.container, 'admin-password').props.value, '');
    await fillPassword(root.container);
    await event(() => submit(root.container));
    const call = calls.find(item => item.path.endsWith('/auth/password'))!;
    assert.deepEqual(call.body, { username: 'synthetic.admin', password: 'synthetic-password-1234', captcha_id: challengeId, captcha_answer: '123456', operation_id: call.body.operation_id });
    assert.match(call.body.operation_id, /^[a-f0-9-]{36}$/);
    assert.equal(input(root.container, 'admin-password').props.value, '');
    assert.deepEqual(visited, ['/admin/mfa']); assert.equal(calls.length, 2);
  } finally { await React.act(async () => root.unmount()); }
});

test('AC05: country selection composes national numbers and preserves full international/autofill values without doubling the calling code', async () => {
  const calls: Call[] = [];
  const { Component } = loginComponent(async (url, options) => {
    calls.push({ path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> });
    return json({ code: 'SERVICE_UNAVAILABLE', message: 'Synthetic unavailable transport', retryable: true }, 503);
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    const country = () => find(root.container, node => node.type === 'select' && node.props.name === 'admin-country-code');
    assert.ok((country().props.items as unknown[]).length >= 25);
    assert.equal(input(root.container, 'admin-phone').props.autoComplete, 'tel-national');
    for (const [prefix, value, expected] of [
      ['+81', '9012345678', '+819012345678'], ['+86', '13800138000', '+8613800138000'],
      ['+86', '+1 (555) 555-0123', '+15555550123'], ['+86', '8613800138000', '+8613800138000'],
      ['+44', '00447700900123', '+447700900123']
    ]) {
      await event(() => country().props.onChange({ target: { value: prefix } }));
      await event(() => input(root.container, 'admin-phone').props.onChange({ target: { value } }));
      await event(() => submit(root.container));
      assert.equal(calls.at(-1)!.body.phone, expected);
    }
    const previous = calls.length;
    await event(() => input(root.container, 'admin-phone').props.onChange({ target: { value: '1+23' } }));
    await event(() => submit(root.container));
    assert.equal(calls.length, previous); assert.ok(textOf(root.container).includes('有效手机号'));
  } finally { await React.act(async () => root.unmount()); }
});

test('AC06: a server-rejected captcha is never compared locally; rejection clears password and answer, then obtains a new server challenge', async () => {
  const calls: Call[] = []; let count = 0;
  const { Component } = loginComponent(async (url, options) => {
    const call = { path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }; calls.push(call);
    if (call.path.endsWith('/captcha')) return json(captcha(++count));
    return json({ code: 'AUTH_FAILED', message: '图形验证码或登录信息有误', retryable: false }, 401);
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => button(root.container, '用户名密码').props.onClick());
    await fillPassword(root.container, '654321');
    await event(() => submit(root.container));
    assert.equal(calls.find(call => call.path.endsWith('/auth/password'))!.body.captcha_answer, '654321');
    assert.equal(count, 2); assert.equal(input(root.container, 'admin-password').props.value, ''); assert.equal(input(root.container, 'admin-captcha').props.value, '');
    assert.equal(input(root.container, 'admin-password').props.disabled, false); assert.ok(textOf(root.container).includes('图形验证码或登录信息有误'));
    await fillPassword(root.container);
    await event(() => submit(root.container));
    const submissions = calls.filter(call => call.path.endsWith('/auth/password'));
    assert.equal(submissions.length, 2); assert.equal(submissions[1].body.captcha_id, captcha(2).captcha_id);
    assert.notEqual(submissions[0].body.operation_id, submissions[1].body.operation_id);
  } finally { await React.act(async () => root.unmount()); }
});

for (const failure of ['network', '5xx', 'AUTH_UNCONFIRMED'] as const) test(`AC07-${failure}: an uncertain password outcome blocks resubmission until explicit abandon and never retries Auth when refreshing captcha or session`, async () => {
  const calls: Call[] = []; let count = 0;
  const { Component } = loginComponent(async (url, options) => {
    const call = { path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }; calls.push(call);
    if (call.path.endsWith('/captcha')) return json(captcha(++count));
    if (call.path.endsWith('/auth/refresh')) return json({ code: 'SESSION_INVALID', message: 'No issued session', retryable: false }, 401);
    if (failure === 'network') throw new Error('Synthetic interruption');
    return json({ code: failure === '5xx' ? 'SERVICE_UNAVAILABLE' : 'AUTH_UNCONFIRMED', message: '尚未确认', retryable: true }, failure === '5xx' ? 503 : 422);
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => button(root.container, '用户名密码').props.onClick()); await fillPassword(root.container);
    await event(() => submit(root.container));
    const original = calls.find(call => call.path.endsWith('/auth/password'))!;
    assert.ok(textOf(root.container).includes(original.body.operation_id)); assert.ok(textOf(root.container).includes('不会自动再次提交'));
    assert.equal(input(root.container, 'admin-password').props.value, ''); assert.equal(input(root.container, 'admin-password').props.disabled, true);
    assert.equal(button(root.container, '使用用户名密码登录').props.disabled, true); assert.equal(button(root.container, '手机号登录').props.disabled, true);
    await event(() => input(root.container, 'admin-password').props.onChange({ target: { value: 'stale-password' } }));
    await event(() => submit(root.container)); await event(() => button(root.container, '换一组').props.onClick());
    await event(() => button(root.container, '检查现有登录').props.onClick());
    assert.equal(calls.filter(call => call.path.endsWith('/auth/password')).length, 1); assert.equal(count, 3);
    assert.equal(input(root.container, 'admin-password').props.value, '');
    await event(() => button(root.container, '放弃本次请求').props.onClick());
    assert.equal(input(root.container, 'admin-password').props.disabled, false); assert.equal(button(root.container, '手机号登录').props.disabled, false);
    await fillPassword(root.container); await event(() => submit(root.container));
    assert.equal(calls.filter(call => call.path.endsWith('/auth/password')).length, 2);
  } finally { await React.act(async () => root.unmount()); }
});

test('AC08: forgot-password controls submit a real server captcha and show only pending identity verification, with no password, SMS or email success claim', async () => {
  const calls: Call[] = []; let count = 0;
  const { Component } = loginComponent(async (url, options) => {
    const call = { path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }; calls.push(call);
    if (call.path.endsWith('/captcha')) return json(captcha(++count));
    assert.ok(call.path.endsWith('/auth/password/forgot')); return json({ accepted: true });
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => button(root.container, '用户名密码').props.onClick()); await fillPassword(root.container);
    await event(() => button(root.container, '忘记密码').props.onClick());
    await event(() => submit(root.container));
    const call = calls.find(item => item.path.endsWith('/auth/password/forgot'))!;
    assert.deepEqual(call.body, { username: 'synthetic.admin', captcha_id: challengeId, captcha_answer: '123456', operation_id: call.body.operation_id });
    assert.equal('password' in call.body, false); assert.equal(count, 2);
    assert.ok(textOf(root.container).includes('请求已受理')); assert.ok(textOf(root.container).includes('当前密码尚未更改'));
    assert.ok(!textOf(root.container).includes('邮件已发送') && !textOf(root.container).includes('短信已发送'));
    await event(() => button(root.container, '用户名密码').props.onClick()); assert.equal(input(root.container, 'admin-password').props.value, '');
  } finally { await React.act(async () => root.unmount()); }
});

test('AC09: unavailable or non-PNG captcha disables password submission until an explicit successful refresh; no external image or Auth retry is issued', async () => {
  const calls: Call[] = []; let count = 0;
  const { Component } = loginComponent(async (url, options) => {
    calls.push({ path: String(url), body: JSON.parse(String(options?.body)) as Record<string, string> }); count++;
    if (count === 1) return json({ code: 'SERVICE_UNAVAILABLE', message: '验证码服务不可用', retryable: true }, 503);
    if (count === 2) return json({ ...captcha(), image_data_url: 'https://external.invalid/captcha.png' });
    return json(captcha());
  }), root = createRoot();
  try {
    await React.act(async () => { root.render(React.createElement(Component)); });
    await event(() => button(root.container, '用户名密码').props.onClick());
    assert.equal(button(root.container, '使用用户名密码登录').props.disabled, true); assert.equal(input(root.container, 'admin-captcha').props.disabled, true);
    await event(() => button(root.container, '换一组').props.onClick());
    assert.equal(button(root.container, '使用用户名密码登录').props.disabled, true); assert.ok(!textOf(root.container).includes('external.invalid'));
    await event(() => button(root.container, '换一组').props.onClick());
    assert.equal(button(root.container, '使用用户名密码登录').props.disabled, false); assert.equal(input(root.container, 'admin-captcha').props.disabled, false);
    assert.equal(calls.length, 3); assert.ok(calls.every(call => call.path.endsWith('/auth/password/captcha')));
  } finally { await React.act(async () => root.unmount()); }
});
