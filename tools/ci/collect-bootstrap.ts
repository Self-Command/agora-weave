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
const verifiedInputs: Record<string, string>[] = [];
const images: string[] = [];
const cleanupEnvironments: Record<string, unknown>[] = [];
const cleanupSources: Record<string, unknown>[] = [];
const nativeHttpsChecks: Record<string, unknown>[] = [];
const nativeAccessibilityChecks: Record<string, unknown>[] = [];
const ingressChecks: Record<string, unknown>[] = [];
let cleanupIdentity: Record<string, any> | undefined;
const parse = (root: string, file: string) => JSON.parse(readFileSync(`${root}/${file}`, 'utf8'));
const read = (root: string, file: string) => readFileSync(`${root}/${file}`, 'utf8');
function allPng(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? allPng(`${root}/${entry.name}`) :
    entry.name.endsWith('.png') ? [hash(readFileSync(`${root}/${entry.name}`))] : []);
}
function nativeDocuments(root: string): Record<string, any>[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return entry.name.endsWith('.xcresult') ? [] : nativeDocuments(`${root}/${entry.name}`);
    if (!entry.name.endsWith('.json')) return [];
    try {
      const document = parse(root, entry.name);
      return ['native-xctest', 'native-android-accessibility', 'native-xctest-urlsession', 'native-android-httpsurlconnection'].includes(document.source) ? [document] : [];
    } catch { return []; }
  });
}
for (const item of catalog) {
  const root = `${item.directory}/raw`;
  execFileSync('python3', ['tools/ci/index-archive.py', `${item.directory}/source.zip`, `${item.directory}/raw-files.json`, root]);
  const rawFiles = parse(item.directory, 'raw-files.json') as Record<string, any>[];
  for (const file of rawFiles) {
    if (String(file.path).includes('.xcresult/') || !/\.(png|json|xml|tap)$/.test(file.path) &&
      !/\.txt$/.test(file.path)) continue;
    const id = `artifact:${item.artifact_id}/${file.path}`;
    verifiedInputs.push({ id, digest: file.sha256 });
    if (String(file.path).endsWith('.png')) images.push(id);
  }
  const name = String(item.artifact_name);
  let kind: string, ids: string[] = [], jobPattern = '', raw: Record<string, unknown>, identity: Record<string, any>;
  try {
    if (name.startsWith('bootstrap-tooling-')) {
      kind = 'tooling'; ids = ['bootstrap.tooling']; jobPattern = ' / tooling / compatibility';
      identity = parse(root, 'mapping.json');
      const tasks = readFileSync('specs/001-agoraweave-v1/tasks.md');
      const canonicalTaskIds = tasks.toString().split(/\r?\n/).filter(line => /^- \[ \] T\d{3}\b/.test(line))
        .map(line => line.match(/T\d{3}/)![0]);
      raw = { mapping: identity, refusal: parse(root, 'effective-refusal.json'), canonical_task_ids: canonicalTaskIds,
        tasks_sha256: hash(tasks), first_brief: read(root, 'first-brief.md'), last_brief: read(root, 'last-brief.md'),
        ledger: read(root, 'raw-native-ledger.md'), command: read(root, 'raw-task-command.log') };
    } else if (name.startsWith('verify-checkset-')) {
      kind = 'engineering'; ids = ['bootstrap.engineering', 'bootstrap.discovery']; jobPattern = ' / discover';
      identity = parse(root, 'execution.json'); raw = { tap: read(root, 'engineering.tap'), expected_count: manifest.engineering_case_count };
      if (parse(root, 'discovery.json').state !== 'discovered') throw new Error('Missing actual discovery');
    } else if (name.startsWith('bridge-admission-')) {
      kind = 'bridge'; ids = ['bootstrap.bridge']; jobPattern = ' / bridge / scope';
      identity = parse(root, 'bridge-admission.json'); raw = { admission: identity };
    } else if (name.startsWith('tdd-journal-')) {
      kind = 'tdd'; ids = ['bootstrap.tdd']; jobPattern = ' / tdd / journal';
      identity = parse(root, 'journal.json'); raw = { journal: identity };
    } else if (name.startsWith('bootstrap-services-')) {
      kind = 'service'; identity = parse(root, 'configuration.json'); ids = [`bootstrap.${identity.environment}-services`];
      jobPattern = ` / service / Official Compose (${identity.environment},`;
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
      raw = { light: parse(root, 'ios-tests-light.json'), dark: parse(root, 'ios-tests-dark.json'),
        images: [...allPng(`${root}/ios-attachments-light`), ...allPng(`${root}/ios-attachments-dark`)] };
    } else if (name.startsWith('bootstrap-android-api')) {
      kind = 'android'; identity = parse(root, 'identity.json');
      ids = [identity.platform === 'android-api24' ? 'bootstrap.minimum-android' : 'bootstrap.android'];
      jobPattern = `Android shell API ${identity.platform.replace('android-api', '')} actual`;
      raw = { light_log: read(root, 'android-tests-light.log'), dark_log: read(root, 'android-tests-dark.log'),
        light_theme: read(root, 'android-theme-light.txt'), dark_theme: read(root, 'android-theme-dark.txt'),
        hierarchy: read(root, 'android-ui.xml'), images: [hash(readFileSync(`${root}/android-light.png`)), hash(readFileSync(`${root}/android-dark.png`))] };
    } else if (name.startsWith('bootstrap-https-services-')) {
      identity = parse(root, 'configuration.json');
      const matching = jobs.filter(job => String(job.name).includes(' / ingress / ') && String(job.name).includes(`Official Compose (${identity.environment},`));
      const cleanup = parse(root, 'cleanup.json'), processes = parse(root, 'https-process-cleanup.json');
      const service = assessBootstrapRaw({ kind: 'service', target_sha: sha, check_set_digest: checkSetDigest, toolchain_digest: toolchainDigest,
        source_authenticated: true, source_job_state: matching.length === 1 ? matching[0].conclusion : 'missing',
        run_id: runId, attempt: Number(run.run_attempt), identity: { ...identity, attempt: Number(identity.attempt) },
        raw: { configuration: identity, outcome: parse(root, 'outcome.json'), containers: read(root, 'service-health.json').trim().split(/\r?\n/).map(line => JSON.parse(line)),
          schema_seed: read(root, 'schema-seed-probe.txt'), schema_seed_repeat: read(root, 'schema-seed-probe-repeat.txt') } });
      const valid = service.state === 'passed' && parse(root, 'https-startup-probe.json').state === 'passed' &&
        processes.processes_observed === 2 && processes.stopped === true && cleanup.temporary_files_removed === true &&
        ['remaining_containers', 'remaining_volumes', 'remaining_networks'].every(key => Array.isArray(cleanup[key]) && cleanup[key].length === 0);
      ingressChecks.push({ environment: identity.environment, state: valid ? 'passed' : 'blocked', artifact_id: item.artifact_id,
        raw_report_digest: hash(readFileSync(`${item.directory}/raw-files.json`)) });
      continue;
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
    if (kind === 'ios' || kind === 'android') {
      const bound = { target_sha: sha, check_set_digest: checkSetDigest, toolchain_digest: toolchainDigest, source_authenticated: true,
        source_job_state: matches.length === 1 ? matches[0].conclusion : 'missing', run_id: runId, attempt: Number(run.run_attempt), identity };
      const documents = nativeDocuments(root);
      const https = documents.filter(document => document.source.endsWith('urlsession') || document.source.endsWith('httpsurlconnection'));
      const httpsValid = https.length >= 2 && https.every(report => assessBootstrapRaw({ ...bound, kind: 'native-https',
        raw: { report, cleanup: parse(root, 'https-client-cleanup.json') } }).state === 'passed');
      nativeHttpsChecks.push({ platform: identity.platform, state: httpsValid ? 'passed' : 'blocked', artifact_id: item.artifact_id });
      const measurements = documents.filter(document => document.measurement).map(document => document.measurement);
      const digests = new Set(rawFiles.map(file => file.sha256));
      const actualBytesMatch = measurements.every(measurement => digests.has(measurement.tree_sha256) && digests.has(measurement.screenshot_sha256));
      const accessibility = assessBootstrapRaw({ ...bound, kind: 'native-accessibility', raw: { source: kind === 'ios' ? 'native-xctest' : 'native-android-accessibility', measurements,
        exclusions: [{ behavior: kind === 'ios' ? 'voiceover-navigation' : 'talkback-navigation', applicability: 'not_applicable', decision_ref: 'ED-14',
          reason: kind === 'ios' ? 'Current locked iOS runtime has no supported VoiceOver UI service' : 'Locked Google APIs emulator image supplies semantic automation without a TalkBack navigation service' }] } });
      nativeAccessibilityChecks.push({ platform: identity.platform, ...accessibility, state: actualBytesMatch ? accessibility.state : 'blocked', artifact_id: item.artifact_id });
    }
    if (kind === 'service' && result.state === 'passed') {
      try {
        cleanupEnvironments.push(parse(root, 'cleanup.json'));
        cleanupSources.push({ artifact_id: item.artifact_id, raw_report_digest: hash(readFileSync(`${item.directory}/raw-files.json`)) });
        cleanupIdentity = identity;
      } catch { /* An absent postcondition record leaves cleanup incomplete. */ }
    }
  } catch {
    for (const id of ids) observed.push({ id, state: 'missing', source_sha: sha, artifact_id: item.artifact_id,
      reason: 'Required original executor file is missing, unreadable or unbound' });
  }
}
const nativeMatrix = ['ios-16.4', 'ios-26.4', 'android-api24', 'android-api36'];
const matrixPassed = (checks: Record<string, unknown>[]) => checks.length === 4 && nativeMatrix.every(platform =>
  checks.filter(check => check.platform === platform && check.state === 'passed').length === 1);
const nativeConnectivityPassed = matrixPassed(nativeHttpsChecks) && ingressChecks.length === 2 && ['dev', 'test'].every(environment =>
  ingressChecks.filter(check => check.environment === environment && check.state === 'passed').length === 1);
const nativeAccessibilityPassed = matrixPassed(nativeAccessibilityChecks);
for (const [id, passed, reports] of [['bootstrap.native-connectivity', nativeConnectivityPassed, [...nativeHttpsChecks, ...ingressChecks]],
  ['bootstrap.native-accessibility', nativeAccessibilityPassed, nativeAccessibilityChecks]] as const) {
  observed.push({ id, state: passed ? 'passed' : 'blocked', source_verified: true, source_sha: sha,
    check_set_digest: checkSetDigest, source_job_conclusion: passed ? 'success' : 'missing', raw_report_digest: hash(JSON.stringify(reports)), source_reports: reports });
}
if (cleanupIdentity) {
  const result = assessBootstrapRaw({ kind: 'cleanup', target_sha: sha, check_set_digest: checkSetDigest,
    toolchain_digest: toolchainDigest, source_authenticated: true, source_job_state: 'success',
    run_id: runId, attempt: Number(run.run_attempt), identity: cleanupIdentity, raw: { environments: cleanupEnvironments } });
  observed.push({ id: 'bootstrap.cleanup', ...result, source_verified: true, source_sha: sha,
    check_set_digest: checkSetDigest, source_job_conclusion: result.state === 'passed' ? 'success' : 'missing',
    raw_report_digest: hash(JSON.stringify(cleanupSources)), source_artifacts: cleanupSources });
}
const requiredIds = manifest.bootstrap_checks.filter((check: Record<string, unknown>) => check.bootstrap_applicability === 'required').map((check: Record<string, unknown>) => check.id);
for (const id of requiredIds) if (!observed.some(check => check.id === id)) observed.push({ id,
  state: 'missing', source_sha: sha, source_verified: false, reason: 'No bound original executor evidence collected' });
mkdirSync('verify-output', { recursive: true });
writeFileSync('verify-output/original-attempts-and-jobs.json', JSON.stringify(attempts, null, 2) + '\n');
writeFileSync('verify-output/collected-checks.json', JSON.stringify({ source_authenticated: true, source: 'github-actions',
  target_sha: sha, check_set_digest: checkSetDigest, toolchain_digest: toolchainDigest,
  run_id: runId, attempt: run.run_attempt, required_ids: requiredIds, observed,
  collection_complete: true, source_raw_archive_count: catalog.length, readiness: 'not_evaluated', feature_complete: false,
}, null, 2) + '\n');
const contractFiles = ['.specify/memory/constitution.md', 'specs/001-agoraweave-v1/spec.md',
  'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/tasks.md',
  'specs/001-agoraweave-v1/contracts/cloud-validation.md', 'specs/001-agoraweave-v1/contracts/release-evidence.md',
  'docs/design/UI-SPEC.md', 'docs/design/design-tokens.json', 'tools/ci/validation-manifest.json'];
const contractInputs = contractFiles.map(file => ({ id: file, digest: hash(readFileSync(file)) }));
const contractDigest = hash(JSON.stringify(contractInputs));
const sourceDiff = execFileSync('git', ['diff', '--no-ext-diff', '665fffada2dd4fb908b53ad7ca16159ce5e263d8', sha, '--', '.',
  ':(exclude)package-lock.json', ':(exclude).specify/bridge-snapshots/**', ':(exclude)supabase/upstream/**'], { maxBuffer: 16 * 1024 * 1024 });
writeFileSync('verify-output/source.diff', sourceDiff);
const shared = { source_authenticated: true, source: 'github-actions', runner_environment: 'github-hosted',
  expected_sha: sha, contract_digest: contractDigest, verified_inputs: [...contractInputs,
    { id: 'source.diff', digest: hash(sourceDiff) }, ...verifiedInputs], baseline: { required: false, state: 'not_created' } };
const engineeringPassed = observed.some(item => item.id === 'bootstrap.engineering' && item.state === 'passed');
const interactionIds = ['bootstrap.admin', 'bootstrap.share', 'bootstrap.ios', 'bootstrap.minimum-ios', 'bootstrap.android', 'bootstrap.minimum-android'];
const interactionsPassed = interactionIds.every(id => observed.some(item => item.id === id && item.state === 'passed'));
writeFileSync('verify-output/review-context.json', JSON.stringify({ target_sha: sha, source: 'github-actions', source_authenticated: true,
  code: { ...shared, review_kind: 'code', required_images: [],
    required_coverage: ['authorization', 'security', 'concurrency', 'provenance-and-recovery', 'plugin-boundaries', 'test-validity', 'production-content'],
    actual_checks: { source: 'github-actions', state: engineeringPassed ? 'passed' : 'blocked', interactions_passed: false, accessibility_passed: false } },
  visual: { ...shared, review_kind: 'visual', required_images: images,
    required_coverage: ['admin:shell', 'share:shell', 'ios:current:launch-resume', 'ios:minimum:launch-resume',
      'android:current:launch-resume', 'android:minimum:launch-resume', 'simulator-accessibility-admission'],
    actual_checks: { source: 'github-actions', state: interactionsPassed && nativeAccessibilityPassed ? 'passed' : 'blocked',
      interactions_passed: interactionsPassed, accessibility_passed: nativeAccessibilityPassed,
      device_scope: 'ED-14 GitHub-hosted simulators', exclusions: ['VoiceOver navigation unavailable on locked iOS', 'TalkBack navigation unavailable in locked image'],
      deferred_controls: 'Title-only bootstrap has no editable fields, IME flow or actionable touch controls; business activation retains their required checks' } },
  readiness: 'not_evaluated', feature_complete: false }, null, 2) + '\n');
