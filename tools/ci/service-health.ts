import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { compose, requireCoreEnvironment } from './core-database.ts';
import { executionContext, executionDirectory } from './execution-context.ts';
import { healthyServiceInventory } from './local-services.ts';

requireCoreEnvironment();
const identity = executionContext();
const directory = executionDirectory('service', identity);
mkdirSync(directory, { recursive: true });
const capture = (file: string, args: string[], input?: Buffer) => {
  const bytes = compose(args, input?.toString());
  writeFileSync(`${directory}/${file}`, bytes);
};
capture('database-health.txt', ['exec', '-T', 'db', 'pg_isready', '-U', 'postgres', '-h', 'localhost']);
capture('auth-health.json', ['exec', '-T', 'auth', 'wget', '-q', '-O', '-', 'http://localhost:9999/health']);
capture('storage-health.json', ['exec', '-T', 'storage', 'wget', '-q', '-O', '-', 'http://storage:5000/status']);
for (const file of ['schema-seed-probe.txt', 'schema-seed-probe-repeat.txt']) {
  capture(file, ['exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], readFileSync('infra/ci/bootstrap-probe.sql'));
}
capture('service-health.json', ['ps', '--format', 'json']);
const containers = readFileSync(`${directory}/service-health.json`, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
if (!healthyServiceInventory(containers)) throw new Error('Service inventory is incomplete, unhealthy or externally published');
writeFileSync(`${directory}/health.json`, JSON.stringify({ ...identity, state: 'passed', checked_at: new Date().toISOString(),
  probes: ['database', 'auth', 'storage', 'schema-seed', 'schema-seed-repeat'], task_complete: false }, null, 2) + '\n');
