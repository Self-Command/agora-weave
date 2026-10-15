type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const deny = (reason: string): Fields => ({ state: 'blocked', reason_codes: [reason], readiness: 'not_evaluated' });
const only = (value: Fields, keys: string[]) => Object.keys(value).every(key => keys.includes(key));

function rawFiles(value: unknown): value is Fields[] {
  if (!Array.isArray(value) || !value.length) return false;
  const paths = new Set<string>();
  for (const file of value) {
    if (!object(file) || !only(file, ['path', 'sha256', 'size_bytes']) || typeof file.path !== 'string' ||
        !/^[A-Za-z0-9_./~=-]+$/.test(file.path) || file.path.startsWith('/') ||
        file.path.split('/').some(part => !part || part === '.' || part === '..') ||
        paths.has(file.path) || !digest(file.sha256) || !Number.isSafeInteger(file.size_bytes) || Number(file.size_bytes) < 0) return false;
    paths.add(file.path);
  }
  return true;
}

export function planArchive(input: unknown): Fields {
  if (!object(input) || !only(input, ['repository', 'target_sha', 'run_id', 'attempt', 'artifact_id', 'source_state',
    'original_conclusion', 'archive_sha256', 'raw_files', 'data_class', 'retention_class', 'archived_at',
    'sensitive_expires_at', 'cleanup'])) return deny('unregistered_archive_field');
  if (typeof input.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository) ||
      typeof input.target_sha !== 'string' || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
      !/^[1-9]\d*$/.test(String(input.run_id)) || !/^[1-9]\d*$/.test(String(input.artifact_id)) ||
      !Number.isSafeInteger(input.attempt) || Number(input.attempt) < 1 || input.source_state !== 'verified_source' ||
      !digest(input.archive_sha256) || !rawFiles(input.raw_files)) return deny('unbound_archive_source');
  if (!['success', 'failure', 'cancelled', 'skipped', 'timed_out', 'action_required', 'neutral', 'stale', 'unknown', 'in_progress']
    .includes(String(input.original_conclusion))) return deny('missing_original_conclusion');
  if (!['engineering', 'synthetic', 'sensitive'].includes(String(input.data_class)) ||
      !['ordinary', 'formal'].includes(String(input.retention_class))) return deny('forbidden_archive_class');
  if (!object(input.cleanup) || !only(input.cleanup, ['credentials', 'sandbox', 'scope']) ||
      !['revoked', 'removed', 'not_used'].includes(String(input.cleanup.credentials)) ||
      input.cleanup.sandbox !== 'removed' || (input.cleanup.scope !== undefined && typeof input.cleanup.scope !== 'string')) return deny('incomplete_archive_cleanup');
  const start = typeof input.archived_at === 'string' ? Date.parse(input.archived_at) : NaN;
  if (!Number.isFinite(start)) return deny('invalid_archive_time');
  let end = start + (input.retention_class === 'formal' ? 365 : 90) * 86400000;
  if (input.data_class === 'sensitive') {
    const limit = typeof input.sensitive_expires_at === 'string' ? Date.parse(input.sensitive_expires_at) : NaN;
    if (!Number.isFinite(limit) || limit <= start || limit > start + 7 * 86400000) return deny('invalid_sensitive_deadline');
    end = Math.min(end, limit);
  }
  return { ...input, state: 'archive_planned', expires_at: new Date(end).toISOString(),
    remote_directory: `${input.repository.replace('/', '_')}_${input.target_sha}_${input.run_id}_${input.attempt}_${input.artifact_id}`,
    readiness: 'not_evaluated' };
}

export function verifyReadback(plan: unknown, readback: unknown): Fields {
  if (!object(plan) || plan.state !== 'archive_planned' || !rawFiles(plan.raw_files) || !object(readback) ||
      readback.storage !== 'dedicated-private-sftp' || !digest(plan.archive_sha256) ||
      readback.archive_sha256 !== plan.archive_sha256 || !digest(readback.expected_index_sha256) ||
      readback.index_sha256 !== readback.expected_index_sha256 || !rawFiles(readback.raw_files)) return deny('unbound_private_readback');
  const actual = readback.raw_files;
  if (actual.length !== plan.raw_files.length || plan.raw_files.some(file => !actual.some(candidate =>
    candidate.path === file.path && candidate.sha256 === file.sha256 && candidate.size_bytes === file.size_bytes))) return deny('raw_readback_mismatch');
  return { ...plan, state: 'archived_and_readback_verified', storage: readback.storage,
    index_sha256: readback.index_sha256, readiness: 'not_evaluated' };
}
