import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { waitForReviewRecords } from './review-arrival.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
  throw new Error('Private review retrieval requires GitHub-hosted Actions');
}
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const contextBytes = readFileSync('verify-output/review-context.json');
const context = JSON.parse(contextBytes.toString());
if (context.target_sha !== sha || context.source_authenticated !== true || context.source !== 'github-actions') {
  throw new Error('Current authenticated review input context is required');
}
if (context.code?.actual_checks?.state !== 'passed' || context.visual?.actual_checks?.state !== 'passed') {
  throw new Error('Actual executor prerequisites must pass before current Codex review can finish');
}
const digest = createHash('sha256').update(contextBytes).digest('hex');
const temporary = process.env.RUNNER_TEMP!;
const key = join(temporary, 'review-read-key'), hosts = join(temporary, 'review-read-hosts');
const batch = join(temporary, 'review-read-batch');
mkdirSync('private-review', { recursive: true, mode: 0o700 });
try {
  for (const name of ['EVIDENCE_SSH_PRIVATE_KEY', 'EVIDENCE_SSH_KNOWN_HOSTS', 'EVIDENCE_SSH_HOST', 'EVIDENCE_SSH_USER']) {
    if (!process.env[name]?.trim()) throw new Error('Private review transport configuration is unavailable');
  }
  writeFileSync(key, process.env.EVIDENCE_SSH_PRIVATE_KEY!.replaceAll('\r', ''), { mode: 0o600 });
  writeFileSync(hosts, process.env.EVIDENCE_SSH_KNOWN_HOSTS!.replaceAll('\r', ''), { mode: 0o600 });
  const user = process.env.EVIDENCE_SSH_USER!.trim(), host = process.env.EVIDENCE_SSH_HOST!.trim();
  const result = await waitForReviewRecords({ directory: 'private-review', timeout_ms: 30 * 60000, poll_ms: 15000,
    refresh: async () => {
      for (const kind of ['code', 'visual']) {
        writeFileSync(batch, `get /archive/ordinary/review-${sha}-${kind}-${digest}.json private-review/${kind}.json\n`, { mode: 0o600 });
        execFileSync('sftp', ['-b', batch, '-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
          '-o', 'StrictHostKeyChecking=yes', '-o', `UserKnownHostsFile=${hosts}`, '-o', 'ConnectTimeout=15', `${user}@${host}`],
        { stdio: 'ignore', timeout: 35000 });
      }
    } });
  if (result.state !== 'available') throw new Error('Current Codex review records did not arrive before the deadline');
} finally {
  for (const file of [key, hosts, batch]) rmSync(file, { force: true });
}
if ([key, hosts, batch].some(file => existsSync(file))) throw new Error('Temporary review credentials remain');
