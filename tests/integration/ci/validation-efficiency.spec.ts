import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';

type Step = { run?: string; uses?: string; with?: Record<string, string> };
type Job = { uses?: string; steps?: Step[] };
type Workflow = { on?: Record<string, { branches?: string[] } | null>; true?: Record<string, { branches?: string[] } | null>;
  jobs: Record<string, Job>; concurrency: { group: string; 'cancel-in-progress': boolean } };

function workflows(): Record<string, Workflow> {
  const parsed = spawnSync('python3', ['-c',
    'import glob,json,yaml; print(json.dumps({p:yaml.safe_load(open(p,encoding="utf-8")) for p in glob.glob(".github/workflows/*.yml")}))'], { encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  return JSON.parse(parsed.stdout);
}

test('EV01: an open feature PR has exactly one automatic full native execution owner across push and PR events', () => {
  const all = workflows();
  function calledNative(file: string): number {
    if (file.endsWith('/native-bootstrap.yml')) return 1;
    return Object.values(all[file]?.jobs || {}).reduce<number>((sum, job) =>
      sum + (typeof job.uses === 'string' && job.uses.startsWith('./.github/workflows/') ? calledNative(job.uses.slice(2)) : 0), 0);
  }
  let nativeOwners = 0;
  for (const event of ['push', 'pull_request']) {
    for (const [file, definition] of Object.entries(all)) {
      const trigger = (definition.on || definition.true || {})[event];
      const events = definition.on || definition.true || {};
      if (!(event in events)) continue;
      if (trigger?.branches && !trigger.branches.includes('codex/synthetic-feature')) continue;
      nativeOwners += calledNative(file);
    }
  }
  assert.equal(nativeOwners, 1, 'The shared formal chain owns the matrix; standalone diagnostic entry does not auto-duplicate it');
  assert.ok('pull_request' in (all['.github/workflows/ci-bootstrap.yml'].on || all['.github/workflows/ci-bootstrap.yml'].true));
});

test('EV02: old targets and evidence cleanup cannot be automatically cancelled by a newer validation run', () => {
  const all = workflows();
  for (const file of ['verify-release.yml', 'native-bootstrap.yml']) {
    const concurrency = all[`.github/workflows/${file}`].concurrency;
    assert.equal(concurrency['cancel-in-progress'], false);
    const group = concurrency.group;
    assert.ok(group.includes('github.sha') && group.includes('github.event.pull_request.head.sha'),
      'A distinct frozen target must not evict another pending evidence run');
  }
});

test('EV03: immutable npm downloads are cached by lock, toolchain and runner platform while real installs remain', () => {
  const all = workflows();
  for (const file of ['ci-bootstrap.yml', 'verify-increment.yml', 'native-bootstrap.yml', 'web-bootstrap.yml']) {
    for (const job of Object.values(all[`.github/workflows/${file}`].jobs)) {
      if (!job.steps?.some(step => String(step.run || '').includes('ci:install') || String(step.run || '').includes('npm ci'))) continue;
      const setup = job.steps.find(step => String(step.uses || '').startsWith('actions/setup-node@'));
      assert.equal(setup?.with?.cache, 'npm', `${file}: dependency download cache is missing`);
      const inputs = String(setup?.with?.['cache-dependency-path']);
      assert.ok(inputs.includes('package-lock.json') && inputs.includes('infra/ci/toolchain-lock.json'), file);
      assert.ok(job.steps.some(step => String(step.run || '').includes('ci:install') || String(step.run || '').includes('npm ci')));
    }
  }
});

const context = () => ({ target_sha: 'a'.repeat(40), checkout_sha: 'a'.repeat(40), event: 'pull_request',
  event_sha: 'b'.repeat(40), pr_head_sha: 'a'.repeat(40), pr_merge_sha: 'b'.repeat(40),
  repository: 'Self-Command/agora-weave', check_set_digest: 'c'.repeat(64),
  changed_paths: ['docs/engineering/feedback-note.md'] });

test('VI01: feedback, formal Green and completion retain exact event and head identity with distinct evidence purposes', () => {
  for (const intent of ['feedback', 'green', 'completion']) {
    const result = resolveValidationRequest({ schema_version: 1, validation_intent: intent }, context());
    assert.equal(result.state, 'resolved');
    assert.equal(result.validation_intent, intent);
    assert.equal(result.profile, 'bootstrap');
    assert.equal(result.target_sha, 'a'.repeat(40));
    assert.equal(result.event_sha, 'b'.repeat(40));
    assert.equal(result.full_required, intent !== 'feedback');
    assert.equal(result.readiness, 'not_evaluated');
  }
});

test('VI02: unknown intent, checkout mismatch and PR merge mistaken for head cannot request reduced validation', () => {
  for (const [request, patch] of [
    [{ validation_intent: 'documentation-only' }, {}],
    [{ schema_version: 1, validation_intent: 'feedback' }, { checkout_sha: 'b'.repeat(40) }],
    [{ schema_version: 1, validation_intent: 'feedback' }, { pr_head_sha: 'b'.repeat(40) }],
  ] as const) {
    assert.equal(resolveValidationRequest(request, { ...context(), ...patch }).state, 'blocked');
  }
  const unknown = resolveValidationRequest({ schema_version: 1, validation_intent: 'feedback' },
    { ...context(), changed_paths: ['unexpected/executable.sh'] });
  assert.equal(unknown.full_required, true, 'Unknown changes require the complete applicable chain');
});
