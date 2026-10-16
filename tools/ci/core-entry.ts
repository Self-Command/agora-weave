import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { coreEnvironmentFile, requireCoreEnvironment, sql } from './core-database.ts';
import { normalizeExecution } from './run-check-set.ts';
import { prepareLocalServices } from './local-services.ts';
import { executionContext, executionDirectory } from './execution-context.ts';

if (process.argv[2] === 'prepare-local') {
  const runtime = prepareLocalServices();
  console.log(`Prepared isolated local ${runtime.environment} services (${runtime.project}); health is not yet evaluated.`);
  process.exit(0);
}
requireCoreEnvironment();
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const targets: { id: string; command: string; files: string[]; case_count: number }[] = manifest.core_targets || [];
const commands = ['ci:core:contracts', 'ci:service', 'ci:security', 'ci:concurrency', 'ci:recovery', 'ci:components'];
const identity: Record<string, any> = { ...executionContext(), environment: process.env.AGORAWEAVE_EXECUTION_SOURCE === 'local'
  ? process.env.AGORAWEAVE_LOCAL_ENVIRONMENT : process.env.CI_ENVIRONMENT, check_set_digest: hash(manifestBytes) };
const directory = executionDirectory('core', identity);
mkdirSync(directory, { recursive: true });
const save = (file: string, value: object) => writeFileSync(`${directory}/${file}.json`, JSON.stringify({ ...identity, ...value }, null, 2) + '\n');
const execute = (...args: string[]) => execFileSync(process.execPath,
  ['--experimental-strip-types', 'tools/ci/core-entry.ts', ...args], { stdio: 'inherit', timeout: 180000 });
