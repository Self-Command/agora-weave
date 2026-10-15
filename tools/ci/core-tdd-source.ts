import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { developmentSourceArchive, developmentSourceJobs, developmentSourceRun, type DevelopmentSourceRequest } from './development-source.ts';
import { normalizeExecution } from './run-check-set.ts';

/** Authenticate and retain the original core and independent service-health archives. */
export async function readCoreTddSource(request: DevelopmentSourceRequest, root: string, expectedAttempt?: number): Promise<Record<string, any>> {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
    throw new Error('Core TDD sources require GitHub-hosted Actions');
  }
  const run = await developmentSourceRun(request);
  if (expectedAttempt !== undefined && run.run_attempt !== expectedAttempt) throw new Error('Core attempt differs from catalog');
  const jobs = await developmentSourceJobs(request, run.run_attempt);
  const git = (file: string) => execFileSync('git', ['show', `${run.head_sha}:${file}`]);
  const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
  const manifestBytes = git('tools/ci/validation-manifest.json');
  const manifest = JSON.parse(manifestBytes.toString());
  const targets: { command: string; files: string[]; case_count: number }[] = manifest.core_targets || [];
  if (!targets.length || targets.some(target => !Number.isInteger(target.case_count) || target.case_count < 1) ||
      targets.reduce((sum, target) => sum + target.case_count, 0) !== manifest.core_case_count) throw new Error('No complete active core inventory');
  mkdirSync(root, { recursive: true });
  const observations: Record<string, unknown>[] = [];
  const streams: Record<string, unknown>[] = [];
  for (const environment of ['dev', 'test']) {
    const matches = jobs.filter(job => String(job.name).includes(` / service / Official Compose (${environment},`));
    const job = matches.length === 1 ? matches[0] : undefined;
    const stepPassed = (name: string) => job?.steps?.filter((step: Record<string, unknown>) => step.name === name && step.conclusion === 'success').length === 1;
    if (job?.status !== 'completed' || !stepPassed('Start actual official services and inspect internal health') ||
        !stepPassed('Remove isolated service resources') || !stepPassed('Install committed frozen dependencies on this isolated runner')) {
      throw new Error('Core source service health, frozen installation or cleanup did not pass');
    }
    const health = await developmentSourceArchive(request, run, `bootstrap-services-${environment}-${run.id}-${run.run_attempt}`, `${root}/${environment}/health`);
    const core = await developmentSourceArchive(request, run, `core-services-${environment}-${run.id}-${run.run_attempt}`, `${root}/${environment}/core`);
    const parse = (directory: string, file: string) => JSON.parse(readFileSync(`${directory}/${file}`, 'utf8'));
    const configuration = parse(health.root, 'configuration.json'), outcome = parse(health.root, 'outcome.json');
    const cleanup = parse(health.root, 'cleanup.json');
    const containers = readFileSync(`${health.root}/service-health.json`, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
    const services = ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor'];
    if (configuration.checkout_sha !== run.head_sha || configuration.run_id !== String(run.id) || Number(configuration.attempt) !== run.run_attempt ||
        configuration.check_set_digest !== hash(manifestBytes) || configuration.toolchain_digest !== hash(git('infra/ci/toolchain-lock.json')) ||
        configuration.source !== 'github-actions' || configuration.runner_environment !== 'github-hosted' || configuration.environment !== environment ||
        configuration.internal_network !== true || configuration.published_ports?.length !== 0 || outcome.health !== 'success' || outcome.cleanup !== 'success' ||
        cleanup.environment !== environment || cleanup.cleanup !== 'success' || cleanup.temporary_files_removed !== true ||
        ['remaining_containers', 'remaining_volumes', 'remaining_networks'].some(key => !Array.isArray(cleanup[key]) || cleanup[key].length) ||
        containers.length !== services.length || !services.every(name => containers.filter(container => container.Service === name &&
          container.State === 'running' && (['rest', 'functions', 'meta'].includes(name) || container.Health === 'healthy')).length === 1)) {
      throw new Error('Authenticated core service health or isolation bytes are incomplete');
    }
    for (const file of ['schema-seed-probe.txt', 'schema-seed-probe-repeat.txt']) {
      const probe = readFileSync(`${health.root}/${file}`, 'utf8');
      if (!['CREATE SCHEMA', 'CREATE TABLE', 'INSERT 0 1', 'DO', 'ROLLBACK'].every(value => probe.includes(value))) throw new Error('Live SQL probe incomplete');
    }
    const identity = (document: Record<string, unknown>) => document.target_sha === run.head_sha && document.run_id === String(run.id) &&
      document.attempt === run.run_attempt && document.environment === environment && document.check_set_digest === hash(manifestBytes) &&
      document.source === 'github-actions' && document.runner_environment === 'github-hosted';
    const seed = parse(core.root, 'seed.json');
    if (!identity(seed) || seed.state !== 'passed' || seed.fixture !== 'tests/fixtures/core/seed.sql' || seed.fixture_sha256 !== hash(git(seed.fixture))) {
      throw new Error('Controlled service fixture was not applied');
    }
    for (const name of ['migrate-clean.json', 'migrate-incremental.json']) {
      const migration = parse(core.root, name);
      if (!identity(migration) || migration.state !== 'passed' || !Array.isArray(migration.migrations) ||
          migration.migrations.length !== (manifest.core_migrations || []).length || migration.migrations.some((entry: Record<string, unknown>) =>
            !manifest.core_migrations.some((approved: Record<string, unknown>) => approved.file === entry.file) ||
            typeof entry.file !== 'string' || entry.sha256 !== hash(git(entry.file)))) throw new Error('Real migration evidence is incomplete');
    }
    for (const command of [...new Set(targets.map(target => target.command))]) {
      const selected = targets.filter(target => target.command === command), files = selected.flatMap(target => target.files);
      const name = command.replaceAll(':', '-'), report = parse(core.root, `${name}.json`);
      const raw = readFileSync(`${core.root}/${name}.tap`, 'utf8');
      const expected = selected.reduce((sum, target) => sum + target.case_count, 0);
      const normalized = normalizeExecution({ format: 'tap', raw, expected_count: expected, exit_code: report.exit_code });
      const reasons = normalized.reason_codes as string[];
      const failures = [...raw.matchAll(/^not ok \d+ - .+\r?\n {2}---\r?\n[\s\S]*?^ {2}\.\.\./gm)];
      const semanticRed = Number(normalized.failed) > 0 && report.exit_code !== 0 && failures.length === normalized.failed &&
        failures.every(failure => /^ {2}code: 'ERR_ASSERTION'\r?$/m.test(failure[0]));
      if (!identity(report) || report.command !== command || report.raw_report_sha256 !== hash(raw) ||
          JSON.stringify(report.executed_files) !== JSON.stringify(files.map(path => ({ path, sha256: hash(git(path)) }))) ||
          reasons.some(reason => reason !== 'execution_not_passed') || normalized.executed !== expected ||
          ['skipped', 'cancelled', 'todo'].some(key => normalized[key] !== 0) ||
          (normalized.state !== 'passed' && !semanticRed)) throw new Error('Core source is neither complete Green nor a semantic assertion Red');
      streams.push({ environment, command, target_sha: run.head_sha, run_id: String(run.id), attempt: run.run_attempt,
        source_authenticated: true, check_set_digest: hash(manifestBytes), raw_tap: raw, exit_code: report.exit_code,
        executed_files: report.executed_files, expected_count: expected, normalized,
        health: 'passed', migration_state: 'passed', seed_state: 'passed', cleanup_state: 'passed',
        original_archives: [health.source, core.source].map(source => ({ artifact_id: source.artifact_id,
          sha256: source.archive_sha256, original_attempts: source.attempts, source_reuse: source.reuse_receipt })) });
      observations.push({ environment, command, ...normalized, state: semanticRed ? 'red_observed' : 'green_observed',
        semantic_assertion_red: semanticRed, raw_report_sha256: hash(raw), executed_files: report.executed_files,
        source_job_id: job.id, source_job_conclusion: job.conclusion, health_step: 'success', cleanup_step: 'success',
        original_archives: [health.source, core.source].map(source => ({ artifact_id: source.artifact_id, sha256: source.archive_sha256 })) });
    }
  }
  const fixtures = [...new Set(['tests/fixtures/core/seed.sql', ...(manifest.core_fixture_files || [])])].map(path => ({ path, sha256: hash(git(path)) }));
  return { source: 'github-actions', target_sha: run.head_sha,
    source_run_id: String(run.id), source_attempt: run.run_attempt,
    check_set_digest: hash(manifestBytes), fixtures, observations, streams, manifest,
    state: 'authenticated_observation', readiness: 'not_evaluated', task_complete: false };
}
