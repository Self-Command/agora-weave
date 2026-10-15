import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveTaskAdapter } from '../../../tools/ci/task-adapter.ts';

test('TA01: pending native task ordinals follow canonical IDs after completed tasks leave the adapter', () => {
  const tasks = '# Canonical tasks\n- [x] T001 Completed setup\n- [ ] T002 Pending setup\n- [x] T284 Completed regression\n- [ ] T285 Pending delivery\n';
  const result = deriveTaskAdapter(tasks);
  assert.equal(result.state, 'mapped');
  assert.deepEqual(result.mapping, [{ id: 'T002', task: 1 }, { id: 'T285', task: 2 }]);
  assert.match(result.adapter, /### Task 1: T002\n\n- \[ \] T002 Pending setup/);
  assert.match(result.adapter, /### Task 2: T285\n\n- \[ \] T285 Pending delivery/);
  assert.equal(result.adapter.includes('### Task 285:'), false);
  assert.equal(result.adapter.includes('Completed setup'), false);
});

test('TA02: duplicate canonical IDs are refused and zero pending tasks never invent a native task', () => {
  for (const tasks of ['- [ ] T001 First\n- [ ] T001 Duplicate\n', '- [x] T001 Completed\n- [ ] T001 Duplicate\n']) {
    assert.equal(deriveTaskAdapter(tasks).state, 'blocked');
  }
  const result = deriveTaskAdapter('- [x] T001 Completed\n- [x] T285 Completed\n');
  assert.equal(result.state, 'empty');
  assert.deepEqual(result.mapping, []);
  assert.equal(result.adapter, '');
});
