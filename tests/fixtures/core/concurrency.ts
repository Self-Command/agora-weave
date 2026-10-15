import { spawn } from 'node:child_process';
import { requireCoreEnvironment } from '../../../tools/ci/core-database.ts';
import { environment, token } from './runtime.ts';

const base = () => {
  requireCoreEnvironment();
  return ['compose', '--project-directory', 'supabase/upstream/docker', '--env-file', `${process.env.RUNNER_TEMP}/agoraweave-ci.env`,
    '-f', 'supabase/upstream/docker/docker-compose.yml', '-f', 'infra/ci/compose.yml', '-f', `${process.env.RUNNER_TEMP}/agoraweave-images.json`];
};
export function asynchronousCompose(args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', [...base(), ...args], { stdio: ['pipe', 'pipe', 'pipe'], timeout: 20000 });
    let output = '', error = '';
    child.stdout.setEncoding('utf8').on('data', value => { output += value; });
    child.stderr.setEncoding('utf8').on('data', value => { error += value; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(`Isolated command failed (${code}): ${error.slice(0, 1024)}`)));
    child.stdin.end(input);
  });
}
export async function readConcurrently(path: string, user: number) {
  if (!/^\/posts\/[0-9a-f-]{36}$/.test(path)) throw new Error('Unregistered concurrency target');
  const env = environment();
  const config = [`url = ${JSON.stringify(`http://api-gw:8000/functions/v1/core/api/v1${path}`)}`,
    'silent', 'show-error', 'max-time = 15', 'write-out = "\\n%{http_code}"',
    `header = ${JSON.stringify(`apikey: ${env.ANON_KEY}`)}`, `header = ${JSON.stringify(`Authorization: Bearer ${token(user)}`)}`];
  const raw = await asynchronousCompose(['exec', '-T', 'db', 'curl', '--config', '-'], config.join('\n') + '\n');
  const split = raw.lastIndexOf('\n');
  return { status: Number(raw.slice(split + 1)), body: raw.slice(0, split) };
}

/** Keep a real transaction open at an explicit SQL barrier, then commit on demand. */
export async function heldTransaction(statement: string) {
  const child = spawn('docker', [...base(), 'exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1'], { stdio: ['pipe', 'pipe', 'pipe'], timeout: 20000 });
  let output = '', error = '';
  const complete = new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`Held SQL failed (${code}): ${error.slice(0, 1024)}`)));
  });
  // Install rejection handling before waiting for the barrier to avoid an unhandled child failure.
  void complete.catch(() => {});
  child.stderr.setEncoding('utf8').on('data', value => { error += value; });
  const ready = new Promise<void>((resolve, reject) => {
    child.stdout.setEncoding('utf8').on('data', value => { output += value; if (output.includes('fixture_transaction_ready')) resolve(); });
    child.on('error', reject);
    child.on('close', code => { if (!output.includes('fixture_transaction_ready')) reject(new Error(`SQL barrier unavailable (${code}): ${error.slice(0, 1024)}`)); });
  });
  child.stdin.write(`BEGIN; ${statement}; SELECT 'fixture_transaction_ready';\n`);
  await ready;
  return { commit: async () => { child.stdin.end('COMMIT;\n\\q\n'); await complete; } };
}
