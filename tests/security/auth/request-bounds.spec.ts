import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readCommandJson } from '../../../supabase/functions/core/request-body.ts';

function streamed(parts: Uint8Array[],length?: string) {
  const state = { pulls: 0,cancelled: false };
  const body = new ReadableStream<Uint8Array>({
    pull(controller) { const part = parts[state.pulls++]; if (part) controller.enqueue(part); else controller.close(); },
    cancel() { state.cancelled = true; },
  },{ highWaterMark: 0 });
  const request = new Request('https://controlled.invalid/auth/refresh',{
    method: 'POST',body,duplex: 'half',...(length === undefined ? {} : { headers: { 'Content-Length': length } }),
  } as RequestInit);
  return { request,state };
}
test('RB01: streaming command bodies stop at the byte limit without consuming the remaining untrusted stream', async () => {
  const text = new TextEncoder();
  const input = streamed([text.encode('{"v":"'),text.encode('界'.repeat(10)),text.encode('"}')]);
  await assert.rejects(readCommandJson(input.request,20),/INVALID_INPUT/);
  assert.equal(input.state.cancelled,true);
  assert.equal(input.state.pulls,2);
  const oversized = streamed([text.encode('{}')],'9999');
  await assert.rejects(readCommandJson(oversized.request,20),/INVALID_INPUT/);
  assert.equal(oversized.state.cancelled,true);
  assert.equal(oversized.state.pulls,0);
});
test('RB02: valid bounded JSON decodes while malformed UTF-8, JSON and misleading lengths are rejected', async () => {
  const valid = new Request('https://controlled.invalid',{ method: 'POST',body: '{"v":"界"}' });
  assert.deepEqual(await readCommandJson(valid,64),{ v: '界' });
  for (const bytes of [new Uint8Array([0xff]),...['{','[]','null'].map(value => new TextEncoder().encode(value))]) {
    await assert.rejects(readCommandJson(streamed([bytes]).request,64),/INVALID_INPUT/);
  }
  await assert.rejects(readCommandJson(streamed([new TextEncoder().encode('{}')],'-1').request,64),/INVALID_INPUT/);
});
test('RB03: an unfinished command stream is cancelled at its deadline', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } },{ highWaterMark: 0 });
  const request = new Request('https://controlled.invalid',{ method: 'POST',body,duplex: 'half' } as RequestInit);
  await assert.rejects(readCommandJson(request,64,20),/INVALID_INPUT/);
  assert.equal(cancelled,true);
});
