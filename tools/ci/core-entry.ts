import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { requireCoreEnvironment, sql } from './core-database.ts';
import { normalizeExecution } from './run-check-set.ts';

requireCoreEnvironment();
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const targets: { id: string; command: string; files: string[]; case_count: number }[] = manifest.core_targets || [];
const commands = ['ci:core:contracts', 'ci:service', 'ci:security', 'ci:concurrency', 'ci:recovery', 'ci:components'];
const identity = { target_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  source: 'github-actions', runner_environment: process.env.RUNNER_ENVIRONMENT,
  environment: process.env.CI_ENVIRONMENT, check_set_digest: hash(manifestBytes), readiness: 'not_evaluated' };
mkdirSync('core-output', { recursive: true });
const save = (file: string, value: object) => writeFileSync(`core-output/${file}.json`, JSON.stringify({ ...identity, ...value }, null, 2) + '\n');
const invoke = (command: string) => execFileSync('npm', ['run', command], { stdio: 'inherit', timeout: 180000 });
const execute = (...args: string[]) => execFileSync(process.execPath,
  ['--experimental-strip-types', 'tools/ci/core-entry.ts', ...args], { stdio: 'inherit', timeout: 180000 });
const action = process.argv[2];
if (action === 'all') {
  // Discovery is mandatory even with no core suites; writing a new suite activates it immediately.
  invoke('ci:discover');
  if (!targets.length) save('execution', { state: 'inactive', executed: 0, reason: 'No core suites have been authored' });
  else {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
    for (const target of targets) {
      if (!commands.includes(target.command) || !scripts[target.command] || !Number.isInteger(target.case_count) || target.case_count < 1) {
        throw new Error('Unregistered core command or missing nonempty case inventory');
      }
    }
    if (targets.reduce((count, target) => count + target.case_count, 0) !== manifest.core_case_count) throw new Error('Core case inventory differs');
    execute('migrate');
    execute('migrate'); // Unchanged committed migrations must also survive the incremental path.
    execute('seed');
    let failed = false;
    for (const command of commands) {
      if (!targets.some(target => target.command === command)) continue;
      try { execute('suite', command); } catch { failed = true; }
    }
    save('execution', { state: failed ? 'blocked' : 'passed', active_commands: [...new Set(targets.map(target => target.command))],
      discovered: manifest.core_case_count, scope: 'current-core-only', task_complete: false });
    if (failed) throw new Error('An active core suite failed; original target reports are retained');
  }
} else if (action === 'migrate') {
  const migrations: { file: string; depends_on: string[] }[] = manifest.core_migrations || [];
  const inventory = existsSync('supabase/migrations') ? readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).map(file => `supabase/migrations/${file}`).sort() : [];
  if (JSON.stringify([...migrations.map(entry => entry.file)].sort()) !== JSON.stringify(inventory) || new Set(inventory).size !== migrations.length) {
    throw new Error('Every actual migration requires one explicit dependency registration');
  }
  sql('CREATE SCHEMA IF NOT EXISTS ci_control; CREATE TABLE IF NOT EXISTS ci_control.migrations (file text PRIMARY KEY, digest text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp());');
  const applied = new Set<string>(), results: object[] = [];
  while (applied.size < migrations.length) {
    const next = migrations.find(entry => !applied.has(entry.file) && Array.isArray(entry.depends_on) && entry.depends_on.every(file => applied.has(file)));
    if (!next || !/^supabase\/migrations\/[a-zA-Z0-9_-]+\.sql$/.test(next.file)) throw new Error('Missing or cyclic schema dependency');
    const digest = hash(readFileSync(next.file));
    const previous = sql(`SELECT digest FROM ci_control.migrations WHERE file='${next.file}';`).trim();
    if (previous && previous !== digest) throw new Error('An applied migration was mutated');
    if (!previous) sql(`BEGIN;\n${readFileSync(next.file, 'utf8')}\nINSERT INTO ci_control.migrations(file,digest) VALUES ('${next.file}','${digest}');\nCOMMIT;`);
    results.push({ file: next.file, sha256: digest, state: previous ? 'verified-existing' : 'applied' });
    applied.add(next.file);
  }
  const sequence = existsSync('core-output/migrate-clean.json') ? 'incremental' : 'clean';
  if (migrations.some(entry => entry.file === 'supabase/migrations/0008_current_authorization.sql')) {
    const environment = readFileSync(`${process.env.RUNNER_TEMP}/agoraweave-ci.env`, 'utf8');
    const password = environment.match(/^CORE_DATABASE_PASSWORD=([a-f0-9]{64})$/m)?.[1];
    if (!password) throw new Error('Isolated runtime credential was not provisioned');
    // Only the cloud migration adapter sees this secret; it never enters an artifact.
    sql(`ALTER ROLE core_runtime PASSWORD '${password}';`);
  }
  save(`migrate-${sequence}`, { state: 'passed', migrations: results, scope: 'isolated-current-schema' });
} else if (action === 'seed') {
  const fixture = 'tests/fixtures/core/seed.sql';
  if (!existsSync(fixture)) throw new Error('Active core suites require the controlled real-service fixture');
  sql(readFileSync(fixture, 'utf8'));
  save('seed', { state: 'passed', fixture, fixture_sha256: hash(readFileSync(fixture)), synthetic: true });
} else if (action === 'suite') {
  const command = process.argv[3];
  const selected = targets.filter(target => target.command === command);
  if (!commands.includes(command) || !selected.length) throw new Error('No active suite for this registered command');
  const discovery = JSON.parse(readFileSync('check-output/discovery.json', 'utf8'));
  if (discovery.state !== 'discovered' || discovery.checkout_sha !== identity.target_sha || discovery.check_set_digest !== identity.check_set_digest) throw new Error('Core discovery is not current');
  for (const target of selected) {
    if (!discovery.targets.some((entry: { id: string; files: string[] }) => entry.id === target.id && JSON.stringify(entry.files) === JSON.stringify(target.files))) throw new Error('Core target differs from authenticated discovery');
  }
  const files = selected.flatMap(target => target.files);
  const execution = spawnSync(process.execPath, ['--experimental-strip-types', '--test', '--test-reporter=tap', ...files],
    { encoding: 'utf8', timeout: 150000, maxBuffer: 16 * 1024 * 1024 });
  const raw = execution.stdout || '';
  const expected = selected.reduce((count, target) => count + target.case_count, 0);
  const result = normalizeExecution({ format: 'tap', raw, exit_code: execution.status, expected_count: expected });
  const name = command.replaceAll(':', '-');
  writeFileSync(`core-output/${name}.tap`, raw);
  writeFileSync(`core-output/${name}.stderr`, execution.stderr || '');
  save(name, { ...result, command, executed_files: files.map(path => ({ path, sha256: hash(readFileSync(path)) })), raw_report_sha256: hash(raw) });
  if (result.state !== 'passed') throw new Error('Core target assertions did not pass');
} else throw new Error('Unknown core execution action');
