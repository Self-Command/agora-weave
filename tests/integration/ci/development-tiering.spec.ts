import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';
import { deriveBridgeEvidence } from '../../../tools/ci/bridge-source.ts';
import { bridgeFixture } from '../../fixtures/bootstrap/gates.ts';

const context = () => ({ target_sha: 'a'.repeat(40), checkout_sha: 'a'.repeat(40), event: 'pull_request',
  event_sha: 'b'.repeat(40), pr_head_sha: 'a'.repeat(40), pr_merge_sha: 'b'.repeat(40),
  repository: 'Self-Command/agora-weave', check_set_digest: 'c'.repeat(64),
  changed_paths: ['tools/ci/collect-evidence.ts', 'tests/integration/ci/evidence-reuse.spec.ts'] });

test('DT01: mapped engineering Green runs development checks and necessary engineering regressions without the full native matrix', () => {
  const result = resolveValidationRequest({ schema_version: 1, validation_intent: 'green' }, context());
  assert.equal(result.state, 'resolved');
  assert.equal(result.full_required, false);
  assert.equal(result.development_required, true);
  assert.equal(result.validation_tier, 'development');
  assert.equal(result.readiness, 'not_evaluated');
  assert.equal(result.feature_complete, false);
});

test('DT02: completion and unknown, platform, governing input or admission changes retain complete applicable verification', () => {
  assert.equal(resolveValidationRequest({ schema_version: 1, validation_intent: 'completion' }, context()).full_required, true);
  for (const changed_paths of [['unknown'], ['apps/mobile/app/index.tsx'],
    ['infra/ci/toolchain-lock.json'], ['tools/ci/gates.ts'], ['tools/ci/bridge-source.ts'],
    ['.github/workflows/verify-release.yml'], ['specs/001-agoraweave-v1/contracts/cloud-validation.md']]) {
    for (const validation_intent of ['green', 'completion']) {
      const result = resolveValidationRequest({ schema_version: 1, validation_intent }, { ...context(), changed_paths });
      assert.equal(result.full_required, true);
    }
  }
});

function admission() {
  const gate = { ...bridgeFixture(), mode: 'business-increment', transition: 'start' };
  const foundation = { 'tools/ci/gates.ts': '1'.repeat(64), 'infra/ci/toolchain-lock.json': '2'.repeat(64) };
  const required = ['development.install', 'development.engineering', 'development.web',
    'development.dev-services', 'development.test-services'];
  const document = { state: 'passed', development_ready: true, ci_ready: false,
    readiness_kind: 'development-ready', scope: 'development', validation_intent: 'green',
    target_sha: gate.target_sha, check_set_digest: gate.check_set_digest, feature_complete: false,
    foundation_digests: foundation, required_ids: required, reports_read: true,
    read_by: 'actions-original-report-reader', read_at: '2026-10-15T02:00:00Z',
    regressions_passed: true, observed: required.map(id => ({ id, state: 'passed',
      source_verified: true, source_job_conclusion: 'success', source_sha: gate.target_sha,
      check_set_digest: gate.check_set_digest, raw_report_digest: '3'.repeat(64) })) };
  return { context: gate, current_foundation_digests: foundation,
    development: { authenticated: true, ancestor_verified: true, document } };
}

test('DT03: authenticated foundational reports admit business development independently of full initialization acceptance', () => {
  const input = admission();
  const result = deriveBridgeEvidence(input);
  assert.equal(result.state, 'passed');
  assert.equal(result.development_ready, true);
  assert.equal(result.ci_ready, false);
  assert.equal(result.feature_complete, false);
  assert.equal(result.development_source_sha, input.development.document.target_sha);
});

test('DT04: caller flags cannot replace original complete foundational evidence or unchanged inputs', () => {
  for (const mutate of [
    (input: ReturnType<typeof admission>) => { input.development.authenticated = false; },
    (input: ReturnType<typeof admission>) => { input.development.ancestor_verified = false; },
    (input: ReturnType<typeof admission>) => { input.development.document.observed.pop(); },
    (input: ReturnType<typeof admission>) => { input.development.document.observed[0].state = 'skipped'; },
    (input: ReturnType<typeof admission>) => { input.development.document.observed[0].source_job_conclusion = 'failure'; },
    (input: ReturnType<typeof admission>) => { input.development.document.observed[0].source_sha = 'b'.repeat(40); },
    (input: ReturnType<typeof admission>) => { input.development.document.observed[0].raw_report_digest = ''; },
    (input: ReturnType<typeof admission>) => { input.development.document.regressions_passed = false; },
    (input: ReturnType<typeof admission>) => { input.current_foundation_digests['tools/ci/gates.ts'] = '4'.repeat(64); },
  ]) {
    const input = admission();
    Object.assign(input.context, { development_ready: true, ci_ready: true,
      initialization_inputs_unchanged: true, initialization_ancestor_verified: true });
    mutate(input);
    assert.equal(deriveBridgeEvidence(input).state, 'blocked');
  }
});

test('DT05: development admission cannot authorize staged completion, full ci-ready or full release', () => {
  for (const mode of ['bootstrap-only', 'business-increment', 'full-release']) {
    const input = admission();
    Object.assign(input.context, { mode, transition: 'complete', development_ready: true,
      required_results_passed: true, reports_read: true, tdd_passed: true, reviews_passed: true,
      regressions_passed: true });
    const result = deriveBridgeEvidence(input);
    assert.equal(result.state, 'blocked');
    assert.equal(result.ci_ready, false);
    assert.equal(result.feature_complete, false);
    assert.equal(result.completion_record, undefined);
  }
});

test('DT06: the dispatcher owns a development chain and bootstrap forwarding does not wait for full matrices on development Green', () => {
  const dispatcher = readFileSync('.github/workflows/verify-release.yml', 'utf8');
  const bootstrap = readFileSync('.github/workflows/ci-bootstrap.yml', 'utf8');
  assert.ok(dispatcher.includes('uses: ./.github/workflows/verify-development.yml'));
  assert.ok(dispatcher.includes("needs.plan.outputs.development_required == 'true'"));
  assert.ok(bootstrap.includes('tools/ci/forward-readiness.ts'));
});
