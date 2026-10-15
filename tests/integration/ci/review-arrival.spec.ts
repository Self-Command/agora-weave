import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { waitForReviewRecords } from '../../../tools/ci/review-arrival.ts';

test('RV01: reviews published after executor reports can arrive before a bounded rendezvous ends', async () => {
  const root = mkdtempSync(join(tmpdir(), 'review-arrival-'));
  const remote = join(root, 'remote'), local = join(root, 'local');
  mkdirSync(remote); mkdirSync(local);
  writeFileSync(join(remote, 'code.json'), '{"review_kind":"code","source":"synthetic test"}');
  const timer = setTimeout(() => writeFileSync(join(remote, 'visual.json'), '{"review_kind":"visual","source":"synthetic test"}'), 30);
  try {
    const result = await waitForReviewRecords({ directory: local, timeout_ms: 2000, poll_ms: 10, refresh: async () => {
      for (const kind of ['code', 'visual']) if (existsSync(join(remote, kind + '.json'))) {
        copyFileSync(join(remote, kind + '.json'), join(local, kind + '.json'));
      }
    } });
    assert.equal(result.state, 'available');
    assert.equal(JSON.parse(readFileSync(join(local, 'visual.json'), 'utf8')).review_kind, 'visual');
  } finally { clearTimeout(timer); rmSync(root, { recursive: true, force: true }); }
});

test('RV02: stale, partial, empty or failed transfers never satisfy current review arrival and absence times out', async () => {
  const root = mkdtempSync(join(tmpdir(), 'review-absence-'));
  try {
    for (const transfer of ['absent', 'partial', 'empty', 'failed']) {
      const local = join(root, transfer); mkdirSync(local);
      for (const kind of ['code', 'visual']) writeFileSync(join(local, kind + '.json'), '{"stale":true}');
      const result = await waitForReviewRecords({ directory: local, timeout_ms: 35, poll_ms: 10, refresh: async () => {
        if (transfer === 'partial') writeFileSync(join(local, 'code.json'), '{}');
        if (transfer === 'empty') for (const kind of ['code', 'visual']) writeFileSync(join(local, kind + '.json'), '');
        if (transfer === 'failed') {
          for (const kind of ['code', 'visual']) writeFileSync(join(local, kind + '.json'), '{}');
          throw new Error('Controlled transfer failure');
        }
      } });
      assert.equal(result.state, 'missing', transfer);
      assert.equal(existsSync(join(local, 'visual.json')), false, transfer);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
