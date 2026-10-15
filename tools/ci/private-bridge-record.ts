import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Storage transport only. No archived content is executed. */
export function preservePrivateBridgeRecord(record: Record<string, any>): Record<string, any> {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Private record transport requires Actions');
  const { target_sha: sha, run_id: run, attempt } = record;
  if (!/^[a-f0-9]{40}$/.test(sha) || !/^[1-9]\d*$/.test(run) || !Number.isInteger(attempt) || attempt < 1) throw new Error('Unbound private record');
  for (const name of ['EVIDENCE_SSH_PRIVATE_KEY', 'EVIDENCE_SSH_KNOWN_HOSTS', 'EVIDENCE_SSH_HOST', 'EVIDENCE_SSH_USER']) {
    if (!process.env[name]?.trim()) throw new Error('Private bridge storage is unavailable');
  }
  const folder = mkdtempSync(join(process.env.RUNNER_TEMP!, 'bridge-private-'));
  const key = join(folder, 'key'), hosts = join(folder, 'hosts'), batch = join(folder, 'batch');
  const source = join(folder, 'record.json'), readback = join(folder, 'readback.json');
  const remote = `/archive/ordinary/bridge-admission-${sha}-${run}-${attempt}.json`;
  const bytes = Buffer.from(JSON.stringify(record, null, 2) + '\n');
  try {
    writeFileSync(key, process.env.EVIDENCE_SSH_PRIVATE_KEY!.replaceAll('\r', '').trimEnd() + '\n', { mode: 0o600 });
    writeFileSync(hosts, process.env.EVIDENCE_SSH_KNOWN_HOSTS!.replaceAll('\r', ''), { mode: 0o600 });
    writeFileSync(source, bytes, { mode: 0o600 });
    writeFileSync(batch, `put ${source} ${remote}\nget ${remote} ${readback}\n`, { mode: 0o600 });
    let transportFailure: string | undefined;
    try {
      execFileSync('sftp', ['-b', batch, '-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
        '-o', 'StrictHostKeyChecking=yes', '-o', `UserKnownHostsFile=${hosts}`, '-o', 'ConnectTimeout=15',
        `${process.env.EVIDENCE_SSH_USER!.trim()}@${process.env.EVIDENCE_SSH_HOST!.trim()}`], { stdio: 'pipe', timeout: 60000 });
    } catch (error) {
      // Only a fixed diagnostic code may leave this credential-bearing transport.
      const stderr = String((error as { stderr?: unknown }).stderr || '');
      const category = /error in libcrypto|invalid format/i.test(stderr) ? 'key_format' :
        /Host key verification failed/i.test(stderr) ? 'host_key' :
        /Permission denied \(publickey/i.test(stderr) ? 'authentication' :
        /No such file|Permission denied|Failure/i.test(stderr) ? 'remote_path' :
        /timed out|refused|Could not resolve/i.test(stderr) ? 'network' : 'transfer';
      transportFailure = category;
    }
    if (transportFailure) throw new Error(`Private bridge transport: ${transportFailure}`);
    if (!bytes.equals(readFileSync(readback))) throw new Error('Private bridge readback differs');
  } finally { rmSync(folder, { recursive: true, force: true }); }
  if (existsSync(folder)) throw new Error('Temporary bridge storage credentials remain');
  return { path: remote, sha256: createHash('sha256').update(bytes).digest('hex'),
    state: 'archived_and_readback_verified', temporary_key_files_removed: true };
}
