import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';

test('AD03: the cumulative initialization PR may retain its known deferred iOS shell probe and pinned native tooling', () => {
  const context = { target_sha: 'a'.repeat(40), checkout_sha: 'a'.repeat(40), event: 'pull_request',
    event_sha: 'b'.repeat(40), pr_head_sha: 'a'.repeat(40), pr_merge_sha: 'b'.repeat(40),
    repository: 'Self-Command/agora-weave', check_set_digest: 'c'.repeat(64),
    changed_paths: ['tests/e2e/ios/BootstrapShellTests.swift', 'superpowers-v7', 'apps/mobile/app/index.tsx'] };
  const request = { schema_version: 1, validation_intent: 'green', development_platform: 'android' };
  const result = resolveValidationRequest(request, context);
  assert.equal(result.state, 'resolved', 'Known cumulative bootstrap inputs must not prevent Android development');
  assert.equal(result.full_required, false);
  assert.equal(result.development_required, true);
  assert.equal(result.ci_ready, false);
  for (const file of ['tests/e2e/ios/AccountJourneyTests.swift', 'apps/mobile/ios/NewNativeModule.swift',
    'unregistered/new-runner.sh']) {
    assert.equal(resolveValidationRequest(request, { ...context, changed_paths: [file] }).state, 'blocked');
  }
});
