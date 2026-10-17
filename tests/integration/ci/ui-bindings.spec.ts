import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { checkUiBindings, designDigest, type PageRegistry } from '../../../tools/ci/check-ui-bindings.ts';

test('UIB05: explicit retirement permits removal only, never replacement UI or page completion', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-ui-retired-'));
  try {
    mkdirSync(join(root, 'apps/mobile'), { recursive: true });
    writeFileSync(join(root, 'apps/mobile/index.tsx'), 'export default function RetiredRoute() { return null; }');
    const registry: PageRegistry = { schema_version: 1, entries: [{ id: 'page', kind: 'page', surface: 'mobile-app', title: 'Page', states: ['normal'], themes: ['light'], platforms: ['android'],
      design_source: 'Human preview remains pending', design_version: 'r2', design_files: [], design_digest: 'a'.repeat(64), approval: { state: 'pending' },
      production_entry: 'apps/mobile/index.tsx', component_paths: ['apps/mobile/index.tsx'], navigation: 'Temporarily unavailable', implementation: 'retired', reviews: [],
      retirement: { by: 'user', date: '2026-10-17', reference: 'Explicit synthetic removal request', removed_paths: ['apps/mobile/OldScreen.tsx'] } }] };
    const options = { mode: 'changes' as const, paths: ['apps/mobile/OldScreen.tsx', 'apps/mobile/index.tsx'] };
    assert.deepEqual(checkUiBindings(registry, root, options), []);
    assert.match(checkUiBindings(registry, root, { mode: 'stage', ids: ['page'], sourceRevision: 'b'.repeat(40) }).join(), /cannot complete/);
    writeFileSync(join(root, 'apps/mobile/index.tsx'), 'export default function RetiredRoute() { return <Text>New unapproved UI</Text>; }');
    assert.match(checkUiBindings(registry, root, options).join(), /not replacement UI/);
    writeFileSync(join(root, 'apps/mobile/index.tsx'), 'export default function RetiredRoute() { return null; }');
    writeFileSync(join(root, 'apps/mobile/OldScreen.tsx'), 'old source still present');
    assert.match(checkUiBindings(registry, root, options).join(), /still exists/);
    registry.entries[0].retirement!.by = 'AI';
    assert.match(checkUiBindings(registry, root).join(), /human retirement/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('UIB01: pending pages allow structure/backend checks but refuse production UI and stage completion', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-ui-bindings-'));
  try {
    mkdirSync(join(root, 'apps/mobile'), { recursive: true }); writeFileSync(join(root, 'apps/mobile/Page.tsx'), 'page');
    writeFileSync(join(root, 'design.html'), 'design');
    const registry: PageRegistry = { schema_version: 1, entries: [{ id: 'page', kind: 'page', surface: 'mobile-app', title: 'Page', states: ['normal'], themes: ['light'], platforms: ['android'],
      design_source: 'design.html', design_version: 'r2', design_files: ['design.html'], design_digest: designDigest(root, ['design.html']), approval: { state: 'pending' },
      production_entry: 'apps/mobile/Page.tsx', component_paths: ['apps/mobile/Page.tsx'], navigation: 'Launch', implementation: 'existing-unreviewed', reviews: [] }] };
    assert.deepEqual(checkUiBindings(registry, root), []);
    assert.match(checkUiBindings(registry, root, { mode: 'changes' }).join(), /collected paths/);
    assert.deepEqual(checkUiBindings(registry, root, { mode: 'changes', paths: ['supabase/functions/core/index.ts', 'tests/e2e/android/BootstrapShellTest.kt'] }), []);
    assert.match(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/Page.tsx'] }).join(), /human design approval/);
    assert.match(checkUiBindings(registry, root, { mode: 'stage', ids: ['page'] }).join(), /whole-page/);
    registry.entries[0].approval = { state: 'approved', by: 'user', date: '2026-10-17', reference: 'Synthetic user decision', design_version: 'r2', design_digest: registry.entries[0].design_digest };
    assert.deepEqual(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/Page.tsx'] }), []);
    rmSync(join(root, 'apps/mobile/Page.tsx'));
    assert.deepEqual(checkUiBindings(registry, root), []);
    assert.match(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/Page.tsx'] }).join(), /missing selected production source/);
    writeFileSync(join(root, 'apps/mobile/Page.tsx'), 'page');
    registry.entries[0].design_version = 'r3';
    assert.match(checkUiBindings(registry, root).join(), /match this design version/);
    registry.entries[0].design_version = 'r2'; writeFileSync(join(root, 'design.html'), 'changed');
    assert.match(checkUiBindings(registry, root).join(), /design contents changed/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('UIB04: actual stage CLI rejects changed/untracked implementation and allows governance-only commits with unchanged source', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-ui-cli-')), script = resolve('tools/ci/check-ui-bindings.ts');
  try {
    mkdirSync(join(root, 'apps/mobile'), { recursive: true }); mkdirSync(join(root, 'docs/design'), { recursive: true });
    writeFileSync(join(root, 'apps/mobile/Page.tsx'), 'actual source');
    const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    git('init', '--quiet'); git('add', '.'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'page');
    const revision = git('rev-parse', 'HEAD'), digest = 'a'.repeat(64);
    const registry: PageRegistry = { schema_version: 1, entries: [{ id: 'page', kind: 'page', surface: 'mobile-app', title: 'Page', states: ['normal'], themes: ['light'], platforms: ['android'],
      design_source: 'Synthetic human preview', design_version: 'r1', design_files: [], design_digest: digest,
      approval: { state: 'approved', by: 'user', date: '2026-10-17', reference: 'Synthetic decision', design_version: 'r1', design_digest: digest },
      production_entry: 'apps/mobile/Page.tsx', component_paths: ['apps/mobile/Page.tsx'], navigation: 'Launch', implementation: 'existing',
      reviews: [{ platform: 'android', design_version: 'r1', design_digest: digest, states: ['normal'], themes: ['light'], font_scale: 1, viewport: '390x844', safe_area: 'actual', entry: 'Device/Page', source_revision: revision,
        screenshots: ['synthetic.png'], interactions: ['synthetic.log'], result: 'passed' }] }] };
    const registryPath = join(root, 'docs/design/page-registry.json'); writeFileSync(registryPath, JSON.stringify(registry));
    const run = () => spawnSync(process.execPath, ['--experimental-strip-types', script, '--mode', 'stage', '--ids', 'page', '--source-revision', revision], { cwd: root, encoding: 'utf8' });
    assert.equal(run().status, 0);
    git('add', 'docs/design/page-registry.json'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'governance only');
    assert.equal(run().status, 0);
    writeFileSync(join(root, 'apps/mobile/Page.tsx'), 'new implementation'); assert.notEqual(run().status, 0);
    git('restore', 'apps/mobile/Page.tsx');
    writeFileSync(join(root, 'apps/mobile/New.tsx'), 'untracked implementation'); registry.entries[0].component_paths.push('apps/mobile/New.tsx');
    writeFileSync(registryPath, JSON.stringify(registry)); assert.match(run().stderr, /untracked files/);
    assert.equal(readFileSync(join(root, 'apps/mobile/New.tsx'), 'utf8'), 'untracked implementation');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('UIB03: stage requires every platform/state/theme combination and matching design/source, then accepts complete actual records', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-ui-stage-'));
  try {
    writeFileSync(join(root, 'Page.tsx'), 'page');
    const digest = 'a'.repeat(64), revision = 'b'.repeat(40);
    const registry: PageRegistry = { schema_version: 1, entries: [{ id: 'page', kind: 'page', surface: 'mobile-app', title: 'Page', states: ['normal', 'error'], themes: ['light', 'dark'], platforms: ['android', 'ios'],
      design_source: 'Synthetic approved reference', design_version: 'r2', design_files: [], design_digest: digest,
      approval: { state: 'approved', by: 'user', date: '2026-10-17', reference: 'Synthetic human decision', design_version: 'r2', design_digest: digest },
      production_entry: 'Page.tsx', component_paths: ['Page.tsx'], navigation: 'Launch', implementation: 'implemented', reviews: [] }] };
    const entry = registry.entries[0], options = { mode: 'stage' as const, ids: ['page'], sourceRevision: revision };
    const review = (platform: string, states: string[], themes: string[]) => ({ platform, states, themes, design_version: 'r2', design_digest: digest, source_revision: revision,
      font_scale: 1, viewport: '390x844', safe_area: 'actual platform insets', entry: 'Actual test device / Page', screenshots: ['synthetic-screen.png'], interactions: ['synthetic-interaction.log'], result: 'passed' });
    entry.reviews = ['android', 'ios'].flatMap(platform => [review(platform, ['normal'], ['light']), review(platform, ['error'], ['dark'])]);
    assert.match(checkUiBindings(registry, root, options).join(), /whole-page/);
    entry.reviews = ['android', 'ios'].flatMap(platform => entry.states.flatMap(state => entry.themes.map(theme => review(platform, [state], [theme]))));
    assert.deepEqual(checkUiBindings(registry, root, options), []);
    entry.reviews[0].design_digest = 'c'.repeat(64); assert.match(checkUiBindings(registry, root, options).join(), /whole-page/);
    entry.reviews[0].design_digest = digest; entry.reviews[0].source_revision = 'd'.repeat(40);
    assert.match(checkUiBindings(registry, root, options).join(), /whole-page/);
    assert.match(checkUiBindings(registry, root, { mode: 'stage', ids: ['page'] }).join(), /expected implementation source revision/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('UIB02: component approval never approves parent page; unknown UI and AI approval are refused', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-ui-component-'));
  try {
    mkdirSync(join(root, 'apps/mobile'), { recursive: true });
    for (const file of ['Page.tsx', 'Button.tsx']) writeFileSync(join(root, 'apps/mobile', file), file);
    const digest = 'a'.repeat(64);
    const registry: PageRegistry = { schema_version: 1, entries: [
      { id: 'page', kind: 'page', surface: 'mobile-app', title: 'Page', states: ['normal'], themes: ['light'], platforms: ['android'], design_source: 'Human preview', design_version: 'page-r2', design_files: [], design_digest: digest,
        approval: { state: 'pending' }, production_entry: 'apps/mobile/Page.tsx', component_paths: ['apps/mobile/Page.tsx'], navigation: 'Launch', implementation: 'existing', reviews: [] },
      { id: 'button', kind: 'component', surface: 'mobile-app', title: 'Button', states: ['normal'], themes: ['light'], platforms: ['android'], design_source: 'Separate human preview', design_version: 'components-v1', design_files: [], design_digest: digest,
        approval: { state: 'approved', by: 'user', date: '2026-10-17', reference: 'Synthetic explicit decision', design_version: 'components-v1', design_digest: digest }, production_entry: 'apps/mobile/Button.tsx', component_paths: ['apps/mobile/Button.tsx'], navigation: 'Shared control', implementation: 'existing', reviews: [] },
    ] };
    assert.deepEqual(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/Button.tsx'] }), []);
    assert.match(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/Page.tsx'] }).join(), /page: production UI/);
    assert.match(checkUiBindings(registry, root, { mode: 'changes', paths: ['apps/mobile/New.tsx'] }).join(), /missing page/);
    registry.entries[1].approval.by = 'AI'; assert.match(checkUiBindings(registry, root).join(), /human approval source/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
