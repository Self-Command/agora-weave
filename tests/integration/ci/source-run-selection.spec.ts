import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectEngineeringSource } from '../../../tools/ci/source-run-selection.ts';

test('SR01: push and pull request sources at one SHA bind their own event and branch without borrowing a different execution', () => {
  const run = { head_sha: 'a'.repeat(40), path: '.github/workflows/ci-bootstrap.yml',
    head_branch: 'codex/ci', run_attempt: 1, repository: { full_name: 'Self-Command/agora-weave' },
    head_repository: { full_name: 'Self-Command/agora-weave' } };
  const runs = [{ ...run, id: 11, event: 'push' }, { ...run, id: 22, event: 'pull_request' }];
  const input = { target_sha: run.head_sha, repository: run.repository.full_name, event: 'push', branch: 'codex/ci', runs };
  assert.equal(selectEngineeringSource(input).run_id, '11');
  assert.equal(selectEngineeringSource({ ...input, event: 'pull_request' }).run_id, '22');
  for (const patch of [{ event: 'workflow_dispatch' }, { branch: 'other' }, { target_sha: 'b'.repeat(40) },
    { runs: [] }, { runs: [...runs, { ...runs[0], id: 33 }] },
    { runs: [{ ...runs[0], head_repository: { full_name: 'fork/agora-weave' } }] },
    { runs: [{ ...runs[0], repository: { full_name: 'other/agora-weave' } }] },
    { runs: [{ ...runs[0], run_attempt: 0 }] }, { runs: [{ ...runs[0], id: 'unexpected' }] },
    { runs: [{ ...runs[0], path: '.github/workflows/other.yml' }] }]) {
    assert.equal(selectEngineeringSource({ ...input, ...patch }).state, 'blocked');
  }
});
