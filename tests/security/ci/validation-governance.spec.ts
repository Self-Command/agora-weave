import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';

test('DG01: tiering approval and migration policy cannot use ordinary documentation feedback routing', () => {
  const sha = 'a'.repeat(40);
  const result = resolveValidationRequest({ schema_version: 1, validation_intent: 'feedback' }, {
    repository: 'Self-Command/agora-weave', event: 'push', event_sha: sha, target_sha: sha, checkout_sha: sha,
    check_set_digest: 'd'.repeat(64), changed_paths: ['docs/engineering/validation-tiering-decision.md'],
  });
  assert.equal(result.full_required, true);
});
