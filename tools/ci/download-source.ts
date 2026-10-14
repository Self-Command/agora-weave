import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { collectEvidence } from './collect-evidence.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Source download requires GitHub-hosted Actions');
const [name, destination] = process.argv.slice(2);
if (!['verify-output', 'review-output', 'private-receipts'].includes(destination) || !/^(verify-executor-outcomes|codex-record-validation|private-source-receipts)-\d+-\d+$/.test(name)) throw new Error('Unregistered original source destination');
const repository = process.env.GITHUB_REPOSITORY!;
const runId = process.env.SOURCE_RUN_ID || process.env.GITHUB_RUN_ID!;
const sha = process.env.SOURCE_SHA || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA!;
const response = await fetch(`https://api.github.com/repos/${repository}/actions/runs/${runId}`, { headers: {
  Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10',
}, redirect: 'error', signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error('Source run unavailable');
const run = await response.json() as Record<string, any>;
const source = await collectEvidence({ repository, token: process.env.GH_TOKEN!, run_id: runId,
  expected_sha: sha, expected_attempt: Number(run.run_attempt), workflow_path: run.path, artifact_name: name });
if (source.state !== 'verified_source' || !source.archive) throw new Error('Source artifact authentication failed');
mkdirSync('authenticated-downloads', { recursive: true });
const archivePath = `authenticated-downloads/${source.artifact_id}.zip`;
const indexPath = `authenticated-downloads/${source.artifact_id}.json`;
writeFileSync(archivePath, source.archive);
execFileSync('python3', ['tools/ci/index-archive.py', archivePath, indexPath, destination]);
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
writeFileSync(`authenticated-downloads/${source.artifact_id}-receipt.json`, JSON.stringify({ ...source, archive: undefined,
  raw_files: index }, null, 2) + '\n');
