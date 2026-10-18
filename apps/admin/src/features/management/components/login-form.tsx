'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { managementRequest, ManagementError } from '../client';
import type { Administrator } from '../contracts';
import { ManagementFeedback } from './feedback';
import { ManagementCodeField } from './code-field';

type Verification = { challenge_id: string; otp: string; operation_id: string };
type PasswordCaptcha = { captcha_id: string; image_data_url: string; expires_at: string };
const countries = [
  { value: '+86', label: '中国大陆 +86' }, { value: '+852', label: '中国香港 +852' },
  { value: '+853', label: '中国澳门 +853' }, { value: '+886', label: '中国台湾 +886' },
  { value: '+1', label: '美国 / 加拿大 +1' }, { value: '+44', label: '英国 +44' },
  { value: '+65', label: '新加坡 +65' }, { value: '+81', label: '日本 +81' },
  { value: '+82', label: '韩国 +82' }, { value: '+61', label: '澳大利亚 +61' },
  { value: '+64', label: '新西兰 +64' }, { value: '+49', label: '德国 +49' },
  { value: '+33', label: '法国 +33' }, { value: '+41', label: '瑞士 +41' },
  { value: '+31', label: '荷兰 +31' }, { value: '+34', label: '西班牙 +34' },
  { value: '+39', label: '意大利 +39' }, { value: '+7', label: '俄罗斯 / 哈萨克斯坦 +7' },
  { value: '+91', label: '印度 +91' }, { value: '+60', label: '马来西亚 +60' },
  { value: '+66', label: '泰国 +66' }, { value: '+84', label: '越南 +84' },
  { value: '+62', label: '印度尼西亚 +62' }, { value: '+63', label: '菲律宾 +63' },
  { value: '+971', label: '阿联酋 +971' }, { value: '+966', label: '沙特阿拉伯 +966' },
  { value: '+27', label: '南非 +27' }, { value: '+55', label: '巴西 +55' },
  { value: '+52', label: '墨西哥 +52' }
];

function loginPhone(value: string, countryCode: string) {
  const compact = value.trim().replace(/[\s().-]/g, '');
  if (compact.startsWith('+')) return compact;
  if (compact.startsWith('00')) return '+' + compact.slice(2);
  // Common autofill values omit the plus but already contain the calling code.
  const nationalLength: Record<string, number> = { '+86': 11, '+1': 10, '+65': 8, '+852': 8, '+853': 8 };
  if (nationalLength[countryCode] && compact.length > nationalLength[countryCode] && compact.startsWith(countryCode.slice(1))) return '+' + compact;
  return countryCode + compact;
}

