import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicBridgeReceipt } from '../../../tools/ci/bridge-public.ts';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';
import { bridgeFixture } from '../../fixtures/bootstrap/gates.ts';

test('PB01: the public bridge projection retains the exact context required by its real raw-report consumer', () => {
  const context = bridgeFixture();
  const record = { ...context, state: 'passed', reason_codes: [], checkout_sha: context.target_sha,
    toolchain_digest: 'd'.repeat(64), run_id: '123', attempt: 1, record_kind: 'bootstrap_start_only', feature_complete: false };
  const receipt = publicBridgeReceipt(record);
  const input = { kind: 'bridge', target_sha: context.target_sha, check_set_digest: context.check_set_digest,
    toolchain_digest: record.toolchain_digest, source_authenticated: true, source_job_state: 'success',
    run_id: '123', attempt: 1, identity: receipt, raw: { admission: receipt } };
  assert.equal(assessBootstrapRaw(input).state, 'passed', 'The actual collector must revalidate the public technical context');
  assert.deepEqual(receipt.changed_paths, context.changed_paths);
  for (const patch of [{ expected_sha: 'e'.repeat(40) }, { required_hooks_ran: false },
    { changed_paths: ['apps/mobile/app/business.tsx'] }]) {
    const changed = { ...receipt, ...patch };
    assert.equal(assessBootstrapRaw({ ...input, identity: changed, raw: { admission: changed } }).state, 'blocked');
  }
});
