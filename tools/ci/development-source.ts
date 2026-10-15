import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { collectEvidence } from './collect-evidence.ts';

export type DevelopmentSourceRequest = { repository: string; token: string; run_id: string; expected_sha?: string };

export async function sourceMetadata(request: DevelopmentSourceRequest, suffix: string): Promise<Record<string, any>> {
  const response = await fetch(`https://api.github.com/repos/${request.repository}${suffix}`, {
    headers: { Authorization: `Bearer ${request.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
    redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Development source metadata unavailable');
  return await response.json();
}

export async function developmentSourceRun(request: DevelopmentSourceRequest): Promise<Record<string, any>> {
  if (request.repository !== 'Self-Command/agora-weave' || !request.token || !/^[1-9]\d*$/.test(request.run_id)) {
    throw new Error('Unbound development source');
  }
  const run = await sourceMetadata(request, `/actions/runs/${request.run_id}`);
  if (String(run.id) !== request.run_id || !/^[a-f0-9]{40}$/.test(run.head_sha) ||
      request.expected_sha !== undefined && run.head_sha !== request.expected_sha ||
      run.path !== '.github/workflows/verify-release.yml' || run.repository?.full_name !== request.repository ||
      run.head_repository?.full_name !== request.repository || !Number.isInteger(run.run_attempt) || run.run_attempt < 1) {
    throw new Error('Development source identity mismatch');
  }
  return run;
}

export async function developmentSourceJobs(request: DevelopmentSourceRequest, attempt: number): Promise<Record<string, any>[]> {
  const jobs: Record<string, any>[] = [];
  for (let page = 1; page <= 100; page++) {
    const listing = await sourceMetadata(request, `/actions/runs/${request.run_id}/attempts/${attempt}/jobs?per_page=100&page=${page}`);
    if (!Array.isArray(listing.jobs) || !Number.isInteger(listing.total_count)) throw new Error('Incomplete development source jobs');
    jobs.push(...listing.jobs);
    if (jobs.length === listing.total_count) break;
    if (!listing.jobs.length || jobs.length > listing.total_count || page === 100) throw new Error('Incomplete development source jobs');
  }
  if (new Set(jobs.map(job => job.id)).size !== jobs.length) throw new Error('Duplicate development source jobs');
  return jobs;
}

export async function developmentSourceArchive(request: DevelopmentSourceRequest, run: Record<string, any>, name: string, root: string) {
  const source = await collectEvidence({ ...request, expected_sha: run.head_sha, expected_attempt: run.run_attempt,
    workflow_path: '.github/workflows/verify-release.yml', artifact_name: name });
  if (source.state !== 'verified_source' || !source.archive) throw new Error('Development original archive unavailable');
  mkdirSync(root, { recursive: true });
  writeFileSync(`${root}/source.zip`, source.archive);
  execFileSync('python3', ['tools/ci/index-archive.py', `${root}/source.zip`, `${root}/index.json`, `${root}/raw`]);
  return { root: `${root}/raw`, source, raw_index: readFileSync(`${root}/index.json`) };
}

/** A running or failed full matrix may still contain a completed, separately authenticated foundation. */
export async function readDevelopmentSource(request: DevelopmentSourceRequest): Promise<Record<string, any>> {
  const run = await developmentSourceRun(request);
  const jobs = await developmentSourceJobs(request, run.run_attempt);
  const publishers = jobs.filter(job => String(job.name).endsWith(' / development-readiness'));
  if (publishers.length !== 1 || publishers[0].status !== 'completed' || publishers[0].conclusion !== 'success') {
    throw new Error('Development readiness publisher did not pass');
  }
  const source = await developmentSourceArchive(request, run,
    `development-readiness-${request.run_id}-${run.run_attempt}`,
    `${process.env.RUNNER_TEMP}/development-source-${request.run_id}-${run.run_attempt}`);
  const document = JSON.parse(readFileSync(`${source.root}/readiness.json`, 'utf8'));
  if (document.target_sha !== run.head_sha || document.source_run_id !== request.run_id || document.attempt !== run.run_attempt) {
    throw new Error('Development readiness body differs from original source');
  }
  return { authenticated: true, document, run_id: request.run_id, attempt: run.run_attempt,
    archive_digest: source.source.archive_sha256, source_job_id: publishers[0].id };
}
