import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

test('TO01: installed native tooling maps every canonical task and retains the same-head completion refusal before admission', () => {
  const sha = 'a'.repeat(40);
  const mapping = { source: 'github-actions', runner_environment: 'github-hosted', checkout_sha: sha,
    run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    spec_kit: '1.0.12', superpowers: '7.0.0', superpowers_commit: 'bb92a77741419a4ab5f06e711a283343f1ada0c3',
    tasks_sha256: 'd'.repeat(64), mapping: [{ id: 'T001', task: 1 }, { id: 'T002', task: 2 }],
    expected_completion: 'refused' };
  const refusal = { state: 'blocked', effective_completion: false, canonical_tasks_completed: [],
    source: 'github-actions', run_id: '101', attempt: 1, target_sha: sha, raw_native_completion: 'preserved' };
  const raw = { mapping, refusal, canonical_task_ids: ['T001', 'T002'], tasks_sha256: 'd'.repeat(64),
    first_brief: 'T001\nExpected: frozen input\nInterface checks: original reports\nOverall regression: activated targets',
    last_brief: 'T002\nExpected: frozen input\nInterface checks: original reports\nOverall regression: activated targets',
    ledger: 'Task 1: complete', command: 'Synthetic cloud exit zero; no canonical completion\n' };
  const input = { kind: 'tooling', target_sha: sha, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1, identity: mapping, raw };
  assert.equal(assessBootstrapRaw(input).state, 'passed');
  for (const patch of [
    { mapping: { ...mapping, mapping: mapping.mapping.slice(0, 1) } },
    { mapping: { ...mapping, mapping: [{ id: 'T001', task: 1 }, { id: 'T001', task: 2 }] } },
    { mapping: { ...mapping, mapping: [{ id: 'T001', task: 2 }, { id: 'T002', task: 1 }] } },
    { mapping: { ...mapping, spec_kit: 'other' } }, { mapping: { ...mapping, superpowers_commit: 'e'.repeat(40) } },
    { mapping: { ...mapping, tasks_sha256: 'e'.repeat(64) } },
    { refusal: { ...refusal, target_sha: 'e'.repeat(40) } }, { refusal: { ...refusal, effective_completion: true } },
    { refusal: { ...refusal, canonical_tasks_completed: ['T001'] } },
    { canonical_task_ids: [] }, { first_brief: '' }, { ledger: '' }, { command: '' },
  ]) assert.equal(assessBootstrapRaw({ ...input, raw: { ...raw, ...patch } }).state, 'blocked');
  assert.equal(assessBootstrapRaw({ ...input, source_job_state: 'cancelled' }).state, 'blocked');
});
