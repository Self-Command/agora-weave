import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

const normalized = bytes => {
  const text = bytes.toString('utf8');
  return Buffer.from(text).equals(bytes) && !bytes.includes(0) ? Buffer.from(text.replace(/\r\n/g, '\n')) : bytes;
};
const hash = bytes => createHash('sha256').update(normalized(bytes)).digest('hex');
const git = (root, args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...options });
function configuration(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'tools/dev/governance-sync-manifest.json'), 'utf8'));
  const files = new Set(manifest.files);
  const visit = directory => {
    if ((manifest.excluded_directories || []).includes(directory) || !existsSync(resolve(root, directory))) return;
    for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) files.add(file);
      else throw new Error('Governance paths must be regular files: ' + file);
    }
  };
  for (const directory of manifest.directories || []) visit(directory);
  for (const file of [...files, ...(manifest.deleted_files || [])]) {
    const child = relative(root, resolve(root, file));
    if (!child || child.startsWith('..') || isAbsolute(child)) throw new Error('Unsafe governance path: ' + file);
  }
  const sorted = [...files].filter(file => !(manifest.deleted_files || []).includes(file)).sort();
  for (const file of sorted) if (!existsSync(resolve(root, file))) throw new Error('Missing canonical file: ' + file);
  if (!readFileSync(resolve(root, '.specify/memory/constitution.md'), 'utf8').includes('**版本**: ' + manifest.minimum_constitution_version)) throw new Error('Constitution and synchronization version differ');
  const trees = git(root, ['worktree', 'list', '--porcelain']).split(/\r?\n\r?\n/).filter(Boolean).map(block => ({
    path: block.match(/^worktree (.+)$/m)?.[1].trim(), branch: block.match(/^branch refs\/heads\/(.+)$/m)?.[1].trim(),
  })).filter(tree => tree.path);
  for (const path of manifest.additional_workspaces || []) if (existsSync(path) && !trees.some(tree => resolve(tree.path) === resolve(path))) trees.push({ path, replica: true });
  const manages = file => !(manifest.excluded_directories || []).some(directory => file === directory || file.startsWith(directory + '/')) &&
    (manifest.files.includes(file) || (manifest.deleted_files || []).includes(file) ||
      (manifest.directories || []).some(directory => file.startsWith(directory + '/')));
  return { manifest, files: sorted, trees, manages };
}
const branches = root => git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads']).trim().split(/\r?\n/).filter(Boolean);
function entries(root, ref) {
  return new Map(git(root, ['ls-tree', '-r', '-z', ref]).split('\0').filter(Boolean).map(line => {
    const [metadata, file] = line.split('\t'); return [file, metadata.split(' ')[2]];
  }));
}
export function verify(source) {
  const root = resolve(source), config = configuration(root), failures = [];
  const expected = new Map(config.files.map(file => [file, hash(readFileSync(resolve(root, file)))]));
  const blobCache = new Map();
  for (const tree of config.trees) {
    for (const [file, digest] of expected) if (!existsSync(resolve(tree.path, file)) || hash(readFileSync(resolve(tree.path, file))) !== digest) failures.push(`${tree.path}: ${file}`);
    for (const file of config.manifest.deleted_files || []) if (existsSync(resolve(tree.path, file))) failures.push(`${tree.path}: deleted file remains ${file}`);
    for (const file of git(tree.path, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0').filter(Boolean)) {
      if (config.manages(file) && !expected.has(file) && existsSync(resolve(tree.path, file))) failures.push(`${tree.path}: obsolete ${file}`);
    }
  }
  const refs = branches(root);
  for (const branch of refs) {
    const actual = entries(root, branch);
    for (const [file, digest] of expected) {
      const blob = actual.get(file);
      if (blob && !blobCache.has(blob)) blobCache.set(blob, hash(git(root, ['cat-file', 'blob', blob], { encoding: null })));
      if (!blob || blobCache.get(blob) !== digest) failures.push(`${branch}: ${file}`);
    }
    for (const file of config.manifest.deleted_files || []) if (actual.has(file)) failures.push(`${branch}: deleted file remains ${file}`);
    for (const file of actual.keys()) if (config.manages(file) && !expected.has(file)) failures.push(`${branch}: obsolete ${file}`);
  }
  if (failures.length) throw new Error(`Governance drift (${failures.length})\n${failures.slice(0, 20).join('\n')}`);
  const report = { state: 'passed', policy: config.manifest.current_policy, files: config.files.length, workspaces: config.trees.length, local_branches: refs.length };
  process.stdout.write(JSON.stringify(report) + '\n'); return report;
}
export function synchronize(source, publish = false) {
  const root = resolve(source), config = configuration(root);
  const policy = JSON.parse(readFileSync(resolve(root, 'infra/development/policy.json'), 'utf8'));
  const backup = resolve(policy.runtime_root, 'backups', 'governance-' + Date.now());
  mkdirSync(backup, { recursive: true });
  const canonical = new Map(config.files.map(file => [file, normalized(readFileSync(resolve(root, file)))]));
  const obsolete = new Set(config.manifest.deleted_files || []);
  for (const branch of branches(root)) for (const file of entries(root, branch).keys()) if (config.manages(file) && !canonical.has(file)) obsolete.add(file);
  for (const tree of config.trees) for (const file of git(tree.path, ['ls-files','-z','--cached','--others','--exclude-standard']).split('\0').filter(Boolean)) {
    if (config.manages(file) && !canonical.has(file)) obsolete.add(file);
  }
  const managed = [...config.files, ...obsolete];
  const env = { ...process.env, AGORAWEAVE_GOVERNANCE_SYNC: '1' };
  function copyTo(tree) {
    for (const file of managed) {
      const target = resolve(tree.path, file), bytes = canonical.get(file);
      if (existsSync(target) && bytes && hash(readFileSync(target)) === hash(bytes)) continue;
      if (existsSync(target)) {
        const saved = resolve(backup, tree.path.replace(/[:\\/ ]/g, '_'), file);
        mkdirSync(dirname(saved), { recursive: true }); writeFileSync(saved, readFileSync(target));
      }
      if (bytes) { mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes); }
      else rmSync(target, { force: true });
    }
  }
  const checkedOut = new Set();
  for (const tree of config.trees) {
    copyTo(tree);
    if (!tree.branch || tree.replica) continue;
    checkedOut.add(tree.branch);
    if (git(tree.path, ['status', '--porcelain', '--', ...managed]).trim()) {
      const tracked = entries(tree.path, 'HEAD');
      const paths = managed.filter(file => existsSync(resolve(tree.path,file)) || tracked.has(file));
      git(tree.path, ['add', '-A', '--', ...paths], { env });
      git(tree.path, ['-c', 'core.autocrlf=input', 'commit', '--only', '-m', 'chore(governance): synchronize approved current specification', '--', ...paths], { env });
    }
  }
  const blobs = new Map([...canonical].map(([file, bytes]) => [file, git(root, ['hash-object', '-w', '--stdin'], { input: bytes }).trim()]));
  function overlay(parent) {
    const index = resolve(backup, 'overlay.index'); rmSync(index, { force: true });
    const isolated = { ...env, GIT_INDEX_FILE: index };
    try {
      git(root, ['read-tree', parent], { env: isolated });
      const lines = [...blobs].map(([file, blob]) => `100644 ${blob}\t${file}\0`);
      for (const file of obsolete) lines.push(`0 ${'0'.repeat(40)}\t${file}\0`);
      git(root, ['update-index', '-z', '--index-info'], { env: isolated, input: lines.join('') });
      const tree = git(root, ['write-tree'], { env: isolated }).trim();
      if (tree === git(root, ['rev-parse', `${parent}^{tree}`]).trim()) return parent;
      return git(root, ['commit-tree', tree, '-p', parent], { env, input: 'chore(governance): synchronize approved current specification\n' }).trim();
    } finally { rmSync(index, { force: true }); }
  }
  for (const branch of branches(root)) {
    if (checkedOut.has(branch)) continue;
    const old = git(root, ['rev-parse', branch]).trim(), next = overlay(old);
    if (next !== old) git(root, ['update-ref', `refs/heads/${branch}`, next, old]);
  }
  if (publish) {
    git(root, ['fetch', 'origin']);
    const remote = git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin']).trim().split(/\r?\n/).filter(ref => ref && ref !== 'origin/HEAD' && ref !== 'origin');
    for (const ref of remote) {
      const name = ref.slice('origin/'.length), old = git(root, ['rev-parse', ref]).trim();
      const next = overlay(old);
      if (next !== old) git(root, ['push', 'origin', `${next}:refs/heads/${name}`]);
    }
  }
  const report = verify(root);
  git(root, ['config', 'agoraweave.governanceSourceRoot', root.replaceAll('\\','/')]);
  writeFileSync(resolve(backup, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(`Governance backups: ${backup}\n`); return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.includes('--sync')) synchronize(process.argv[2] || process.cwd(), process.argv.includes('--publish'));
    else verify(process.argv[2] || process.cwd());
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
