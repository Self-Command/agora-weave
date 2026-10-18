'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { LoadingButton } from '@/components/ui/loading-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { managementRequest, ManagementError } from '../client';
import type { AppealList, CaseList, MfaChallenge, MfaFactor, RevisionList } from '../contracts';
import type { components as ManagementComponents } from '../../../../../../packages/contracts/src/generated/management';
import { ManagementFeedback } from './feedback';
import { ManagementCodeField } from './code-field';

type Page<T> = { items: T[]; has_more: boolean; next_cursor: string | null };

function useManagementPage<T>(path: '/admin/contents' | '/admin/cases' | '/admin/appeals') {
  const [list, setList] = useState<Page<T> | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [previous, setPrevious] = useState<(string | null)[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const requestNumber = useRef(0);

  const load = useCallback(async (next: string | null) => {
    const number = ++requestNumber.current;
    setBusy(true);
    setList(null);
    setError(undefined);
    try {
      const query = next ? `?${new URLSearchParams({ cursor: next })}` : '';
      const result = await managementRequest<Page<T>>(`${path}${query}`);
      if (requestNumber.current !== number) return false;
      setList(result.data);
      setCursor(next);
      return true;
    } catch (failure) {
      if (requestNumber.current !== number) return false;
      setError(failure);
      return false;
    } finally {
      if (requestNumber.current === number) setBusy(false);
    }
  }, [path]);

  useEffect(() => {
    void load(null);
    return () => { requestNumber.current += 1; };
  }, [load]);

  return { list, cursor, previous, setPrevious, busy, error, load };
}

function ReadState({ error }: { error: unknown }) {
  if (!(error instanceof ManagementError)) return <ManagementFeedback error={error} />;
  if (error.status === 404 || error.status === 501) return <p role='status' className='text-muted-foreground text-sm'>真实读取接口尚未接通，当前不能显示记录。</p>;
  if (error.status === 503) return <p role='alert' className='text-sm'>真实读取接口或管理服务暂不可用，当前不能显示记录。请稍后刷新。</p>;
  if (error.status === 401) return <p role='alert' className='text-sm'>管理会话已失效。<Link className='underline' href='/admin/login'>重新登录</Link></p>;
  if (error.status === 403) return <p role='alert' className='text-sm'>
    {error.failure.code === 'MFA_REQUIRED' ? <>请先<Link className='underline' href='/admin/mfa'>完成管理员多因素验证</Link>。</> :
      error.failure.code === 'SENSITIVE_COOLDOWN' ? '当前账号处于敏感操作冷却期，暂不能读取。' :
      error.failure.code === 'STEPUP_REQUIRED' ? '此读取需要再次验证当前管理身份。' :
      '当前管理身份无权读取此列表。'}
  </p>;
  return <ManagementFeedback error={error} />;
}

function ModerationPage<T>({ title, description, path, heads, row }: {
  title: string;
  description: string;
  path: '/admin/contents' | '/admin/cases' | '/admin/appeals';
  heads: string[];
  row: (item: T) => ReactNode;
}) {
  const { list, cursor, previous, setPrevious, busy, error, load } = useManagementPage<T>(path);
  return <Card>
    <CardHeader><CardTitle>{title}</CardTitle><p className='text-muted-foreground text-sm'>{description}</p></CardHeader>
    <CardContent className='space-y-4'>
      {error ? <ReadState error={error} /> : null}
      <div className='rounded-lg border' aria-busy={busy}>
        <Table>
          <TableHeader className='bg-muted'><TableRow>{heads.map(head => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {list?.items.map(row)}
            {!list || list.items.length === 0 ? <TableRow><TableCell colSpan={heads.length} className='h-24 text-center'>
              {busy ? '正在读取…' : error ? '当前无法读取记录' : '当前没有可读取的记录'}
            </TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button variant='outline' disabled={busy} onClick={() => void load(cursor)}>刷新</Button>
        <div className='flex gap-2'>
          <Button variant='outline' disabled={busy || !!error || previous.length === 0} onClick={async () => {
            const target = previous[previous.length - 1];
            if (await load(target)) setPrevious(history => history.slice(0, -1));
          }}>上一页</Button>
          <Button variant='outline' disabled={busy || !!error || !list?.has_more || !list.next_cursor} onClick={async () => {
            if (list?.next_cursor && await load(list.next_cursor)) setPrevious(history => [...history, cursor]);
          }}>下一页</Button>
        </div>
      </div>
    </CardContent>
  </Card>;
}

const reviewState = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };
const caseState = { pending: '待处理', reviewing: '审核中', processed: '已处理', not_actionable: '不予处理' };
const appealState = { awaiting_independent_review: '待独立复核', reviewing: '复核中', decided: '已决定' };
const appealDecision = { uphold: '维持处罚', overturn: '撤销处罚' };
const executionState = { pending: '待执行', succeeded: '已执行', failed: '执行失败' };

export function ContentReviewList() {
  type Revision = RevisionList['items'][number];
  type Schemas = ManagementComponents['schemas'];
  type PreviewRequest = Schemas['RevisionDecisionPreviewRequest'];
  type DecisionRequest = Schemas['RevisionDecisionRequest'];
  type Decision = PreviewRequest['decision'];
  type Preview = Schemas['RevisionDecisionPreview'];
  type Receipt = Schemas['RevisionReceipt'];
  const { list, cursor, previous, setPrevious, busy: reading, error: readError, load } = useManagementPage<Revision>('/admin/contents');
  const [selected, setSelected] = useState<Revision | null>(null);
  const [decision, setDecision] = useState<Decision>('approve');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [factor, setFactor] = useState('');
  const [code, setCode] = useState('');
  const [previewOperation, setPreviewOperation] = useState<string | null>(null);
  const [previewUnknown, setPreviewUnknown] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState('');
  const [mediaReady, setMediaReady] = useState<Record<string,boolean>>({});
  const [mediaFailed, setMediaFailed] = useState<Record<string,boolean>>({});
  const inFlight = useRef(false);

  useEffect(() => {
    const pending = new URL(window.location.href).searchParams.get('operation');
    if (pending && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(pending)) setOperation(pending);
  }, []);
  const rememberOperation = (value: string | null) => {
    setOperation(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('operation', value); else url.searchParams.delete('operation');
    window.history.replaceState(null, '', url.pathname + url.search);
  };
  const invalidate = () => { setPreview(null); setPreviewOperation(null); setPreviewUnknown(false); setCode(''); setError(undefined); setMessage(''); };
  const select = (revision: Revision) => {
    if (operation || previewUnknown) return;
    setSelected(revision); setDecision('approve'); setReason(''); setFactors([]); setFactor('');
    setMediaReady({}); setMediaFailed({}); invalidate();
  };
  const validReceipt = (value: unknown, operationId: string): value is Receipt => {
    if (!value || typeof value !== 'object') return false;
    const receipt = value as Partial<Receipt>;
    return receipt.operation_id === operationId && typeof receipt.revision_id === 'string' && typeof receipt.resource_id === 'string' &&
      (receipt.review_state === 'approved' || receipt.review_state === 'rejected') &&
      typeof receipt.publication_state === 'string' && Number.isSafeInteger(receipt.row_version);
  };
  const complete = async (receipt: Receipt) => {
    setMessage(`修订 ${receipt.revision_id} 已${receipt.review_state === 'approved' ? '通过' : '拒绝'}；当前发布状态：${receipt.publication_state}。`);
    rememberOperation(null); setSelected(null); setPreview(null); setPreviewOperation(null); setPreviewUnknown(false); setCode('');
    setMediaReady({}); setMediaFailed({});
    await load(cursor);
  };
  const createPreview = async () => {
    if (!selected || selected.review_state !== 'pending' || operation || !reason.trim() || inFlight.current) return;
    if(decision==='approve' && selected.media_refs.some(id=>!mediaReady[id])) {
      setMessage('图片尚未全部成功加载，不能通过此修订。请刷新或拒绝。');return;
    }
    inFlight.current = true;
    setBusy(true); setError(undefined); setMessage(''); setPreview(null); setCode('');
    const previewId = previewOperation ?? crypto.randomUUID();
    setPreviewOperation(previewId);
    setPreviewUnknown(true);
    try {
      const request = {
        operation_id: previewId, decision, reason: reason.trim()
      } satisfies PreviewRequest;
      const result = await managementRequest<Preview>(`/admin/revisions/${selected.id}/decision-previews`, request);
      const candidate = result.data;
      if (candidate.revision_id !== selected.id || !Number.isSafeInteger(candidate.base_version) ||
        !/^[a-f0-9]{64}$/i.test(candidate.action_digest) || !/^[a-f0-9]{64}$/i.test(candidate.preview_digest)) throw new Error('审核预览响应无效，请保留输入并重新读取');
      setPreviewUnknown(false);
      setPreview(candidate);
      const authenticators = await managementRequest<{ items: MfaFactor[] }>('/admin/mfa/factors');
      const verified = authenticators.data.items.filter(item => item.status === 'verified');
      setFactors(verified); setFactor(verified[0]?.id ?? '');
    } catch (failure) {
      setError(failure);
      if (failure instanceof ManagementError && failure.status < 500) { setPreviewOperation(null); setPreviewUnknown(false); }
    } finally { inFlight.current = false; setBusy(false); }
  };
  const submit = async () => {
    if (!selected || !preview || !previewOperation || operation || !factor || code.length !== 6 || inFlight.current) return;
    if(decision==='approve' && selected.media_refs.some(id=>!mediaReady[id])) {
      setMessage('图片预览已失效，不能通过此修订。请重新加载。');return;
    }
    inFlight.current = true;
    setBusy(true); setError(undefined); setMessage('');
    let command: string | null = null;
    try {
      const challenge = await managementRequest<MfaChallenge>('/admin/mfa/challenges', { factor_id: factor });
      const stepup = await managementRequest<{ stepup_id: string; expires_at: string }>('/admin/stepup', {
        factor_id: factor, challenge_id: challenge.data.id, code, action_digest: preview.action_digest
      });
      command = previewOperation; rememberOperation(command);
      const request = {
        operation_id: command, decision, reason: reason.trim(), base_version: preview.base_version,
        preview_id: preview.preview_id, preview_digest: preview.preview_digest, stepup_id: stepup.data.stepup_id
      } satisfies DecisionRequest;
      const result = await managementRequest<Receipt>(`/admin/revisions/${selected.id}/decision`, request);
      if (!validReceipt(result.data, command) || result.data.revision_id !== selected.id || result.data.resource_id !== selected.resource_id ||
        result.data.review_state !== (decision === 'approve' ? 'approved' : 'rejected')) throw new Error('审核结果尚未确认，请查询原操作');
      await complete(result.data);
    } catch (failure) {
      setError(failure);
      if (!command) setCode('');
      else if (failure instanceof ManagementError && failure.status < 500) {
        rememberOperation(null); setPreview(null); setPreviewOperation(null); setPreviewUnknown(false); setCode('');
      }
    } finally { inFlight.current = false; setBusy(false); }
  };
  const query = async () => {
    if (!operation || inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError(undefined);
    try {
      const result = await managementRequest<{ operation_id: string; action: string; state: string; result?: unknown }>('/operations/' + operation);
      if (result.data.action === 'moderation.revisions.decide' && result.data.state === 'succeeded' && validReceipt(result.data.result, operation)) await complete(result.data.result);
      else if (result.data.action === 'moderation.revisions.decide' && result.data.state === 'failed') {
        setMessage('原审核操作已失败。请重新读取修订并生成新预览后再处理。');
        rememberOperation(null); setSelected(null); setPreview(null); setPreviewOperation(null); setPreviewUnknown(false); await load(cursor);
      } else setMessage(`原操作当前状态：${result.data.state}。尚未确认审核结果，请保留操作号。`);
    } catch (failure) { setError(failure); } finally { inFlight.current = false; setBusy(false); }
  };

  return <div className='space-y-5'>
    <ManagementFeedback error={error} message={message} />
    {operation ? <Card><CardHeader><CardTitle>确认原审核操作</CardTitle><p className='text-muted-foreground text-sm'>操作号：{operation}。查询结果前不能再次提交审核决定。</p></CardHeader><CardContent><LoadingButton loading={busy} onClick={() => void query()}>查询原操作</LoadingButton></CardContent></Card> : null}
    <Card><CardHeader><CardTitle>内容审核</CardTitle><p className='text-muted-foreground text-sm'>按当前管理身份读取内容修订。只有待审核版本可发起决定；已处理版本保留真实状态。</p></CardHeader>
      <CardContent className='space-y-4'>
        {readError ? <ReadState error={readError} /> : null}
        <div className='rounded-lg border' aria-busy={reading}><Table><TableHeader className='bg-muted'><TableRow><TableHead>修订版本</TableHead><TableHead>内容</TableHead><TableHead>审核状态</TableHead><TableHead>提交时间</TableHead><TableHead>操作</TableHead></TableRow></TableHeader><TableBody>
          {list?.items.map(revision => <TableRow key={revision.id}>
            <TableCell><div className='font-medium'>版本 {revision.revision_no}</div><div className='text-muted-foreground text-xs'>修订 {revision.id}</div><div className='text-muted-foreground text-xs'>内容 {revision.resource_id}</div></TableCell>
            <TableCell className='max-w-md whitespace-normal break-words'>{revision.body.length > 180 ? `${revision.body.slice(0, 180)}…` : revision.body}</TableCell>
            <TableCell><Badge variant='outline'>{reviewState[revision.review_state]}</Badge></TableCell>
            <TableCell>{new Date(revision.submitted_at).toLocaleString('zh-CN')}</TableCell>
            <TableCell>{revision.review_state === 'pending' ? <Button variant='outline' disabled={!!operation || previewUnknown || busy} onClick={() => select(revision)}>审核</Button> : '已决定'}</TableCell>
          </TableRow>)}
          {!list || list.items.length === 0 ? <TableRow><TableCell colSpan={5} className='h-24 text-center'>{reading ? '正在读取…' : readError ? '当前无法读取记录' : '当前没有可读取的记录'}</TableCell></TableRow> : null}
        </TableBody></Table></div>
        <div className='flex flex-wrap items-center justify-between gap-3'><Button variant='outline' disabled={reading || busy || previewUnknown} onClick={() => { setSelected(null); invalidate(); void load(cursor); }}>刷新</Button>
          <div className='flex gap-2'><Button variant='outline' disabled={reading || busy || previewUnknown || !!readError || previous.length === 0} onClick={async () => {
            const target = previous[previous.length - 1]; if (await load(target)) { setPrevious(history => history.slice(0, -1)); setSelected(null); invalidate(); }
          }}>上一页</Button><Button variant='outline' disabled={reading || busy || previewUnknown || !!readError || !list?.has_more || !list.next_cursor} onClick={async () => {
            if (list?.next_cursor && await load(list.next_cursor)) { setPrevious(history => [...history, cursor]); setSelected(null); invalidate(); }
          }}>下一页</Button></div></div>
      </CardContent></Card>
    {selected && !operation ? <Card><CardHeader><CardTitle>审核修订 {selected.revision_no}</CardTitle><p className='text-muted-foreground text-sm'>修订号：{selected.id}。决定只针对这条修订，提交时服务端会重新核对当前版本与权限。</p></CardHeader><CardContent className='space-y-5'>
      <div className='space-y-2'><p className='text-sm font-medium'>完整正文</p><p className='whitespace-pre-wrap break-words rounded-lg border p-4 text-sm'>{selected.body}</p>
        {selected.tags.length ? <p className='text-muted-foreground text-sm'>标签：{selected.tags.join('、')}</p> : null}
        {selected.alt_text.length ? <p className='text-muted-foreground text-sm'>替代文字：{selected.alt_text.join('、')}</p> : null}
        {selected.media_refs.length ? <div className='space-y-2'><p className='text-sm font-medium'>待审核图片（{selected.media_refs.length}）</p>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>{selected.media_refs.map((id,index)=><figure key={id} className='rounded-lg border p-2'>
            {/* The same-origin route rechecks management identity and media grants on every load. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/management-media/${encodeURIComponent(id)}`} alt={selected.alt_text[index] || `待审核图片 ${index+1}`}
              className='max-h-80 w-full object-contain' onLoad={()=>{setMediaReady(state=>({...state,[id]:true}));setMediaFailed(state=>({...state,[id]:false}));}}
              onError={()=>{setMediaReady(state=>({...state,[id]:false}));setMediaFailed(state=>({...state,[id]:true}));}} />
            <figcaption className='mt-2 break-all text-xs text-muted-foreground'>图片 {index+1} · {id}
              {mediaFailed[id]?' · 图片读取失败，不能通过':!mediaReady[id]?' · 正在读取':''}</figcaption>
          </figure>)}</div></div> : null}</div>
      <form onSubmit={event => { event.preventDefault(); void createPreview(); }} className='space-y-4'>
        <Field><FieldLabel htmlFor='revision-decision'>审核决定</FieldLabel><NativeSelect id='revision-decision' value={decision} disabled={busy || previewUnknown} onChange={event => { setDecision(event.target.value as Decision); invalidate(); }}><NativeSelectOption value='approve'>通过</NativeSelectOption><NativeSelectOption value='reject'>拒绝</NativeSelectOption></NativeSelect></Field>
        <Field><FieldLabel htmlFor='revision-reason'>审核理由</FieldLabel><Textarea id='revision-reason' value={reason} maxLength={1000} required disabled={busy || previewUnknown} onChange={event => { setReason(event.target.value); invalidate(); }} /><FieldDescription>理由会绑定本次预览与审核决定，并用于审计。</FieldDescription></Field>
        {previewUnknown && previewOperation ? <p className='text-muted-foreground text-sm'>预览结果尚未确认；请用原操作号 {previewOperation} 重试相同预览。</p> : null}
        <div className='flex flex-wrap gap-2'><LoadingButton type='submit' loading={busy} disabled={!reason.trim()}>{previewUnknown ? '重试原预览' : '生成审核预览'}</LoadingButton><Button type='button' variant='outline' disabled={busy || previewUnknown} onClick={() => { setSelected(null); invalidate(); }}>取消</Button></div>
      </form>
      {preview ? <div className='space-y-4 rounded-lg border p-4'><p className='text-sm'>预览版本：{preview.base_version} · 有效至 {new Date(preview.expires_at).toLocaleString('zh-CN')}。核对后使用认证器确认。</p>
        <form onSubmit={event => { event.preventDefault(); void submit(); }} className='space-y-4'>
          <Field><FieldLabel htmlFor='review-factor'>认证器</FieldLabel><NativeSelect id='review-factor' value={factor} disabled={busy} onChange={event => { setFactor(event.target.value); setCode(''); }}>{factors.map(item => <NativeSelectOption key={item.id} value={item.id}>{item.friendly_name}</NativeSelectOption>)}</NativeSelect></Field>
          {factors.length === 0 ? <p className='text-muted-foreground text-sm'>当前没有可用的已验证认证器；请先完成管理员多因素设置。</p> : null}
          <ManagementCodeField value={code} onChange={setCode} disabled={busy} />
          <LoadingButton type='submit' loading={busy} disabled={!factor || code.length !== 6}>{decision === 'approve' ? '验证并通过' : '验证并拒绝'}</LoadingButton>
        </form>
      </div> : null}
    </CardContent></Card> : null}
  </div>;
}

export function ReportCaseList() {
  return <ModerationPage<CaseList['items'][number]>
    title='举报案件' description='只显示接口按当前身份和案件授权返回的摘要；案件证据与处置功能尚未接入。'
    path='/admin/cases' heads={['案件', '目标', '状态', '处理人', '创建时间']}
    row={caseItem => <TableRow key={caseItem.id}>
      <TableCell className='font-mono text-xs'>{caseItem.id}</TableCell>
      <TableCell className='font-mono text-xs'>{caseItem.target_ref}</TableCell>
      <TableCell><Badge variant='outline'>{caseState[caseItem.state]}</Badge></TableCell>
      <TableCell className='font-mono text-xs'>{caseItem.handler_id ?? '未分配'}</TableCell>
      <TableCell>{new Date(caseItem.created_at).toLocaleString('zh-CN')}</TableCell>
    </TableRow>}
  />;
}

export function AppealReviewList() {
  return <ModerationPage<AppealList['items'][number]>
    title='申诉复核' description='按当前管理身份读取申诉。独立复核决定需要原处置人隔离、具体动作绑定的再次验证和真实后端支持，当前不能提交决定。'
    path='/admin/appeals' heads={['申诉', '处罚', '状态', '决定与执行', '提交时间']}
    row={appeal => <TableRow key={appeal.id}>
      <TableCell className='font-mono text-xs'>{appeal.id}</TableCell>
      <TableCell className='font-mono text-xs'>{appeal.sanction_id}</TableCell>
      <TableCell><Badge variant='outline'>{appealState[appeal.state]}</Badge></TableCell>
      <TableCell>{appeal.decision ? appealDecision[appeal.decision] : '尚未决定'} · {executionState[appeal.execution_state]}</TableCell>
      <TableCell>{new Date(appeal.created_at).toLocaleString('zh-CN')}</TableCell>
    </TableRow>}
  />;
}
