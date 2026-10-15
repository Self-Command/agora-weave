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

test('EP01: unchanged pending state uses bounded backoff and stops polling at the terminal result', async () => {
  const { input, run } = fixture();
  const waits: number[] = [];
  let elapsed = 0, reads = 0;
  const result = await waitSharedExecution({ ...input, timeout_ms: 1000, max_interval_ms: 40 }, async () => {
    reads++;
    return reads < 5 ? { ...run, status: 'in_progress', conclusion: null } : run;
  }, async milliseconds => { waits.push(milliseconds); elapsed += milliseconds; }, () => elapsed);
  assert.equal(result.state, 'complete');
  assert.deepEqual(waits, [10, 20, 40, 40]);
  assert.equal(reads, 5);
});
