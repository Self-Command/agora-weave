import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { arch, platform, release, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const git = (args: string[], options = {}) => execFileSync('git', args,
  { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options });

export function localHandoffAllowsActor(handoff: Record<string, any>, actor: string): boolean {
  const feature = 'specs/001-agoraweave-v1';
  const sources = { constitution: '.specify/memory/constitution.md', spec: `${feature}/spec.md`,
    plan: `${feature}/plan.md`, tasks: `${feature}/tasks.md` };
  return handoff.schema_version === 1 && ['ready', 'executing'].includes(handoff.status) &&
    handoff.executor === (handoff.status === 'ready' ? 'speckit' : 'superpowers') &&
    handoff.artifact_owner === actor && handoff.feature_directory === feature &&
    !handoff.review_only_agents?.includes(actor) &&
    Object.entries(sources).every(([key, path]) => handoff.source_of_truth?.[key] === path);
}

/** A local tree preserves exact worktree bytes without moving HEAD or the caller's index. */
export function snapshotWorkspace() {
  if (process.env.GIT_INDEX_FILE) throw new Error('Local snapshots require the actual checkout index boundary');
  const base_sha = git(['rev-parse', 'HEAD']).trim();
  const paths = git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0').filter(Boolean);
  if (paths.some(path => {
    if (!/(^|\/)(\.env($|\.)|[^/]*\.(pem|key|p12)$)/i.test(path)) return false;
    if (/(^|\/)\.env\.example$/.test(path)) {
      try { return hash(readFileSync(path)) !== hash(execFileSync('git', ['show', `${base_sha}:${path}`], { stdio: ['ignore', 'pipe', 'pipe'] })); }
      catch { return true; }
    }
    return true;
  })) {
    throw new Error('Secret-shaped input cannot enter a reproducible local snapshot');
  }
  const temporary = mkdtempSync(join(tmpdir(), 'aw-local-index-'));
  try {
    const env = { ...process.env, GIT_INDEX_FILE: join(temporary, 'index') };
    git(['read-tree', base_sha], { env });
    const original = new Map(git(['ls-tree', '-r', '-z', base_sha]).split('\0').filter(Boolean).map(entry => {
      const split = entry.indexOf('\t'); return [entry.slice(split + 1), entry.slice(0, split).split(' ')];
    }));
    const blobs = new Map<string, Buffer>();
    const entries = paths.map(path => {
      const previous = original.get(path);
      if (previous?.[0] === '160000') {
        let object = previous[2];
        if (existsSync(join(path, '.git'))) object = git(['-C', path, 'rev-parse', 'HEAD']).trim();
        return `160000 ${object}\t${path}\0`;
      }
      if (!existsSync(path)) return `0 ${'0'.repeat(40)}\t${path}\0`;
      const stat = lstatSync(path);
      if (!stat.isFile() && !stat.isSymbolicLink()) throw new Error('Unsupported directory in local snapshot');
      const bytes = stat.isSymbolicLink() ? Buffer.from(readlinkSync(path)) : readFileSync(path);
      const object = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      blobs.set(object, bytes);
      const mode = stat.isSymbolicLink() ? '120000' : previous?.[0] === '100755' ? '100755' : '100644';
      return `${mode} ${object}\t${path}\0`;
    });
    const availability = git(['cat-file', '--batch-check'], { input: [...blobs.keys()].join('\n') + '\n' });
    for (const line of availability.trim().split('\n')) {
      if (line.endsWith(' missing')) git(['hash-object', '-w', '--stdin'], { input: blobs.get(line.split(' ')[0]) });
    }
    git(['update-index', '-z', '--index-info'], { env, input: entries.join('') });
    const tree = git(['write-tree'], { env }).trim();
    const diff_sha256 = hash(git(['diff', '--raw', '--no-abbrev', '-z', '--no-ext-diff', base_sha, tree]));
    const workspace = { base_sha, tree, diff_sha256 };
    const directory = '.superpowers/local/snapshots';
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, `${tree}.json`), JSON.stringify(workspace, null, 2) + '\n');
    return workspace;
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}

function localTools() {
  const lock = JSON.parse(readFileSync('infra/ci/toolchain-lock.json', 'utf8'));
  const engines = JSON.parse(readFileSync('package.json', 'utf8')).engines;
  const npmCli = [join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')].find(path => existsSync(path));
  if (!npmCli) throw new Error('Fixed npm runtime is unavailable');
  const npm = execFileSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8' }).trim();
  if (process.version !== lock.node || npm !== lock.npm || engines?.node !== process.version.slice(1) || engines?.npm !== npm ||
      lock.lock_sha256 !== undefined && (!existsSync('package-lock.json') || hash(readFileSync('package-lock.json')) !== lock.lock_sha256)) {
    throw new Error('Local toolchain differs from the fixed runtime and dependency lock');
  }
  return { node: process.version, npm, npm_cli: npmCli, platform: platform(), os_release: release(), architecture: arch(),
    node_sha256: hash(readFileSync(process.execPath)), toolchain_digest: hash(readFileSync('infra/ci/toolchain-lock.json')) };
}

/** Explicit local provenance never acquires an Actions run, attempt, artifact or readiness claim. */
export function executionContext(): Record<string, any> {
  const selected = process.env.AGORAWEAVE_EXECUTION_SOURCE;
  const sha = git(['rev-parse', 'HEAD']).trim();
  if (selected === 'local') {
    if (Object.keys(process.env).some(key => /^(GITHUB_|RUNNER_)/.test(key) && process.env[key])) {
      throw new Error('Local execution cannot mix runner identity');
    }
    const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || 'engineering';
    if (!['engineering', 'dev', 'test'].includes(environment)) throw new Error('Local execution requires an isolated nonproduction environment');
    return { source: 'local', checkout_sha: sha, target_sha: sha, environment,
      tool_environment: localTools(), workspace: snapshotWorkspace(), readiness: 'not_evaluated' };
  }
  if (selected !== undefined && selected !== '' && selected !== 'github-actions' ||
      process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
    throw new Error('Execution requires explicit local mode or GitHub-hosted Actions');
  }
  return { source: 'github-actions', checkout_sha: sha, target_sha: sha, run_id: process.env.GITHUB_RUN_ID,
    attempt: Number(process.env.GITHUB_RUN_ATTEMPT), runner_environment: process.env.RUNNER_ENVIRONMENT, readiness: 'not_evaluated' };
}

export function executionDirectory(kind: string, context: Record<string, any>): string {
  return context.source === 'local' ? `.superpowers/local/${context.environment}/${kind}-output` : `${kind}-output`;
}