const action = process.argv[2];
if (action === 'all' || action === 'batch') {
  const requested = action === 'batch' ? String(process.env.AGORAWEAVE_BATCH_TARGETS || '').split(',').map(id => id.trim()).filter(Boolean) : [];
  if (action === 'batch' && (!requested.length || new Set(requested).size !== requested.length ||
      requested.some(id => !targets.some(target => target.id === id)))) throw new Error('Batch requires explicit registered core targets');
  const selectedTargets = action === 'batch' ? targets.filter(target => requested.includes(target.id)) : targets;
  // Discovery is mandatory even with no core suites; writing a new suite activates it immediately.
  execFileSync(process.execPath, ['--experimental-strip-types', 'tools/ci/discover-targets.ts'], { stdio: 'inherit', timeout: 180000 });
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
    execute('seed');
    let failed = false;
    const invocations = selectedTargets.map(target => ['target', target.id]);
    for (const args of invocations) {
      try { execute(...args); } catch { failed = true; }
    }
    save('execution', { state: failed ? 'blocked' : 'passed', active_commands: [...new Set(targets.map(target => target.command))],
      discovered: selectedTargets.reduce((count, target) => count + target.case_count, 0),
      target_ids: selectedTargets.map(target => target.id), scope: action === 'batch' ? 'selected-business-batch' : 'current-core-only', task_complete: false });
    if (failed) throw new Error('An active core suite failed; original target reports are retained');
  }
} else if (action === 'migrate') {
  const migrations: { file: string; depends_on: string[] }[] = manifest.core_migrations || [];
  if (migrations.some(entry => entry.file.endsWith('/0011_independent_security_journal.sql'))) {
    // Provision outside the migration transaction; dblink commits the independent
    // archive before business writes. The password remains in an owner-only mapping.
    const variables = Object.fromEntries(readFileSync(coreEnvironmentFile(),'utf8').split(/\r?\n/)
      .filter(line => /^[A-Z][A-Z0-9_]*=/.test(line)).map(line => [line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
    const literal = (value: string) => "'"+value.replaceAll("'","''")+"'";
    try {
      sql('CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA extensions;');
      if (sql("SELECT 1 FROM pg_database WHERE datname='agoraweave_security';").trim()!=='1') {
        const password = variables.POSTGRES_PASSWORD;
        if (!password) throw new Error('Missing isolated database credential');
        const dsn = `host=127.0.0.1 dbname=postgres user=postgres password='${password.replaceAll('\\','\\\\').replaceAll("'","\\'")}'`;
        sql(`SELECT extensions.dblink_exec(${literal(dsn)},'CREATE DATABASE agoraweave_security');`);
      }
      sql(`CREATE SERVER IF NOT EXISTS core_security FOREIGN DATA WRAPPER dblink_fdw
        OPTIONS(host '127.0.0.1',dbname 'agoraweave_security');
        CREATE USER MAPPING IF NOT EXISTS FOR postgres SERVER core_security OPTIONS(user 'postgres',password ${literal(variables.POSTGRES_PASSWORD)});
        ALTER USER MAPPING FOR postgres SERVER core_security OPTIONS(SET password ${literal(variables.POSTGRES_PASSWORD)});
        REVOKE ALL ON FOREIGN SERVER core_security FROM PUBLIC,anon,authenticated,service_role,core_runtime;`);
    } catch (error) {
      const stderr = (error as { stderr?: Buffer | string }).stderr?.toString() || '';
      const summary = Object.values(variables).filter(value => value.length>=8)
        .reduce((text,value)=>text.split(value).join('[REDACTED]'),stderr.split(/\r?\n/).filter(line=>/^(ERROR|DETAIL|HINT):/.test(line)).join(' '));
      throw new Error('Independent journal provisioning failed: '+(summary || 'credential or connection unavailable'));
    }
  }
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
  const sequence = existsSync(`${directory}/migrate-clean.json`) ? 'incremental' : 'clean';
  if (migrations.some(entry => entry.file === 'supabase/migrations/0008_current_authorization.sql')) {
    const environment = readFileSync(coreEnvironmentFile(), 'utf8');
    const password = environment.match(/^CORE_DATABASE_PASSWORD=([a-f0-9]{64})$/m)?.[1];
    if (!password) throw new Error('Isolated runtime credential was not provisioned');
    // Only the migration adapter sees this secret; it never enters an artifact.
    sql(`ALTER ROLE core_runtime PASSWORD '${password}';`);
  }
  save(`migrate-${sequence}`, { state: 'passed', migrations: results, scope: 'isolated-current-schema' });
} else if (action === 'seed') {
  const fixture = 'tests/fixtures/core/seed.sql';
  if (!existsSync(fixture)) throw new Error('Active core suites require the controlled real-service fixture');
  sql(readFileSync(fixture, 'utf8'));
  save('seed', { state: 'passed', fixture, fixture_sha256: hash(readFileSync(fixture)), synthetic: true });
} else if (action === 'suite' || action === 'target') {
  const selected = targets.filter(target => action === 'target' ? target.id === process.argv[3] : target.command === process.argv[3]);
  const command = action === 'target' ? selected[0]?.command || '' : process.argv[3];
  if (!commands.includes(command) || !selected.length) throw new Error('No active suite for this registered command');
  const files = selected.flatMap(target => target.files);
  const args = ['--experimental-strip-types', '--test', '--test-reporter=tap', '--test-concurrency=1', ...files];
  const started_at = new Date().toISOString();
  const execution = spawnSync(process.execPath, args,
    { encoding: 'utf8', timeout: selected.length > 1 ? 600000 : 150000, maxBuffer: 16 * 1024 * 1024 });
  const raw = execution.stdout || '';
  const expected = selected.reduce((count, target) => count + target.case_count, 0);
  const result = normalizeExecution({ format: 'tap', raw, exit_code: execution.status, expected_count: expected });
  const name = action === 'target' ? selected[0].id.replaceAll('.', '-') : command.replaceAll(':', '-');
  writeFileSync(`${directory}/${name}.tap`, raw);
  writeFileSync(`${directory}/${name}.stderr`, execution.stderr || '');
  save(name, { ...result, command, invocation: [process.execPath, ...args], started_at, finished_at: new Date().toISOString(),
    executed_files: files.map(path => ({ path, sha256: hash(readFileSync(path)) })), raw_report_sha256: hash(raw) });
  console.log(`${name}: ${result.state} (${result.passed ?? 0}/${expected} tests)`);
  if (result.state !== 'passed') throw new Error('Core target assertions did not pass');
} else throw new Error('Unknown core execution action');
