import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';

const context = (changed_paths = ['apps/mobile/app/index.tsx']) => ({ target_sha: 'a'.repeat(40),
  checkout_sha: 'a'.repeat(40), event: 'pull_request', event_sha: 'b'.repeat(40),
  pr_head_sha: 'a'.repeat(40), pr_merge_sha: 'b'.repeat(40), repository: 'Self-Command/agora-weave',
  check_set_digest: 'c'.repeat(64), changed_paths });

test('AD01: approved Android development uses the existing foundational executor without starting the iOS matrix', () => {
  for (const paths of [['apps/mobile/app/index.tsx'], ['tools/ci/run-check-set.ts', 'infra/ci/validation-request.json'],
    ['specs/001-agoraweave-v1/tasks.md', '.specify/superpowers-handoff.json']]) {
    const result = resolveValidationRequest({ schema_version: 1, validation_intent: 'green',
      development_platform: 'android' }, context(paths));
    assert.equal(result.state, 'resolved');
    assert.equal(result.full_required, false, 'Android development must not launch the full native acceptance matrix');
    assert.equal(result.development_required, true);
    assert.equal(result.validation_tier, 'development');
    assert.equal(result.development_platform, 'android');
    assert.equal(result.ci_ready, false);
    assert.equal(result.feature_complete, false);
  }
  const dispatcher = readFileSync('.github/workflows/verify-release.yml', 'utf8');
  assert.match(dispatcher, /needs.plan.outputs.full_required == 'true'/);
  assert.match(dispatcher, /needs.plan.outputs.development_required == 'true'/);
  const development = readFileSync('.github/workflows/verify-development.yml', 'utf8');
  assert.ok(!development.includes('native-bootstrap.yml'), 'The foundational channel must not call the iOS or Android acceptance matrix');
});

test('AD02: Android development scope cannot hide unknown inputs, enable iOS changes or replace formal completion', () => {
  for (const development_platform of ['ios', 'all', [], true]) {
    assert.equal(resolveValidationRequest({ schema_version: 1, validation_intent: 'green',
      development_platform }, context()).state, 'blocked');
  }
  for (const paths of [['unknown'], ['unregistered/new-runner.sh'], ['tests/e2e/ios/AccountJourneyTests.swift']]) {
    assert.equal(resolveValidationRequest({ schema_version: 1, validation_intent: 'green',
      development_platform: 'android' }, context(paths)).state, 'blocked');
  }
  const completion = resolveValidationRequest({ schema_version: 1, validation_intent: 'completion',
    development_platform: 'android' }, context());
  assert.equal(completion.full_required, true);
  assert.equal(completion.development_required, false);
  const legacy = resolveValidationRequest({ schema_version: 1, validation_intent: 'green' }, context());
  assert.equal(legacy.full_required, true, 'Unscoped requests retain the original full acceptance fallback');
});
