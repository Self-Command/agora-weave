type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value: unknown, length = 64) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const numericId = (value: unknown) => typeof value === 'string' && /^[1-9]\d*$/.test(value);
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason] });
function rawFiles(value: unknown): value is Fields[] {
  if (!Array.isArray(value) || !value.length || value.length > 10000 || !value.every(fields)) return false;
  const paths = value.map(file => file.path);
  return new Set(paths).size === paths.length && value.every(file => typeof file.path === 'string' &&
    /^[A-Za-z0-9_. /-]+$/.test(file.path) && !file.path.startsWith('/') &&
    file.path.split('/').every(part => part && part !== '..' && part !== '.') &&
    hash(file.sha256) && Number.isSafeInteger(file.size_bytes) && Number(file.size_bytes) >= 0 && Number(file.size_bytes) <= 128 * 1024 * 1024);
}

/** Plans a private index only; storing bytes never converts the source outcome to passed. */
export function planArchive(input: unknown): Record<string, unknown> {
  if (!fields(input)) return deny('missing_archive_input');
  const allowed = ['repository', 'target_sha', 'run_id', 'attempt', 'artifact_id', 'source_state',
    'original_conclusion', 'archive_sha256', 'raw_files', 'data_class', 'retention_class',
    'archived_at', 'sensitive_expires_at', 'cleanup'];
  if (Object.keys(input).some(key => !allowed.includes(key)) || typeof input.repository !== 'string' ||
    !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(input.repository) || !hash(input.target_sha, 40) ||
    !numericId(input.run_id) || !numericId(input.artifact_id) || !Number.isInteger(input.attempt) || Number(input.attempt) < 1 ||
    input.source_state !== 'verified_source' || !hash(input.archive_sha256) || !rawFiles(input.raw_files) ||
    !['success', 'failure', 'cancelled', 'timed_out', 'skipped', 'neutral', 'action_required', 'unknown'].includes(String(input.original_conclusion))) {
    return deny('invalid_archive_source');
  }
  if (!['engineering', 'synthetic', 'sensitive'].includes(String(input.data_class)) ||
    !['ordinary', 'formal'].includes(String(input.retention_class))) return deny('invalid_archive_class');
  if (!fields(input.cleanup) || !['revoked', 'not_used'].includes(String(input.cleanup.credentials)) ||
    input.cleanup.sandbox !== 'removed') return deny('cleanup_incomplete');
  const archivedAt = typeof input.archived_at === 'string' ? Date.parse(input.archived_at) : NaN;
  if (!Number.isFinite(archivedAt)) return deny('invalid_archive_time');
  const expiry = new Date(archivedAt);
  expiry.setUTCDate(expiry.getUTCDate() + (input.retention_class === 'formal' ? 365 : 90));
  if (input.data_class === 'sensitive') {
    const sensitiveExpiry = typeof input.sensitive_expires_at === 'string' ? Date.parse(input.sensitive_expires_at) : NaN;
    if (!Number.isFinite(sensitiveExpiry) || sensitiveExpiry <= archivedAt || sensitiveExpiry > archivedAt + 7 * 86400000) {
      return deny('invalid_sensitive_deadline');
    }
    expiry.setTime(Math.min(expiry.getTime(), sensitiveExpiry));
  }
  return { ...input, state: 'archive_planned', reason_codes: [],
    remote_directory: `/archive/${input.data_class === 'sensitive' ? 'sensitive' : input.retention_class}/${input.target_sha}_${input.run_id}_${input.attempt}_${input.artifact_id}`,
    expires_at: expiry.toISOString(), storage: 'dedicated-private-sftp', readiness: 'not_evaluated' };
}

export function verifyReadback(plan: unknown, readback: unknown): Record<string, unknown> {
  if (!fields(plan) || plan.state !== 'archive_planned' || !fields(readback) ||
    readback.storage !== 'dedicated-private-sftp' || readback.archive_sha256 !== plan.archive_sha256 ||
    !hash(readback.expected_index_sha256) || readback.index_sha256 !== readback.expected_index_sha256 ||
    !rawFiles(readback.raw_files) || !rawFiles(plan.raw_files) || readback.raw_files.length !== plan.raw_files.length ||
    plan.raw_files.some(file => !(readback.raw_files as Fields[]).some(actual =>
      actual.path === file.path && actual.sha256 === file.sha256 && actual.size_bytes === file.size_bytes))) {
    return deny('readback_mismatch');
  }
  return { state: 'archived_and_readback_verified', reason_codes: [],
    original_conclusion: plan.original_conclusion, readiness: 'not_evaluated' };
}
