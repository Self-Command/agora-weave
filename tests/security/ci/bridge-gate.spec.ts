import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBridgeGate } from '../../../tools/ci/gates.ts';
import { bridgeFixture } from '../../fixtures/bootstrap/gates.ts';

test('B01: approved bootstrap authoring can start without circular ci-ready dependency', () => {
  assert.equal(assessBridgeGate(bridgeFixture()).state, 'passed');
});

test('B02: bootstrap denies business, path traversal and unexpected executable locations', () => {
  for (const path of ['modules/social/index.ts', 'supabase/migrations/001-business.sql', '../tools/ci/x.ts', 'apps/admin/src/features/posts.tsx', '/tmp/bridge.ts']) {
    const input = bridgeFixture(); input.changed_paths = [path];
    assert.equal(assessBridgeGate(input).state, 'blocked');
  }
});

test('B03: business requires verified ci-ready ancestor and unchanged initialization inputs', () => {
  const input = { ...bridgeFixture(), mode: 'business-increment' };
  assert.equal(assessBridgeGate(input).state, 'blocked');
  input.ci_ready = true;
  assert.equal(assessBridgeGate(input).state, 'passed');
  input.initialization_inputs_unchanged = false;
  assert.equal(assessBridgeGate(input).state, 'blocked');
});

test('B04: raw complete status or task-done cannot replace complete evidence', () => {
  for (const status of ['complete', 'executing']) {
    assert.equal(assessBridgeGate({ ...bridgeFixture(), transition: 'complete', raw_handoff_status: status }).state, 'blocked');
  }
});

test('B05: only same-target complete/read/reviewed/regressed evidence can complete', () => {
  const input = { ...bridgeFixture(), transition: 'complete', required_results_passed: true,
    reports_read: true, tdd_passed: true, reviews_passed: true, regressions_passed: true };
  assert.equal(assessBridgeGate(input).state, 'passed');
  for (const field of ['working_tree_clean', 'required_hooks_ran', 'ownership_guard_passed', 'reports_read', 'tdd_passed', 'reviews_passed', 'regressions_passed']) {
    assert.equal(assessBridgeGate({ ...input, [field]: false }).state, 'blocked');
  }
});

test('B06: actor/contract/SHA mismatch, missing read identity or local runner blocks', () => {
  for (const patch of [{ actor: 'other' }, { target_sha: 'e'.repeat(40) }, { contract_digest: 'e'.repeat(64) }, { source: 'local' }, { runner_environment: 'self-hosted' }, { read_by: '' }, { required_hooks_ran: false }]) {
    assert.equal(assessBridgeGate({ ...bridgeFixture(), ...patch }).state, 'blocked');
  }
});
