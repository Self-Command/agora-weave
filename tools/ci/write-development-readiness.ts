import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { assessBootstrapRaw } from './bootstrap-reports.ts';
import { initializationDigests } from './bridge-inputs.ts';
import { developmentRequiredIds, validDevelopmentReadiness } from './development-readiness.ts';
import { developmentSourceArchive, developmentSourceJobs, developmentSourceRun } from './development-source.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Development readiness requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== (process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA)) throw new Error('Development checkout changed');
const request = { repository: process.env.GITHUB_REPOSITORY!, token: process.env.GH_TOKEN!,
  run_id: process.env.GITHUB_RUN_ID!, expected_sha: sha };
const run = await developmentSourceRun(request);
const jobs = await developmentSourceJobs(request, run.run_attempt);
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const manifest = readFileSync('tools/ci/validation-manifest.json');
const checkSetDigest = hash(manifest), toolchainDigest = hash(readFileSync('infra/ci/toolchain-lock.json'));
const foundation = initializationDigests();
const required = [
  { id: 'development.install', kind: 'install', name: 'verify-install', job: ' / install' },
  { id: 'development.engineering', kind: 'engineering', name: 'verify-checkset', job: ' / discover' },
  { id: 'development.web', kind: 'web', name: 'verify-web', job: ' / web / web' },
  ...['dev', 'test'].map(environment => ({ id: `development.${environment}-services`, kind: 'service',
    name: `bootstrap-services-${environment}`, job: ` / service / Official Compose (${environment},` })),
];
const observed: Record<string, any>[] = [];
for (const entry of required) {
  try {
    const source = await developmentSourceArchive(request, run, `${entry.name}-${request.run_id}-${run.run_attempt}`,
      `${process.env.RUNNER_TEMP}/development-original-${entry.name}-${request.run_id}-${run.run_attempt}`);
    const read = (file: string) => readFileSync(`${source.root}/${file}`, 'utf8');
    const parse = (file: string) => JSON.parse(read(file));
    const matches = jobs.filter(job => entry.kind === 'service' ? String(job.name).includes(entry.job) : String(job.name).endsWith(entry.job));
    const job = matches.length === 1 ? matches[0] : undefined;
    const identity = parse(entry.kind === 'engineering' ? 'execution.json' : entry.kind === 'service' ? 'configuration.json' : 'identity.json');
    identity.attempt = Number(identity.attempt);
    let state = 'blocked';
    if (entry.kind === 'install') {
      state = identity.checkout_sha === sha && identity.check_set_digest === checkSetDigest &&
        identity.toolchain_digest === toolchainDigest && identity.source === 'github-actions' && identity.runner_environment === 'github-hosted' &&
        identity.run_id === request.run_id && identity.attempt === run.run_attempt && job?.status === 'completed' &&
        job.conclusion === 'success' && /added \d+ packages/.test(read('install.log')) &&
        Array.isArray(parse('lint-report.json')) && parse('lint-report.json').every((file: Record<string, any>) =>
          file.errorCount === 0 && file.warningCount === 0) ? 'passed' : 'blocked';
    } else {
      const raw = entry.kind === 'engineering' ? { tap: read('engineering.tap'), expected_count: JSON.parse(manifest.toString()).engineering_case_count } :
        entry.kind === 'web' ? { report: parse('playwright-report.json'), expected_count: 16 } :
        { configuration: identity, outcome: parse('outcome.json'), containers: read('service-health.json').trim().split(/\r?\n/).map(line => JSON.parse(line)),
          schema_seed: read('schema-seed-probe.txt'), schema_seed_repeat: read('schema-seed-probe-repeat.txt') };
      state = String(assessBootstrapRaw({ kind: entry.kind, target_sha: sha, check_set_digest: checkSetDigest,
        toolchain_digest: toolchainDigest, source_authenticated: true, source_job_state: job?.status === 'completed' ? job.conclusion : 'missing',
        run_id: request.run_id, attempt: run.run_attempt, identity, raw }).state);
      if (entry.kind === 'service') {
        const cleanup = parse('cleanup.json');
        if (entry.id !== `development.${identity.environment}-services` || cleanup.environment !== identity.environment ||
            cleanup.cleanup !== 'success' || cleanup.temporary_files_removed !== true ||
            ['remaining_containers', 'remaining_volumes', 'remaining_networks'].some(key => !Array.isArray(cleanup[key]) || cleanup[key].length !== 0)) state = 'blocked';
      }
    }
    observed.push({ id: entry.id, state, source_verified: true, source_sha: sha, check_set_digest: checkSetDigest,
      source_job_conclusion: job?.conclusion || 'missing', source_job_id: job?.id, artifact_id: source.source.artifact_id,
      archive_digest: source.source.archive_sha256, raw_report_digest: hash(source.raw_index), source_reuse: source.source.reuse_receipt });
  } catch {
    observed.push({ id: entry.id, state: 'missing', source_verified: false, source_sha: sha,
      reason: 'Original development executor evidence is unavailable or invalid' });
  }
}
const purpose = JSON.parse(readFileSync('infra/ci/validation-request.json', 'utf8'));
const document = { state: 'passed', readiness_kind: 'development-ready', development_ready: true, ci_ready: false,
  scope: 'development', validation_intent: purpose.validation_intent, source: 'github-actions', runner_environment: 'github-hosted',
  target_sha: sha, source_run_id: request.run_id, run_id: request.run_id, attempt: run.run_attempt,
  check_set_digest: checkSetDigest, foundation_digests: foundation, required_ids: developmentRequiredIds, observed,
  reports_read: true, read_by: 'actions-original-report-reader', read_at: new Date().toISOString(),
  regressions_passed: observed.some(check => check.id === 'development.engineering' && check.state === 'passed'), feature_complete: false,
  limitation: 'Foundational development channel only; full current-SHA acceptance and current Codex reviews remain required before merge or stage completion.' };
const ready = purpose.schema_version === 1 && validDevelopmentReadiness({ authenticated: true, ancestor_verified: true, document }, foundation, checkSetDigest);
const result = { ...document, state: ready ? 'passed' : 'blocked', development_ready: ready,
  reason_codes: ready ? [] : ['incomplete_original_development_evidence'] };
mkdirSync('development-output', { recursive: true });
writeFileSync('development-output/readiness.json', JSON.stringify(result, null, 2) + '\n');
writeFileSync('development-output/original-source-jobs.json', JSON.stringify({ run, jobs }, null, 2) + '\n');
if (!ready) throw new Error('Development foundation remains blocked');
