'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { managementRequest, ManagementError } from '../client';
import { OTP_KEYS, type ConfigPreview, type ConfigRelease, type MfaChallenge, type MfaFactor, type OtpConfiguration, type OtpValues } from '../contracts';
import { useManagement } from '../session-context';
import { ManagementFeedback } from './feedback';
import { ManagementCodeField } from './code-field';

const labels: Record<string, string> = {
  'auth.otp_lifetime_seconds': '验证码有效期（秒）', 'auth.otp_resend_seconds': '重新发送间隔（秒）',
  'auth.otp_max_failures': '验证码最大错误次数', 'auth.otp_phone_hourly': '每手机号每小时发送上限',
  'auth.otp_phone_daily': '每手机号每日发送上限', 'auth.otp_ip_hourly': '每 IP 每小时发送上限'
};

export function OtpConfigurationEditor() {
  const administrator = useManagement();
  const [config, setConfig] = useState<OtpConfiguration | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [rollback, setRollback] = useState('');
  const [preview, setPreview] = useState<ConfigPreview | null>(null);
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [factor, setFactor] = useState('');
  const [code, setCode] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState('');
  const load = async (reset = false) => {
    try { const result = await managementRequest<OtpConfiguration>('/admin/config/definitions?group=otp');
      if (result.data.definitions.length !== OTP_KEYS.length || !OTP_KEYS.every(key => result.data.definitions.some(item => item.key === key))) throw new Error('配置定义暂时不可用');
      setConfig(result.data);
      if (reset) setValues(Object.fromEntries(result.data.definitions.map(item => [item.key, String(item.value)])));
    } catch (failure) { setError(failure); }
  };
  useEffect(() => {
    const pending = new URL(window.location.href).searchParams.get('operation');
    if (pending && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(pending)) setOperation(pending);
    void load(true);
  }, []);
  const rememberOperation = (value: string | null) => {
    setOperation(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('operation', value); else url.searchParams.delete('operation');
    window.history.replaceState(null, '', url.pathname + url.search);
  };
  const invalidate = () => { setPreview(null); setCode(''); setMessage(''); setError(undefined); };
  const editable = !!config && config.definitions.every(item => administrator?.permissions.includes(item.write_permission));
  const canApply = editable && !!administrator?.permissions.includes(rollback ? 'config.rollback' : 'config.release');
  const createPreview = async () => {
    if (!config) return;
    setBusy(true); setError(undefined); setMessage(''); setPreview(null);
    try {
      const target = Object.fromEntries(OTP_KEYS.map(key => [key, Number(values[key])])) as OtpValues;
      if (!rollback && OTP_KEYS.some(key => !Number.isSafeInteger(target[key]) || target[key] <= 0)) throw new Error('请为每项填写大于零的整数');
      const result = await managementRequest<ConfigPreview>('/admin/config/previews', {
        base_version: config.base_version, ...(rollback ? { rollback_version: rollback } : { values: target }), reason, operation_id: crypto.randomUUID()
      });
      setPreview(result.data);
      const authenticators = await managementRequest<{ items: MfaFactor[] }>('/admin/mfa/factors');
      const verified = authenticators.data.items.filter(item => item.status === 'verified');
      setFactors(verified); setFactor(verified[0]?.id ?? '');
    } catch (failure) { setError(failure); } finally { setBusy(false); }
  };
  const release = async () => {
    if (!preview || operation || !canApply) return;
    setBusy(true); setError(undefined); setMessage('');
    let command: string | null = null;
    try {
      const challenge = await managementRequest<MfaChallenge>('/admin/mfa/challenges', { factor_id: factor });
      const stepup = await managementRequest<{ stepup_id: string; expires_at: string }>('/admin/stepup', {
        factor_id: factor, challenge_id: challenge.data.id, code, action_digest: preview.action_digest
      });
      command = crypto.randomUUID(); rememberOperation(command);
      const result = await managementRequest<ConfigRelease>(rollback ? '/admin/config/rollbacks' : '/admin/config/releases', {
        preview_id: preview.preview_id, preview_digest: preview.preview_digest, stepup_id: stepup.data.stepup_id, operation_id: command
      });
      setMessage(`${result.data.kind === 'rollback' ? '回滚' : '配置'}已生效。当前版本：${result.data.version}`);
      rememberOperation(null); setPreview(null); setCode(''); setRollback(''); await load(true);
    } catch (failure) {
      setError(failure);
      // Once a command may have reached the service, query its original operation before another publish.
      if (!command || failure instanceof ManagementError && failure.status < 500) rememberOperation(null);
    } finally { setBusy(false); }
  };
  const query = async () => {
    if (!operation) return;
    setBusy(true); setError(undefined);
    try { const result = await managementRequest<{ operation_id: string; action: string; state: string; result?: ConfigRelease }>('/operations/' + operation);
      if (result.data.state === 'succeeded' && result.data.result?.state === 'active') {
        setMessage(`原操作已生效。当前版本：${result.data.result.version}`); rememberOperation(null); setPreview(null); setCode(''); setRollback(''); await load(true);
      } else {
        setMessage(`原操作当前状态：${result.data.state}。尚未确认生效，请保留输入。`); await load(false);
        if (result.data.state === 'failed') rememberOperation(null);
      }
    } catch (failure) { setError(failure); } finally { setBusy(false); }
  };
  return <div className='flex min-w-0 flex-col gap-5'>
    <ManagementFeedback error={error} message={message} />
    {!config ? <Card><CardContent className='space-y-4 pt-4'><p role='status'>{error ? '验证码配置暂时不可用' : '正在读取验证码配置…'}</p><Button variant='outline' onClick={() => { setError(undefined); void load(true); }}>重新读取</Button></CardContent></Card> : <>
      <Card><CardHeader><CardTitle>当前生效配置 <Badge variant='outline'>{config.environment}</Badge></CardTitle><CardDescription className='break-all'>版本：{config.base_version}</CardDescription></CardHeader>
        <CardContent><form onSubmit={event => { event.preventDefault(); void createPreview(); }} className='space-y-6'>
          <fieldset disabled={busy || !editable || !!operation} className='space-y-6'>
            <FieldGroup className='grid gap-5 md:grid-cols-2'>{config.definitions.map(item => <Field key={item.key}><FieldLabel htmlFor={item.key}>{labels[item.key]}</FieldLabel>
              <Input id={item.key} type='number' min={item.range.minimum ?? 1} max={item.key === 'auth.otp_lifetime_seconds' ? Math.min(item.range.maximum ?? Infinity, config.deployment_max_lifetime_seconds) : item.range.maximum} step={1} value={values[item.key] ?? ''} disabled={!!rollback} required onChange={event => { setValues({ ...values, [item.key]: event.target.value }); invalidate(); }} />
              <FieldDescription>{item.description}<span className='block'>当前 {item.value} · 默认 {item.default_value}</span><span className='block'>{item.existing_policy}</span></FieldDescription>
            </Field>)}</FieldGroup>
            <Field><FieldLabel htmlFor='rollback-version'>回滚到历史版本</FieldLabel><NativeSelect id='rollback-version' value={rollback} onChange={event => { setRollback(event.target.value); invalidate(); }}>
              <NativeSelectOption value=''>使用上方目标值</NativeSelectOption>{config.history.filter(item => item.version !== config.base_version).map(item => <NativeSelectOption key={item.version} value={item.version}>{item.kind === 'baseline' ? '变更前版本 · ' : ''}{item.version} · {new Date(item.effective_at).toLocaleString()}</NativeSelectOption>)}
            </NativeSelect><FieldDescription>回滚也会生成新版本，并重新验证当前权限与兼容性。</FieldDescription></Field>
            <Field><FieldLabel htmlFor='config-reason'>修改理由</FieldLabel><Textarea id='config-reason' value={reason} required maxLength={2000} onChange={event => { setReason(event.target.value); invalidate(); }} /></Field>
          </fieldset>
          {!editable ? <p className='text-muted-foreground text-sm'>当前角色可查看配置，没有完整修改权限。</p> : null}
          {config.environment === 'production' ? <p className='text-muted-foreground text-sm'>生产配置变更需要具体发布确认，当前入口暂不提供生效操作。</p> : null}
          <div className='flex flex-wrap gap-2'><LoadingButton type='submit' loading={busy} disabled={!editable || !reason.trim() || !!operation || config.environment === 'production'}>生成{rollback ? '回滚' : '修改'}预览</LoadingButton><Button type='button' variant='outline' disabled={busy || !!operation} onClick={() => { invalidate(); void load(false); }}>刷新当前版本</Button></div>
        </form></CardContent>
      </Card>
      {preview ? <Card><CardHeader><CardTitle>{rollback ? '回滚' : '修改'}预览</CardTitle><CardDescription>请核对影响，使用认证器确认本次操作。预览有效至 {new Date(preview.expires_at).toLocaleString()}。</CardDescription></CardHeader><CardContent className='space-y-5'>
        <div className='overflow-x-auto rounded-lg border'><Table><TableHeader><TableRow><TableHead>配置</TableHead><TableHead>修改前</TableHead><TableHead>目标值</TableHead></TableRow></TableHeader><TableBody>{preview.changes.map(change => <TableRow key={change.key}><TableCell>{labels[change.key]}</TableCell><TableCell>{change.before}</TableCell><TableCell>{change.after}</TableCell></TableRow>)}</TableBody></Table></div>
        <div className='space-y-2'><h2 className='font-medium'>既有对象影响</h2>{preview.existing_object_impacts.map((impact, index) => <p className='text-muted-foreground text-sm' key={index}>{impact}</p>)}</div>
        <form onSubmit={event => { event.preventDefault(); void release(); }} className='space-y-4'>
          <Field><FieldLabel htmlFor='stepup-factor'>认证器</FieldLabel><NativeSelect id='stepup-factor' value={factor} disabled={busy || !!operation} onChange={event => { setFactor(event.target.value); setCode(''); }}>
            {factors.map(item => <NativeSelectOption key={item.id} value={item.id}>{item.friendly_name}</NativeSelectOption>)}
          </NativeSelect></Field><ManagementCodeField value={code} onChange={setCode} disabled={busy || !!operation} />
          {!canApply ? <p className='text-muted-foreground text-sm'>当前角色没有{rollback ? '回滚' : '配置发布'}权限。</p> : null}
          <LoadingButton type='submit' loading={busy} disabled={!canApply || !factor || code.length !== 6 || !!operation || config.environment === 'production'}>验证并{rollback ? '回滚' : '生效'}</LoadingButton>
        </form>
      </CardContent></Card> : null}
      {operation ? <Card><CardHeader><CardTitle>正在确认原操作</CardTitle><CardDescription>结果尚未确认，请查询原操作后再继续。操作号：{operation}</CardDescription></CardHeader><CardContent><LoadingButton loading={busy} onClick={() => void query()}>查询原操作</LoadingButton></CardContent></Card> : null}
      <Card><CardHeader><CardTitle>配置历史</CardTitle></CardHeader><CardContent><div className='overflow-x-auto rounded-lg border'><Table><TableHeader><TableRow><TableHead>版本</TableHead><TableHead>类型</TableHead><TableHead>生效时间</TableHead><TableHead>理由</TableHead></TableRow></TableHeader><TableBody>
        {config.history.map(item => <TableRow key={item.version}><TableCell className='max-w-64 break-all whitespace-normal'>{item.version}</TableCell><TableCell>{item.kind === 'baseline' ? '变更前版本' : item.kind === 'rollback' ? '回滚' : '发布'}</TableCell><TableCell>{new Date(item.effective_at).toLocaleString()}</TableCell><TableCell className='max-w-80 whitespace-normal'>{item.reason}</TableCell></TableRow>)}
        {config.history.length === 0 ? <TableRow><TableCell colSpan={4} className='h-20 text-center'>暂无变更记录</TableCell></TableRow> : null}
      </TableBody></Table></div></CardContent></Card>
    </>}
  </div>;
}
