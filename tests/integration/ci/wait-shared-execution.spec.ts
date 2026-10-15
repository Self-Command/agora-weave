import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitSharedExecution } from '../../../tools/ci/wait-shared-execution.ts';

function fixture() {
  const input = { expected_sha: 'a'.repeat(40), repository: 'synthetic/project', run_id: '123', event: 'push',
    branch: 'synthetic-branch', timeout_ms: 100, interval_ms: 10 };
  const run = { id: 123, head_sha: input.expected_sha, path: '.github/workflows/verify-release.yml',
    repository: { full_name: input.repository }, head_repository: { full_name: input.repository },
    head_branch: input.branch, event: input.event, run_attempt: 1, status: 'completed', conclusion: 'success' };
  return { input, run };
}

test('SW01: the bootstrap gate waits for its exact shared executor to finish before collecting final original reports', async () => {
  const { input, run } = fixture();
  let elapsed = 0, reads = 0;
  const result = await waitSharedExecution(input, async () => {
    reads++;
    return reads < 3 ? { ...run, status: reads === 1 ? 'queued' : 'in_progress', conclusion: null } : run;
  }, async milliseconds => { elapsed += milliseconds; }, () => elapsed);
  assert.equal(result.state, 'complete');
  assert.equal(result.attempt, 1);
  assert.equal(reads, 3);
  assert.equal(elapsed, 20);
});

test('SW02: failure, nonpassing terminal state, changed identity, unreadable metadata and bounded absence never produce a ready source', async () => {
  const { input, run } = fixture();
  for (const patch of [{ conclusion: 'failure' }, { conclusion: 'cancelled' }, { conclusion: 'skipped' },
    { conclusion: 'timed_out' }, { head_sha: 'b'.repeat(40) }, { head_branch: 'unrelated' },
    { event: 'pull_request' }, { path: '.github/workflows/ci-bootstrap.yml' }, { run_attempt: 0 }]) {
    const result = await waitSharedExecution(input, async () => ({ ...run, ...patch }), async () => {}, () => 0);
    assert.equal(result.state, 'blocked');
    assert.ok(result.reason_codes.some((reason: string) => ['shared_executor_not_passed', 'shared_executor_identity_mismatch'].includes(reason)));
  }
  let elapsed = 0;
  const pending = await waitSharedExecution(input, async () => ({ ...run, status: 'in_progress', conclusion: null }),
    async milliseconds => { elapsed += milliseconds; }, () => elapsed);
  assert.equal(pending.state, 'blocked');
  assert.deepEqual(pending.reason_codes, ['shared_executor_timeout']);
  const unavailable = await waitSharedExecution(input, async () => { throw new Error('No authenticated metadata'); }, async () => {}, () => 0);
  assert.equal(unavailable.state, 'blocked');
  assert.deepEqual(unavailable.reason_codes, ['shared_executor_unavailable']);
});
