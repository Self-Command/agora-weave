export type CollectionRequest = {
  repository: string;
  run_id: string;
  expected_sha: string;
  expected_attempt: number;
  workflow_path: string;
  artifact_name: string;
  token: string;
};
export type CollectionResult = {
  state: string;
  reason_codes: string[];
  archive?: Uint8Array;
  archive_sha256?: string;
  attempts?: Record<string, unknown>[];
  artifact_id?: number;
  original_conclusion?: string;
  source_run?: Record<string, unknown>;
};

type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
function fail(reason: string): never { throw new Error(`source_${reason}`); }

/** Authenticating a source preserves its outcome; it does not assess the reported checks. */
export async function collectEvidence(request: CollectionRequest, fetcher: typeof fetch = fetch): Promise<CollectionResult> {
  try {
    if (!/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(request.repository) ||
      !/^[1-9]\d*$/.test(request.run_id) || !/^[a-f0-9]{40}$/.test(request.expected_sha) ||
      !Number.isInteger(request.expected_attempt) || request.expected_attempt < 1 || request.expected_attempt > 100 ||
      !/^\.github\/workflows\/[A-Za-z0-9_-]+\.ya?ml$/.test(request.workflow_path) ||
      !request.artifact_name || !request.token) fail('invalid_request');
    const root = `https://api.github.com/repos/${request.repository}`;
    const headers = { Authorization: `Bearer ${request.token}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10' };
    async function metadata(path: string): Promise<Fields> {
      const response = await fetcher(root + path, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (!response.ok) fail(`http_${response.status}`);
      const data: unknown = await response.json();
      if (!fields(data)) fail('invalid_metadata');
      return data;
    }
    function identity(run: Fields, attempt: number) {
      if (String(run.id) !== request.run_id || run.head_sha !== request.expected_sha || run.run_attempt !== attempt ||
        run.path !== request.workflow_path || !fields(run.repository) || run.repository.full_name !== request.repository ||
        !fields(run.head_repository) || run.head_repository.full_name !== request.repository ||
        !['push', 'pull_request', 'workflow_dispatch', 'workflow_call'].includes(String(run.event))) fail('run_identity_mismatch');
    }
    const run = await metadata(`/actions/runs/${request.run_id}`);
    identity(run, request.expected_attempt);
    const attempts: Fields[] = [];
    for (let attempt = 1; attempt <= request.expected_attempt; attempt++) {
      const actual = await metadata(`/actions/runs/${request.run_id}/attempts/${attempt}`);
      identity(actual, attempt);
      attempts.push(actual);
    }
    const artifacts: Fields[] = [];
    let count: number | undefined;
    for (let page = 1; page <= 1000; page++) {
      const listing = await metadata(`/actions/runs/${request.run_id}/artifacts?per_page=100&page=${page}`);
      if (!Number.isInteger(listing.total_count) || Number(listing.total_count) < 0 ||
        !Array.isArray(listing.artifacts) || !listing.artifacts.every(fields)) fail('incomplete_artifact_listing');
      if (count !== undefined && count !== listing.total_count) fail('changing_artifact_listing');
      count = Number(listing.total_count);
      artifacts.push(...listing.artifacts as Fields[]);
      if (artifacts.length === count) break;
      if (artifacts.length > count || listing.artifacts.length === 0 || page === 1000) fail('incomplete_artifact_listing');
    }
    const matches = artifacts.filter(artifact => artifact.name === request.artifact_name);
    if (matches.length !== 1) fail('ambiguous_or_missing_artifact');
    const artifact = matches[0];
    const maxBytes = 128 * 1024 * 1024;
    if (!Number.isSafeInteger(artifact.id) || Number(artifact.id) < 1 || artifact.expired !== false ||
      !Number.isSafeInteger(artifact.size_in_bytes) || Number(artifact.size_in_bytes) < 1 || Number(artifact.size_in_bytes) > maxBytes ||
      !fields(artifact.workflow_run) || String(artifact.workflow_run.id) !== request.run_id ||
      artifact.workflow_run.head_sha !== request.expected_sha ||
      typeof artifact.digest !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(artifact.digest)) fail('artifact_identity_mismatch');
    const response = await fetcher(`${root}/actions/artifacts/${artifact.id}/zip`, {
      headers, redirect: 'manual', signal: AbortSignal.timeout(30000),
    });
    if (response.status !== 302) fail(`archive_http_${response.status}`);
    const location = response.headers.get('location');
    if (!location) fail('missing_download_location');
    const signed = new URL(location);
    if (signed.protocol !== 'https:' || signed.username || signed.password ||
      !['.actions.githubusercontent.com', '.githubusercontent.com', '.blob.core.windows.net'].some(suffix => signed.hostname.endsWith(suffix))) fail('untrusted_download_location');
    // GitHub bearer credentials are only sent to api.github.com, never the signed storage URL.
    const download = await fetcher(signed.href, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!download.ok || !download.body) fail(`download_http_${download.status}`);
    const reader = download.body.getReader();
    const chunks: Buffer[] = [];
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.length;
      if (size > maxBytes) { await reader.cancel(); fail('archive_too_large'); }
      chunks.push(Buffer.from(chunk.value));
    }
    const archive = Buffer.concat(chunks);
    const digest = createHash('sha256').update(archive).digest('hex');
    if (`sha256:${digest}` !== artifact.digest) fail('archive_digest_mismatch');
    return { state: 'verified_source', reason_codes: [], archive, archive_sha256: digest,
      attempts, artifact_id: Number(artifact.id), source_run: run,
      original_conclusion: String(attempts.at(-1)?.conclusion ?? 'unknown') };
  } catch (error) {
    const reason = error instanceof Error && /^source_[a-z_0-9]+$/.test(error.message) ? error.message : 'source_collection_unavailable';
    return { state: 'blocked', reason_codes: [reason] };
  }
}
import { createHash } from 'node:crypto';