export function ManagementLoginForm({ logout, operation, canRefresh = false }: { logout?: string; operation?: string; canRefresh?: boolean }) {
  const [mode, setMode] = useState<'phone'|'password'|'forgot'>('phone');
  const [countryCode, setCountryCode] = useState('+86');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<{ challenge_id: string; expires_at: string; retry_after: number } | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const proof = useRef<Verification | null>(null);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState(logout === 'unconfirmed' ? `本机登录信息已清除；远端退出结果尚未确认。${operation ? `原操作号：${operation}` : ''}` : logout === 'complete' ? '已退出管理登录。' : '');
  const [retryAt, setRetryAt] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState<PasswordCaptcha | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [passwordOutcome, setPasswordOutcome] = useState<{ operation_id: string; kind: 'password' | 'forgot' } | null>(null);
  const unresolvedPassword = useRef(false);
  const remember = (value: Verification | null) => { proof.current = value; setVerification(value); };
  const abandon = (changePhone: boolean) => {
    if (inFlight.current) return;
    remember(null); setChallenge(null); setOtp(''); setError(undefined); setMessage(''); setRetryAt(0);
    if (changePhone) setPhone('');
  };
  const send = async () => {
    if (proof.current) { await verify(); return; }
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(undefined); setMessage('');
    try {
      const fullPhone = loginPhone(phone, countryCode);
      if (!/^\+[1-9][0-9]{7,14}$/.test(fullPhone)) throw new ManagementError(422, { request_id: crypto.randomUUID(), code: 'INVALID_INPUT', message: '请输入有效手机号，也可粘贴含 + 区号的完整号码。', retryable: false });
      const result = await managementRequest<{ challenge_id: string; expires_at: string; retry_after: number }>('/auth/challenges', { phone: fullPhone, purpose: 'login', operation_id: crypto.randomUUID() });
      setChallenge(result.data); remember(null); setRetryAt(Date.now() + result.data.retry_after * 1000);
      setMessage('验证码已发送，请在有效期内输入。');
    } catch (failure) { setError(failure); } finally { inFlight.current = false; setBusy(false); }
  };
  async function verify() {
    if (!challenge || inFlight.current) return;
    const query = proof.current !== null;
    const body = proof.current ?? { challenge_id: challenge.challenge_id, otp, operation_id: crypto.randomUUID() };
    remember(body); inFlight.current = true; setBusy(true); setError(undefined);
    try {
      const result = await managementRequest<{ administrator?: Administrator; state?: string }>(query ? '/auth/operations/' + body.operation_id : '/auth/verify', body);
      if (result.data.administrator) { window.location.assign('/admin/mfa'); return; }
      if (result.data.state === 'failed') { remember(null); setMessage('本次验证已失败，请检查验证码后重试。'); }
      else setMessage('验证结果尚未确认，继续或重新获取只会查询原验证，不会再次发送或验证。');
    } catch (failure) {
      setError(failure);
      const terminal = failure instanceof ManagementError && failure.status < 500 && failure.failure.code !== 'AUTH_UNCONFIRMED' &&
        ['OTP_INVALID', 'OTP_EXPIRED', 'AUTH_FAILED', 'SESSION_INVALID', 'FORBIDDEN', 'INVALID_INPUT', 'RATE_LIMITED'].includes(failure.failure.code);
      if (terminal) remember(null);
      else setMessage('验证结果尚未确认，原验证码与操作已保留。请查询原验证，或主动放弃后重新开始。');
    } finally { inFlight.current = false; setBusy(false); }
  }
  const refresh = async () => {
    if (inFlight.current || proof.current) return;
    inFlight.current = true; setBusy(true); setError(undefined); setMessage('');
    try { const result = await managementRequest<{ administrator: Administrator }>('/auth/refresh', {});
      window.location.assign(result.data.administrator.mfa.aal === 'aal2' && result.data.administrator.mfa.verified ? '/dashboard/identity' : '/admin/mfa');
    } catch (failure) { setError(failure); } finally { inFlight.current = false; setBusy(false); }
  };
  const newCaptcha = async (preserveFeedback = false) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setCaptcha(null); setCaptchaInput('');
    if (!preserveFeedback) { setError(undefined); setMessage(''); }
    try {
      const result = await managementRequest<PasswordCaptcha>('/auth/password/captcha', {}), data = result.data;
      if (!data || !/^[a-f0-9-]{36}$/i.test(data.captcha_id) || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data.image_data_url) ||
        data.image_data_url.length > 131072 || !Number.isFinite(Date.parse(data.expires_at)) || Date.parse(data.expires_at) <= Date.now()) {
        throw new ManagementError(503, { request_id: crypto.randomUUID(), code: 'SERVICE_UNAVAILABLE', message: '图形验证码暂时不可用，请重新获取。', retryable: true });
      }
      setCaptcha(data);
    } catch (failure) { setError(failure); } finally { inFlight.current = false; setBusy(false); }
  };
  const switchMode = (next: 'phone'|'password'|'forgot') => {
    if (inFlight.current || unresolvedPassword.current) return;
    setMode(next); setError(undefined); setMessage(''); setPassword('');
    if (next !== 'phone') { remember(null); setChallenge(null); setOtp(''); }
    if (next !== 'phone' && (!captcha || Date.parse(captcha.expires_at) <= Date.now())) void newCaptcha();
  };
  const passwordSubmit = async (forgot = false) => {
    if (inFlight.current || unresolvedPassword.current) return;
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_.-]{2,63}$/.test(normalizedUsername) || (!forgot && (!password || new TextEncoder().encode(password).length > 72)) ||
      !captcha || !/^\d{6}$/.test(captchaInput.trim())) {
      setError(new ManagementError(422, { request_id: crypto.randomUUID(), code: 'INVALID_INPUT', message: forgot ? '请填写用户名及六位图形验证码。' : '请填写用户名、密码及六位图形验证码。', retryable: false }));
      return;
    }
    if (Date.parse(captcha.expires_at) <= Date.now()) {
      setError(new ManagementError(422, { request_id: crypto.randomUUID(), code: 'AUTH_FAILED', message: '图形验证码已过期，请输入新验证码。', retryable: false }));
      await newCaptcha(true); return;
    }
    const operationId = crypto.randomUUID();
    const body = { username: normalizedUsername, captcha_id: captcha.captcha_id, captcha_answer: captchaInput.trim(), operation_id: operationId,
      ...(!forgot ? { password } : {}) };
    inFlight.current = true; setBusy(true); setError(undefined); setMessage(''); setPassword(''); setCaptcha(null); setCaptchaInput('');
    let navigating = false;
    try {
      const result = await managementRequest<{ administrator?: Administrator; accepted?: boolean }>(forgot ? '/auth/password/forgot' : '/auth/password', body);
      if (!forgot && result.data.administrator) { navigating = true; window.location.assign('/admin/mfa'); return; }
      if (forgot && result.data.accepted === true) {
        setMessage('请求已受理。请联系运维人员，按登记的安全流程核验身份并重置密码；当前密码尚未更改。');
      } else throw new ManagementError(503, { request_id: crypto.randomUUID(), code: 'AUTH_UNCONFIRMED', message: '尚未取得本次请求的明确结果。', retryable: true });
    } catch (failure) {
      setError(failure);
      const terminal = failure instanceof ManagementError && failure.status < 500 && failure.failure.code !== 'AUTH_UNCONFIRMED';
      if (!terminal) { unresolvedPassword.current = true; setPasswordOutcome({ operation_id: operationId, kind: forgot ? 'forgot' : 'password' }); }
    } finally {
      inFlight.current = false; setBusy(false);
      if (!navigating) await newCaptcha(true);
    }
  };
  return <div className='space-y-5'>
    <ManagementFeedback error={error} message={message} />
    <div className='grid grid-cols-3 rounded-lg bg-muted p-1' role='tablist' aria-label='管理员登录方式'>
      <Button type='button' variant={mode === 'phone' ? 'secondary' : 'ghost'} size='sm' role='tab' aria-selected={mode === 'phone'} disabled={busy || !!passwordOutcome} onClick={() => switchMode('phone')}>手机号登录</Button>
      <Button type='button' variant={mode === 'password' ? 'secondary' : 'ghost'} size='sm' role='tab' aria-selected={mode === 'password'} disabled={busy || !!passwordOutcome} onClick={() => switchMode('password')}>用户名密码</Button>
      <Button type='button' variant={mode === 'forgot' ? 'secondary' : 'ghost'} size='sm' role='tab' aria-selected={mode === 'forgot'} disabled={busy || !!passwordOutcome} onClick={() => switchMode('forgot')}>忘记密码</Button>
    </div>
    {mode === 'phone' ? <>
      <form onSubmit={event => { event.preventDefault(); if (challenge) void verify(); else void send(); }} className='space-y-5' aria-busy={busy}>
        <FieldGroup><Field><FieldLabel htmlFor='admin-phone'>管理员手机号</FieldLabel>
          <div className='grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-2'>
            <Select name='admin-country-code' items={countries} value={countryCode} disabled={busy || !!challenge} onValueChange={value => {
              if (!inFlight.current && !challenge && !proof.current && countries.some(country => country.value === value)) setCountryCode(String(value));
            }}>
              <SelectTrigger id='admin-country-code' aria-label='国家或地区区号' className='h-9 w-full'><SelectValue /></SelectTrigger>
              <SelectContent>{countries.map(country => <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input id='admin-phone' type='tel' autoComplete='tel-national' inputMode='tel' placeholder='请输入手机号' value={phone} disabled={busy || !!challenge} required pattern={'\\+?[0-9]{5,15}'} onChange={event => {
              if (!inFlight.current && !challenge && !proof.current) setPhone(event.target.value.replace(/[^0-9+]/g, ''));
            }} />
          </div><FieldDescription>使用已授权账号手机号，也可粘贴含 + 区号的完整号码。</FieldDescription></Field>
          {challenge ? <><ManagementCodeField label='短信验证码' value={otp} onChange={value => { if (!inFlight.current && !proof.current) setOtp(value); }} disabled={busy || !!verification} /><p className='text-muted-foreground text-xs'>验证码有效至 {new Date(challenge.expires_at).toLocaleString()}</p></> : null}
        </FieldGroup>
        <LoadingButton type='submit' className='w-full' loading={busy} disabled={!!challenge && otp.length !== 6} loadingLabel={verification ? '正在查询原验证' : '正在验证管理登录'}>{verification ? '查询验证结果' : challenge ? '验证并继续' : '获取验证码'}</LoadingButton>
      </form>
      {challenge ? <div className='flex flex-wrap gap-2'><Button variant='outline' data-testid='admin-resend-code' disabled={busy} onClick={() => { if (proof.current) { void verify(); return; } if (Date.now() < retryAt) { setMessage(`请在 ${Math.ceil((retryAt - Date.now()) / 1000)} 秒后重新获取。`); return; } void send(); }}>{verification ? '查询原操作' : '重新获取'}</Button><Button variant='ghost' disabled={busy} onClick={() => abandon(true)}>更换手机号</Button>{verification ? <Button variant='ghost' disabled={busy} onClick={() => abandon(false)}>放弃本次验证</Button> : null}</div> : null}
    </> : <form className='space-y-4' aria-busy={busy} onSubmit={event => { event.preventDefault(); void passwordSubmit(mode === 'forgot'); }}>
      <Field><FieldLabel htmlFor='admin-username'>用户名</FieldLabel><Input id='admin-username' autoComplete='username' autoCapitalize='none' spellCheck={false} maxLength={64} required value={username} onChange={event => {
        if (!inFlight.current && !unresolvedPassword.current) setUsername(event.target.value);
      }} placeholder='请输入管理用户名' disabled={busy || !!passwordOutcome} /></Field>
      {mode === 'password' ? <Field><FieldLabel htmlFor='admin-password'>密码</FieldLabel><Input id='admin-password' type='password' autoComplete='current-password' required value={password} onChange={event => {
        if (!inFlight.current && !unresolvedPassword.current) setPassword(event.target.value);
      }} placeholder='请输入密码' disabled={busy || !!passwordOutcome} /></Field> : <p className='text-muted-foreground text-sm'>提交用户名和图形验证码，按运维登记的安全流程重置密码；申请受理后仍需核验身份。</p>}
      <Field><FieldLabel htmlFor='admin-captcha'>随机验证码</FieldLabel>
        <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,11.5rem)] items-center gap-2'>
          <Input id='admin-captcha' value={captchaInput} onChange={event => {
            if (!inFlight.current && !unresolvedPassword.current) setCaptchaInput(event.target.value.replace(/\D/g, '').slice(0, 6));
          }} placeholder='输入六位数字' inputMode='numeric' pattern='[0-9]{6}' maxLength={6} autoComplete='off' required disabled={busy || !!passwordOutcome || !captcha} />
          <div className='bg-muted flex h-16 items-center justify-center overflow-hidden rounded-md border'>
            {captcha ? <Image unoptimized src={captcha.image_data_url} width={184} height={64} alt='随机验证码图片' className='h-full w-full object-contain' />
              : <span className='text-muted-foreground px-2 text-xs' role='status'>{busy ? '正在获取验证码' : '验证码暂不可用'}</span>}
          </div>
        </div>
        <div className='flex items-center justify-between gap-2'><FieldDescription>图形验证码由服务器校验。</FieldDescription><Button type='button' variant='ghost' size='sm' disabled={busy} onClick={() => void newCaptcha()}>换一组</Button></div>
      </Field>
      {passwordOutcome ? <div className='space-y-3' role='status'>
        <p className='text-muted-foreground text-sm'>本次{passwordOutcome.kind === 'password' ? '登录' : '找回'}结果尚未确认，不会自动再次提交。操作号：<span className='break-all'>{passwordOutcome.operation_id}</span></p>
        <div className='flex flex-wrap gap-2'>
          {passwordOutcome.kind === 'password' ? <Button type='button' variant='outline' disabled={busy} onClick={() => void refresh()}>检查现有登录</Button> : null}
          <Button type='button' variant='ghost' disabled={busy} onClick={() => {
            if (inFlight.current) return;
            unresolvedPassword.current = false; setPasswordOutcome(null); setPassword(''); setCaptchaInput(''); setError(undefined); setMessage('已放弃本次请求；如需继续，请重新填写并提交。');
          }}>放弃本次请求</Button>
        </div>
      </div> : null}
      <LoadingButton type='submit' className='w-full' loading={busy} disabled={!!passwordOutcome || !captcha} loadingLabel={mode === 'forgot' ? '正在提交找回申请' : '正在验证管理登录'}>{mode === 'forgot' ? '继续找回密码' : '使用用户名密码登录'}</LoadingButton>
    </form>}
    {canRefresh && mode === 'phone' && !challenge ? <Button variant='outline' className='w-full' disabled={busy} onClick={() => void refresh()}>继续现有登录</Button> : null}
  </div>;
}
