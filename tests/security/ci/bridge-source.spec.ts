import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveBridgeEvidence } from '../../../tools/ci/bridge-source.ts';
import { bridgeFixture } from '../../fixtures/bootstrap/gates.ts';

function fixture() {
  const context = { ...bridgeFixture(), mode: 'business-increment', transition: 'start' };
  const initializationDigests = { 'tools/ci/gates.ts': '1'.repeat(64), 'infra/ci/toolchain-lock.json': '2'.repeat(64) };
  const document = {
    state: 'passed', ci_ready: true, feature_complete: false, scope: 'bootstrap-only',
    target_sha: 'a'.repeat(40), check_set_digest: context.check_set_digest,
    initialization_digests: initializationDigests, reports_read: true,
    read_by: 'current-codex', read_at: '2026-10-15T02:00:00Z', unresolved_items: [],
    observed: ['bootstrap.engineering', 'bootstrap.tdd', 'bootstrap.codex-code-review', 'bootstrap.codex-visual-review']
      .map(id => ({ id, state: 'passed', source_verified: true, source_job_conclusion: 'success',
        source_sha: context.target_sha, check_set_digest: context.check_set_digest, raw_report_digest: '3'.repeat(64) })),
    baseline_required: false, baseline_confirmed: false, regressions_passed: true,
  };
  return { context, current_initialization_digests: initializationDigests,
    initialization: { authenticated: true, ancestor_verified: true, document },
    completion: { authenticated: true, document: { ...document, target_sha: context.target_sha } },
    required_ids: document.observed.map(item => item.id), canonical_tasks_complete: false };
}

test('BS01: business start derives readiness from an authenticated initialization ancestor and exact unchanged infrastructure inputs', () => {
  const input = fixture();
  const result = deriveBridgeEvidence(input);
  assert.equal(result.state, 'passed');
  assert.equal(result.ci_ready, true);
  assert.equal(result.initialization_source_sha, input.initialization.document.target_sha);
  assert.equal(result.feature_complete, false);
});

test('BS02: caller supplied readiness flags cannot bypass unauthenticated, unrelated, drifted or incomplete initialization evidence', () => {
  for (const mutate of [
    (value: ReturnType<typeof fixture>) => { value.initialization.authenticated = false; },
    (value: ReturnType<typeof fixture>) => { value.initialization.ancestor_verified = false; },
    (value: ReturnType<typeof fixture>) => { value.current_initialization_digests = { ...value.current_initialization_digests, 'tools/ci/gates.ts': '4'.repeat(64) }; },
    (value: ReturnType<typeof fixture>) => { value.initialization.document.ci_ready = false; },
  ]) {
    const input = fixture();
    Object.assign(input.context, { ci_ready: true, initialization_inputs_unchanged: true, initialization_ancestor_verified: true });
    mutate(input);
    assert.equal(deriveBridgeEvidence(input).state, 'blocked');
  }
});

test('BC01: bootstrap completion binds all current frozen raw report digests and reader details without declaring the feature complete', () => {
  const input = fixture();
  Object.assign(input.context, { mode: 'bootstrap-only', transition: 'complete' });
  const result = deriveBridgeEvidence(input);
  assert.equal(result.state, 'passed');
  assert.equal(result.record_kind, 'bootstrap_completion');
  assert.equal(result.feature_complete, false);
  assert.equal(result.completion_record.read_by, 'current-codex');
  assert.deepEqual(result.completion_record.report_digests, Object.fromEntries(input.completion.document.observed.map(item => [item.id, item.raw_report_digest])));
  for (const mutate of [
    (value: ReturnType<typeof fixture>) => { value.completion.document.target_sha = 'b'.repeat(40); },
    (value: ReturnType<typeof fixture>) => { value.completion.document.observed.pop(); },
    (value: ReturnType<typeof fixture>) => { value.completion.document.reports_read = false; },
    (value: ReturnType<typeof fixture>) => { value.completion.authenticated = false; },
  ]) {
    const invalid = structuredClone(input);
    mutate(invalid);
    assert.equal(deriveBridgeEvidence(invalid).state, 'blocked');
  }
});
