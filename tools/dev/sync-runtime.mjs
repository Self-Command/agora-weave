import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import process from 'node:process';

const [sourceArgument, destinationArgument] = process.argv.slice(2);
if (!sourceArgument || !destinationArgument) throw new Error('Source and runtime workspace are required');
const source = resolve(sourceArgument), destination = resolve(destinationArgument);
const policy = JSON.parse(readFileSync(resolve(source, 'infra/development/policy.json'), 'utf8'));
if (destination !== resolve(policy.runtime_root, 'workspace') || destination === source) throw new Error('Unexpected runtime workspace');
const git = (args, cwd = source) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const head = git(['rev-parse', 'HEAD']);
mkdirSync(dirname(destination), { recursive: true });
if (!existsSync(resolve(destination, '.git'))) git(['clone', '--shared', '--no-hardlinks', '--quiet', source, destination]);
const marker = resolve(destination, '.runtime-sync.json');
const previous = existsSync(marker) ? JSON.parse(readFileSync(marker, 'utf8')) : undefined;
const commonDirectory = directory => resolve(git(['rev-parse', '--path-format=absolute', '--git-common-dir'], directory));
if (previous && previous.source !== source && commonDirectory(previous.source) !== commonDirectory(source)) {
  throw new Error('Runtime belongs to another repository');
}
if (!previous && git(['status', '--porcelain'], destination)) throw new Error('Existing runtime has unowned changes');
// This runtime is disposable; preserve source HEAD identity while copying its actual working files.
if (git(['rev-parse', 'HEAD'], destination) !== head) {
  git(['fetch', '--quiet', source, head], destination);
  git(['reset', '--mixed', '--quiet', head], destination);
}
const protectedPath = file => file.replaceAll('\\', '/').split('/').some(part =>
  ['.git', '.agoraweave', 'node_modules', '.runtime-sync.json'].includes(part));
const files = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: source, encoding: 'utf8' })
  .split('\0').filter(Boolean))].filter(file => !protectedPath(file) && existsSync(resolve(source, file))).sort();
const contained = file => {
  const path = resolve(destination, file), child = relative(destination, path);
  if (!child || child.startsWith('..') || isAbsolute(child)) throw new Error('Unsafe runtime path');
  let parent = path;
  while (parent !== destination) {
    if (existsSync(parent) && lstatSync(parent).isSymbolicLink()) throw new Error('Runtime path traverses a symbolic link: ' + file);
    parent = dirname(parent);
  }
  return path;
};
const current = new Set(files);
let copied = 0, removed = 0;
for (const file of previous?.files || git(['ls-files'], destination).split('\n').filter(Boolean)) {
  // Removed gitlinks can be directories; contained() checks the disposable workspace boundary.
  if (protectedPath(file)) continue;
  if (!current.has(file)) {
    const target = contained(file);
    if (existsSync(target)) { rmSync(target, { force: true, recursive: true }); removed++; }
  }
}
for (const file of files) {
  const original = resolve(source, file), target = contained(file);
  if (lstatSync(original).isDirectory() && git(['ls-files', '--stage', '--', file]).startsWith('160000 ')) {
    if (existsSync(resolve(original, '.git'))) {
      if (!existsSync(resolve(target, '.git'))) git(['clone', '--shared', '--no-hardlinks', '--quiet', original, target]);
      git(['checkout', '--detach', '--quiet', git(['rev-parse', 'HEAD'], original)], target);
    } else mkdirSync(target, { recursive: true });
    continue;
  }
  if (!lstatSync(original).isFile()) throw new Error('Runtime sync accepts regular source files or Git submodules only: ' + file);
  // Compare actual bytes: size/mtime alone miss equal-length edits with preserved timestamps.
  if (existsSync(target) && lstatSync(target).isFile() && readFileSync(original).equals(readFileSync(target))) continue;
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(original, target);
  copied++;
}
if (!previous || previous.source !== source || previous.source_head !== head ||
  JSON.stringify(previous.files) !== JSON.stringify(files) || copied || removed) {
  writeFileSync(marker, JSON.stringify({ source, source_head: head, files, synced_at: new Date().toISOString() }, null, 2) + '\n');
}
const exclude = resolve(destination, '.git/info/exclude');
if (!readFileSync(exclude, 'utf8').includes('/.runtime-sync.json')) writeFileSync(exclude, readFileSync(exclude, 'utf8') + '\n/.runtime-sync.json\n');
process.stdout.write(`Synced ${files.length} source files to ${destination}; copied=${copied}, removed=${removed}\n`);
