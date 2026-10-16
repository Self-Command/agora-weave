import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { discoverApprovedTargets, inventoryNodeTestFiles } from './run-check-set.ts';
import { executionContext, executionDirectory } from './execution-context.ts';

const identity = executionContext();
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const files = inventoryNodeTestFiles();
const coreTargets = manifest.core_targets || [];
const profile = 'business-increment';
const result = discoverApprovedTargets({ profile, approved: [...manifest.engineering_targets, ...coreTargets],
  scripts: root.scripts, available_files: files });
const directory = executionDirectory('check', identity);
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/discovery.json`, JSON.stringify({ ...identity, ...result, profile,
  check_set_digest: createHash('sha256').update(manifestBytes).digest('hex'),
  discovered_files: files, readiness: 'not_evaluated',
}, null, 2) + '\n');
if (result.state !== 'discovered') throw new Error(`Discovery blocked: ${JSON.stringify(result.reason_codes)}`);
