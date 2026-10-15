import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as pause } from 'node:timers/promises';
import { account, session, request, token, sql } from '../../fixtures/core/runtime.ts';
import { asynchronousCompose, heldTransaction, readConcurrently } from '../../fixtures/core/concurrency.ts';

const target = '40000000-0000-4000-8000-000000000002';

test('AD01: a request admitted behind an uncommitted restriction waits for its authoritative commit and emits no old body', async () => {
  assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 200, 'The same live follower must first read the original body');
  const writer = await heldTransaction(`SELECT pg_advisory_xact_lock(17013,1); UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='${target}'`);
  let finished = false;
  const pending = readConcurrently(`/posts/${target}`, 2).finally(() => { finished = true; });
  void pending.catch(() => {});
  try {
    try {
      await pause(250);
      assert.equal(finished, false, 'Read admission must coordinate with the in-flight policy writer');
    } finally { await writer.commit(); }
    const result = await pending;
    assert.equal(result.status, 404);
    assert.doesNotMatch(result.body, /Synthetic restricted body/);
  } finally { await pending.catch(() => {}); sql(`UPDATE core.resource SET visibility='followers' WHERE id='${target}';`); }
});

test('AD02: actual session mutation takes the same exclusive admission lock and every read after its commit rejects the old JWT', async () => {
  assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 200);
  const admission = await heldTransaction('SELECT pg_advisory_xact_lock_shared(17013,1)');
  let finished = false;
  const pending = asynchronousCompose(['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
    `UPDATE core.session_registry SET revoked_at=clock_timestamp(),epoch=epoch+1 WHERE account_id='${account(2)}' AND session_id='${session(2)}';\n`)
    .finally(() => { finished = true; });
  void pending.catch(() => {});
  try {
    try {
      await pause(250);
      assert.equal(finished, false, 'The real policy mutation must wait for an existing bounded admission');
    } finally { await admission.commit(); }
    await pending;
    for (let number = 0; number < 3; number++) assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 401);
  } finally { await pending.catch(() => {}); sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(2)}';`); }
});
