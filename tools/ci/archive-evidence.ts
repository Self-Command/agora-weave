type Document = Record<string, unknown>;
const isDocument = (value: unknown): value is Document => value !== null && typeof value === 'object' && !Array.isArray(value);
const hexDigest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const fieldsAllowed = (value: Document, fields: string[]) => Object.keys(value).every(field => fields.includes(field));
const blocked = (reason: string): Document => ({ state: 'blocked', reason_codes: [reason], readiness: 'not_evaluated' });

function validInventory(value: unknown): value is Document[] {
  if (!Array.isArray(value) || !value.length) return false;
  const names = new Set<string>();
  for (const file of value) {
    if (!isDocument(file) || !fieldsAllowed(file, ['path', 'sha256', 'size_bytes']) ||
        typeof file.path !== 'string' || !/^[A-Za-z0-9_.~+=@,() /-]+$/.test(file.path) ||
        file.path.startsWith('/') || file.path.split('/').some(part => !part || part === '.' || part === '..') ||
        names.has(file.path) || !hexDigest(file.sha256) || !Number.isSafeInteger(file.size_bytes) || Number(file.size_bytes) < 0) return false;
    names.add(file.path);
  }
  return true;
}

export function planArchive(input: unknown): Document {
  if (!isDocument(input) || !fieldsAllowed(input, ['repository', 'target_sha', 'run_id', 'attempt', 'artifact_id',
    'source_state', 'original_conclusion', 'archive_sha256', 'raw_files', 'data_class', 'retention_class',
    'archived_at', 'sensitive_expires_at', 'cleanup'])) return blocked('unregistered_index_field');
  if (typeof input.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository) ||
      typeof input.target_sha !== 'string' || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
      !/^[1-9]\d*$/.test(String(input.run_id)) || !/^[1-9]\d*$/.test(String(input.artifact_id)) ||
      !Number.isSafeInteger(input.attempt) || Number(input.attempt) < 1 || input.source_state !== 'verified_source' ||
      !hexDigest(input.archive_sha256) || !validInventory(input.raw_files)) return blocked('invalid_authenticated_archive');
  if (!['success', 'failure', 'cancelled', 'skipped', 'timed_out', 'action_required', 'neutral', 'stale', 'unknown', 'in_progress']
    .includes(String(input.original_conclusion))) return blocked('unknown_original_state');
  if (!['engineering', 'synthetic', 'sensitive'].includes(String(input.data_class)) ||
      !['ordinary', 'formal'].includes(String(input.retention_class))) return blocked('forbidden_data_class');
  if (!isDocument(input.cleanup) || !fieldsAllowed(input.cleanup, ['credentials', 'sandbox', 'scope']) ||
      !['revoked', 'removed', 'not_used'].includes(String(input.cleanup.credentials)) || input.cleanup.sandbox !== 'removed' ||
      (input.cleanup.scope !== undefined && typeof input.cleanup.scope !== 'string')) return blocked('unconfirmed_cleanup');
  const archived = typeof input.archived_at === 'string' ? Date.parse(input.archived_at) : NaN;
  if (!Number.isFinite(archived)) return blocked('invalid_retention_start');
  let expires = archived + (input.retention_class === 'formal' ? 365 : 90) * 86400000;
  if (input.data_class === 'sensitive') {
    const sensitive = typeof input.sensitive_expires_at === 'string' ? Date.parse(input.sensitive_expires_at) : NaN;
    if (!Number.isFinite(sensitive) || sensitive <= archived || sensitive > archived + 7 * 86400000) return blocked('missing_sensitive_deadline');
    expires = Math.min(expires, sensitive);
  }
  return { ...input, state: 'archive_planned', expires_at: new Date(expires).toISOString(), readiness: 'not_evaluated',
    remote_directory: `${input.repository.replace('/', '_')}_${input.target_sha}_${input.run_id}_${input.attempt}_${input.artifact_id}` };
}

export function verifyReadback(plan: unknown, readback: unknown): Document {
  if (!isDocument(plan) || plan.state !== 'archive_planned' || !validInventory(plan.raw_files) ||
      !isDocument(readback) || readback.storage !== 'dedicated-private-sftp' || !hexDigest(plan.archive_sha256) ||
      readback.archive_sha256 !== plan.archive_sha256 || !hexDigest(readback.expected_index_sha256) ||
      readback.index_sha256 !== readback.expected_index_sha256 || !validInventory(readback.raw_files)) return blocked('invalid_private_readback');
  const files = readback.raw_files;
  if (files.length !== plan.raw_files.length || plan.raw_files.some(file => !files.some(actual =>
    actual.path === file.path && actual.sha256 === file.sha256 && actual.size_bytes === file.size_bytes))) return blocked('different_raw_file_inventory');
  return { ...plan, state: 'archived_and_readback_verified', index_sha256: readback.index_sha256,
    storage: 'dedicated-private-sftp', readiness: 'not_evaluated' };
}
