import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { activateConfiguration } from '../../tests/fixtures/core/configuration.ts';
import { rows, sql } from '../../tests/fixtures/core/runtime.ts';
import { requireCoreEnvironment } from '../ci/core-database.ts';

// Reuse existing isolated configuration fixtures; never reset, seed or migrate a database.
const { values } = parseArgs({ options: { 'base-url': { type: 'string' }, network: { type: 'string' } } });
if (!values['base-url'] || !values.network) throw new Error('Provide the actual isolated core URL and its Docker network');
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
if (environment !== 'dev' && environment !== 'test') throw new Error('An isolated dev/test environment is required');
requireCoreEnvironment();
const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";
const previous = rows(`SELECT active_ptr FROM core.config_activation WHERE environment=${literal(environment)}`)[0]?.active_ptr;
try {
  activateConfiguration(environment, 'api-contract-' + randomUUID());
  const result = spawnSync(process.execPath, ['tools/api/contracts.mjs', 'verify', '--surface', 'app',
    '--base-url', values['base-url'], '--network', values.network, '--operations', 'listLatestPosts',
    '--filter', "STATUS='200'", '--anonymous', '--client-release', 'fixture-v1', '--environment', environment],
  { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exitCode = result.status === 0 ? 0 : 1;
} finally {
  if (typeof previous === 'string') sql(`UPDATE core.config_activation SET active_ptr=${literal(previous)} WHERE environment=${literal(environment)};`);
  else sql(`DELETE FROM core.config_activation WHERE environment=${literal(environment)};`);
}
