import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Runtime identity is Actions only');
const output = process.argv[2];
if (!['native-output', 'web-output'].includes(output)) throw new Error('Unregistered runtime identity destination');
const checkout = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const expected = process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA;
if (checkout !== expected) throw new Error('Actual runtime checkout differs from target');
const inputs = ['tools/ci/validation-manifest.json', 'infra/ci/toolchain-lock.json', 'package-lock.json'];
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/identity.json`, JSON.stringify({ checkout_sha: checkout, target_sha: expected,
  source: 'github-actions', runner_environment: process.env.RUNNER_ENVIRONMENT, runner_os: process.env.RUNNER_OS,
  runner_image: process.env.ImageVersion, run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  node: process.version, input_digests: Object.fromEntries(inputs.map(file =>
    [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
  platform: process.env.IOS_VERSION ? `ios-${process.env.IOS_VERSION}` : process.env.ANDROID_API ? `android-api${process.env.ANDROID_API}` : 'web',
  scope: 'no-business-shell', readiness: 'not_evaluated',
}, null, 2) + '\n');
