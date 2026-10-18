'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { managementRequest, totpQrSource } from '../client';
import type { MfaChallenge, MfaEnrollment, MfaFactor } from '../contracts';
import { ManagementCodeField } from './code-field';
import { ManagementFeedback } from './feedback';
import { LogoutButton } from './logout-button';

export function ManagementMfaForm() {
  const [factors, setFactors] = useState<MfaFactor[] | null>(null);
  const [factor, setFactor] = useState('');
  const [name, setName] = useState('我的认证器');
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState('');
  const load = async () => {
    setError(undefined);
    try { const result = await managementRequest<{ items: MfaFactor[] }>('/admin/mfa/factors');
      setFactors(result.data.items); setFactor(result.data.items.find(item => item.status === 'verified')?.id ?? result.data.items[0]?.id ?? '');
    } catch (failure) { setError(failure); }
  };
  useEffect(() => { void load(); }, []);
  const enroll = async () => {
    setBusy(true); setError(undefined);
    try { const result = await managementRequest<MfaEnrollment>('/admin/mfa/factors', { friendly_name: name });
      setEnrollment(result.data); await load(); setFactor(result.data.id); setChallenge(null);
    } catch (failure) { setError(failure); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setError(undefined);
    try {
      const active = challenge && challenge.expires_at * 1000 > Date.now() ? challenge : (await managementRequest<MfaChallenge>('/admin/mfa/challenges', { factor_id: factor })).data;
      setChallenge(active);
      await managementRequest('/admin/mfa/verify', { factor_id: factor, challenge_id: active.id, code });
      setEnrollment(null); setCode(''); window.location.assign('/dashboard/identity');
    } catch (failure) { setError(failure); setChallenge(null); setMessage('请保留输入后重试；未确认前不会进入管理页面。'); }
    finally { setBusy(false); }
  };
  const qr = enrollment ? totpQrSource(enrollment.totp.qr_code) : null;
  return <div className='space-y-5'>
    <ManagementFeedback error={error} message={message} />
    {factors === null ? <div className='space-y-3'><p role='status'>正在读取认证器…</p>{error ? <Button variant='outline' onClick={() => void load()}>重试读取</Button> : null}</div> : null}
    {factors && factors.length === 0 && !enrollment ? <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>首次进入管理后台，请在认证器应用中添加 TOTP。</p><Field><FieldLabel htmlFor='factor-name'>认证器名称</FieldLabel><Input id='factor-name' value={name} maxLength={64} disabled={busy} onChange={event => setName(event.target.value)} /></Field>
      <LoadingButton loading={busy} disabled={!name.trim()} onClick={() => void enroll()}>设置认证器</LoadingButton>
    </div> : null}
    {factors && factors.length > 0 && !factors.some(item => item.status === 'verified') && !enrollment ? <p className='text-muted-foreground text-sm'>已有待验证的认证器，请使用已添加的密钥完成验证。若设置资料遗失，请联系授权运维人员处理。</p> : null}
    {enrollment ? <div className='space-y-3 rounded-lg border p-4'><h2 className='font-medium'>添加到认证器</h2>
      {qr ? <Image src={qr} unoptimized width={200} height={200} alt='仅在本机展示的 TOTP 设置二维码' className='rounded-lg bg-white p-2' /> : <p className='text-sm'>二维码不可用，请使用下方密钥手动添加。</p>}
      <Field><FieldLabel htmlFor='totp-secret'>手动设置密钥</FieldLabel><Input id='totp-secret' value={enrollment.totp.secret} readOnly autoComplete='off' spellCheck={false} /></Field>
      <p className='text-muted-foreground text-xs'>请妥善保管密钥。此页关闭后将不再显示。</p><Button variant='ghost' onClick={() => setEnrollment(null)}>隐藏设置密钥</Button>
    </div> : null}
    {factors && factor ? <form onSubmit={event => { event.preventDefault(); void verify(); }} className='space-y-4'>
      <Field><FieldLabel htmlFor='mfa-factor'>认证器</FieldLabel><NativeSelect id='mfa-factor' value={factor} disabled={busy} onChange={event => { setFactor(event.target.value); setChallenge(null); }}>
        {factors.map(item => <NativeSelectOption key={item.id} value={item.id}>{item.friendly_name} · {item.status === 'verified' ? '已验证' : '待验证'}</NativeSelectOption>)}
      </NativeSelect></Field><ManagementCodeField value={code} onChange={setCode} disabled={busy} />
      <LoadingButton loading={busy} type='submit' disabled={code.length !== 6} className='w-full'>验证并进入后台</LoadingButton>
    </form> : null}<LogoutButton />
  </div>;
}
