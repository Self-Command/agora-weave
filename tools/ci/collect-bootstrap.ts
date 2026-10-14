import './collect-archives.ts';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { assessBootstrapRaw } from './bootstrap-reports.ts';

const repository = process.env.GITHUB_REPOSITORY!;
const runId = process.env.SOURCE_RUN_ID || process.env.GITHUB_RUN_ID!;
const sha = process.env.SOURCE_SHA || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA!;
const headers = { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
async function metadata(suffix: string): Promise<Record<string, any>> {
  const result = await fetch(`https://api.github.com/repos/${repository}${suffix}`, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!result.ok) throw new Error('Original job metadata unavailable');
  return await result.json();
}
const run = await metadata(`/actions/runs/${runId}`);
const attempts: Record<string, unknown>[] = [];
let jobs: Record<string, any>[] = [];
for (let attempt = 1; attempt <= Number(run.run_attempt); attempt++) {
  const original = await metadata(`/actions/runs/${runId}/attempts/${attempt}`);
  if (original.head_sha !== sha || original.run_attempt !== attempt) throw new Error('Original job attempt differs');
  const listing: Record<string, any>[] = [];
  for (let page = 1; page <= 100; page++) {
    const data = await metadata(`/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100&page=${page}`);
    if (!Number.isInteger(data.total_count) || !Array.isArray(data.jobs)) throw new Error('Incomplete original job listing');
    listing.push(...data.jobs);
    if (listing.length === data.total_count) break;
    if (!data.jobs.length || listing.length > data.total_count || page === 100) throw new Error('Incomplete original jobs');
  }
  if (new Set(listing.map(job => job.id)).size !== listing.length) throw new Error('Duplicate source jobs');
  attempts.push({ run: original, jobs: listing });
  if (attempt === run.run_attempt) jobs = listing;
}
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const checkSetDigest = hash(manifestBytes);
const toolchainDigest = hash(readFileSync('infra/ci/toolchain-lock.json'));
const catalog = JSON.parse(readFileSync('archive-output/catalog.json', 'utf8')) as Record<string, any>[];
const observed: Record<string, unknown>[] = [];
const parse = (root: string, file: string) => JSON.parse(readFileSync(`${root}/${file}`, 'utf8'));
const read = (root: string, file: string) => readFileSync(`${root}/${file}`, 'utf8');
function allPng(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? allPng(`${root}/${entry.name}`) :
    entry.name.endsWith('.png') ? [hash(readFileSync(`${root}/${entry.name}`))] : []);
}
for (const item of catalog) {
  const root = `${item.directory}/raw`;
  execFileSync('python3', ['tools/ci/index-archive.py', `${item.directory}/source.zip`, `${item.directory}/raw-files.json`, root]);
  const name = String(item.artifact_name);
  let kind = '', ids: string[] = [], jobPattern = '', raw: Record<string, unknown> = {}, identity: Record<string, any>;
  try {
    if (name.startsWith('verify-checkset-')) {
      kind = 'engineering'; ids = ['bootstrap.engineering', 'bootstrap.discovery']; jobPattern = ' / discover';
      identity = parse(root, 'execution.json'); raw = { tap: read(root, 'engineering.tap'), expected_count: manifest.engineering_case_count };
      if (parse(root, 'discovery.json').state !== 'discovered') throw new Error('Missing actual discovery');
    } else if (name.startsWith('bootstrap-services-')) {
      kind = 'service'; identity = parse(root, 'configuration.json'); ids = [`bootstrap.${identity.environment}-services`];
      jobPattern = `Official Compose (${identity.environment},`;
      identity.attempt = Number(identity.attempt);
      raw = { configuration: identity, outcome: parse(root, 'outcome.json'),
        containers: read(root, 'service-health.json').trim().split(/\r?\n/).map(line => JSON.parse(line)),
        schema_seed: read(root, 'schema-seed-probe.txt'), schema_seed_repeat: read(root, 'schema-seed-probe-repeat.txt') };
    } else if (name.startsWith('verify-web-')) {
      kind = 'web'; ids = ['bootstrap.admin', 'bootstrap.share']; jobPattern = ' / web / web';
      identity = parse(root, 'identity.json'); raw = { report: parse(root, 'playwright-report.json'), expected_count: 16 };
    } else if (name.startsWith('bootstrap-ios-') && !name.includes('minimum-admission')) {
      kind = 'ios'; identity = parse(root, 'identity.json');
      ids = [identity.platform === 'ios-16.4' ? 'bootstrap.minimum-ios' : 'bootstrap.ios'];
      jobPattern = `iOS shell ${identity.platform.replace('ios-', '')} exact`;
      raw = { light: parse(root, 'ios-tests-light.json'), dark: parse(root, 'ios-tests-dark.json'), images: allPng(root) };
    } else if (name.startsWith('bootstrap-android-api')) {
      kind = 'android'; identity = parse(root, 'identity.json');
      ids = [identity.platform === 'android-api24' ? 'bootstrap.minimum-android' : 'bootstrap.android'];
      jobPattern = `Android shell API ${identity.platform.replace('android-api', '')} actual`;
      raw = { light_log: read(root, 'android-tests-light.log'), dark_log: read(root, 'android-tests-dark.log'),
        hierarchy: read(root, 'android-ui.xml'), images: [hash(readFileSync(`${root}/android-light.png`)), hash(readFileSync(`${root}/android-dark.png`))] };
    } else if (name.startsWith('verify-install-')) {
      identity = parse(root, 'identity.json'); ids = ['bootstrap.install']; jobPattern = ' / install';
      const matches = jobs.filter(job => String(job.name).endsWith(jobPattern));
      const valid = identity.checkout_sha === sha && identity.check_set_digest === checkSetDigest &&
        identity.toolchain_digest === toolchainDigest && identity.run_id === runId &&
        matches.length === 1 && matches[0].conclusion === 'success' && /added \d+ packages/.test(read(root, 'install.log'));
      observed.push({ id: ids[0], state: valid ? 'passed' : 'blocked', source_verified: true, source_sha: sha,
        check_set_digest: checkSetDigest, source_job_conclusion: matches[0]?.conclusion || 'missing',
        raw_report_digest: hash(readFileSync(`${item.directory}/raw-files.json`)), artifact_id: item.artifact_id });
      continue;
    } else continue;
    const matches = jobs.filter(job => String(job.name).includes(jobPattern));
    const result = assessBootstrapRaw({ kind, target_sha: sha, check_set_digest: checkSetDigest, toolchain_digest: toolchainDigest,
      source_authenticated: true, source_job_state: matches.length === 1 ? matches[0].conclusion : 'missing',
      run_id: runId, attempt: Number(run.run_attempt), identity, raw });
    for (const id of ids) observed.push({ id, ...result, source_verified: true, source_sha: sha,
      check_set_digest: checkSetDigest, source_job_conclusion: matches[0]?.conclusion || 'missing',
      raw_report_digest: hash(readFileSync(`${item.directory}/raw-files.json`)), artifact_id: item.artifact_id });
  } catch (error) {
    for (const id of ids) observed.push({ id, state: 'missing', source_sha: sha, artifact_id: item.artifact_id,
      reason: 'Required original executor file is missing, unreadable or unbound' });
  }
}
const requiredIds = manifest.bootstrap_checks.filter((check: Record<string, unknown>) => check.bootstrap_applicability === 'required').map((check: Record<string, unknown>) => check.id);
for (const id of requiredIds) if (!observed.some(check => check.id === id)) observed.push({ id,
  state: id === 'bootstrap.physical-devices' ? 'unavailable' : 'missing', source_sha: sha, source_verified: false,
  reason: id === 'bootstrap.physical-devices' ? 'ED-13 physical service unavailable' : 'No bound original executor evidence collected' });
mkdirSync('verify-output', { recursive: true });
writeFileSync('verify-output/original-attempts-and-jobs.json', JSON.stringify(attempts, null, 2) + '\n');
writeFileSync('verify-output/collected-checks.json', JSON.stringify({ source_authenticated: true, source: 'github-actions',
  target_sha: sha, check_set_digest: checkSetDigest, toolchain_digest: toolchainDigest,
  run_id: runId, attempt: run.run_attempt, required_ids: requiredIds, observed,
  collection_complete: true, source_raw_archive_count: catalog.length, readiness: 'not_evaluated', feature_complete: false,
}, null, 2) + '\n');
