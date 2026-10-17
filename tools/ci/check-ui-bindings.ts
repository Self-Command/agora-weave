import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

type Approval = { state: string; by?: string; date?: string; reference?: string; design_version?: string; design_digest?: string };
type Review = { platform: string; design_version: string; design_digest: string; states: string[]; themes: string[]; font_scale: number;
  viewport: string; safe_area: string; entry: string; source_revision: string; screenshots: string[]; interactions: string[]; result: string };
export type PageBinding = {
  id: string; kind: 'page' | 'component'; surface: string; title: string; states: string[]; themes: string[]; platforms: string[];
  design_source: string; design_version: string; design_files: string[]; design_digest: string; approval: Approval;
  production_entry: string; component_paths: string[]; navigation: string; implementation: string; reviews: Review[];
  retirement?: { by: string; date: string; reference: string; removed_paths: string[] };
};
export type PageRegistry = { schema_version: number; entries: PageBinding[] };
export const designDigest = (root: string, files: string[]) => createHash('sha256').update(
  files.map(file => file + '\0' + readFileSync(resolve(root, file)).toString('utf8').replaceAll('\r\n', '\n')).join('\0')).digest('hex');
export const productionUiPath = (path: string) => /^apps\/[^/]+\/.*\.(tsx|jsx|css)$/.test(path) || /^packages\/design\//.test(path);
const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(hasText);

export function checkUiBindings(registry: PageRegistry, root: string, options: {
  mode?: 'structure' | 'changes' | 'stage'; paths?: string[]; ids?: string[]; sourceRevision?: string;
} = {}) {
  const errors: string[] = [], mode = options.mode || 'structure', ids = new Set<string>();
  const safe = (file: string) => {
    const child = relative(root, resolve(root, file));
    return !!child && !child.startsWith('..') && !isAbsolute(child);
  };
  if (registry.schema_version !== 1 || !Array.isArray(registry.entries)) return ['Invalid page registry'];
  for (const entry of registry.entries) {
    const fail = (message: string) => errors.push(`${entry.id}: ${message}`);
    if (!hasText(entry.id) || ids.has(entry.id)) fail('unique id required'); ids.add(entry.id);
    for (const field of ['title', 'surface', 'design_source', 'design_version', 'production_entry', 'navigation', 'implementation'] as const) {
      if (!hasText(entry[field])) fail(`${field} required`);
    }
    if (!['page', 'component'].includes(entry.kind)) fail('page/component kind required');
    for (const field of ['states', 'themes', 'platforms', 'component_paths'] as const) if (!strings(entry[field])) fail(`${field} required`);
    for (const file of [entry.production_entry, ...(entry.component_paths || []), ...(entry.design_files || [])]) if (!safe(file)) fail(`unsafe path ${file}`);
    if (entry.retirement) {
      if (!['user', 'authorized-human'].includes(entry.retirement.by) || !hasText(entry.retirement.date) ||
        !hasText(entry.retirement.reference) || !Array.isArray(entry.retirement.removed_paths) || !entry.retirement.removed_paths.every(hasText)) fail('explicit human retirement decision required');
      for (const file of entry.retirement.removed_paths || []) if (!safe(file)) fail(`unsafe retired path ${file}`);
    }
    for (const file of entry.design_files || []) if (safe(file) && !existsSync(resolve(root, file))) fail(`missing design path ${file}`);
    if (!/^[a-f0-9]{64}$/.test(entry.design_digest || '')) fail('design digest required');
    if (entry.design_files?.length && entry.design_files.every(file => safe(file) && existsSync(resolve(root, file))) && designDigest(root, entry.design_files) !== entry.design_digest) fail('design contents changed; refresh version and obtain matching approval');
    const approval = entry.approval;
    if (!approval || !['pending', 'approved', 'approved-from-user-directive'].includes(approval.state)) fail('approval state required');
    if (approval && approval.state !== 'pending') {
      if (!['user', 'authorized-human'].includes(approval.by || '') || !hasText(approval.date) || !hasText(approval.reference)) fail('human approval source/date required');
      if (approval.design_version !== entry.design_version || approval.design_digest !== entry.design_digest) fail('approval must match this design version and contents');
    }
  }
  const paths = (options.paths || []).map(path => path.replaceAll('\\', '/')).filter(productionUiPath);
  if (mode === 'changes' && !options.paths) errors.push('Changes check requires collected paths from a valid base or explicit target list');
  const selected = mode === 'stage' ? registry.entries.filter(entry => options.ids?.includes(entry.id)) :
    registry.entries.filter(entry => paths.some(path => entry.component_paths?.includes(path) || entry.production_entry === path || entry.retirement?.removed_paths.includes(path)));
  if (mode === 'stage' && (!options.ids?.length || options.ids.some(id => !ids.has(id)))) errors.push('Stage check requires explicit existing page/component ids');
  if (mode === 'stage' && !/^[a-f0-9]{40}$/.test(options.sourceRevision || '')) errors.push('Stage check requires explicit expected implementation source revision');
  if (mode === 'changes') for (const path of paths) {
    if (!selected.some(entry => entry.component_paths.includes(path) || entry.production_entry === path || entry.retirement?.removed_paths.includes(path))) errors.push(`${path}: missing page/component binding`);
  }
  if (mode !== 'structure') for (const entry of selected) {
    if (entry.retirement) {
      if (mode === 'stage') errors.push(`${entry.id}: retired presentation cannot complete a page stage`);
      for (const file of entry.retirement.removed_paths) if (existsSync(resolve(root, file))) errors.push(`${entry.id}: retired presentation still exists ${file}`);
      const source = existsSync(resolve(root, entry.production_entry)) ? readFileSync(resolve(root, entry.production_entry), 'utf8') : '';
      if (!/^\s*export default function \w+\(\)\s*\{\s*return null;?\s*\}\s*$/.test(source)) errors.push(`${entry.id}: retirement permits only an empty framework route, not replacement UI`);
      if (entry.component_paths.some(file => file !== entry.production_entry)) errors.push(`${entry.id}: retired presentation must not bind replacement components`);
      continue;
    }
    for (const file of [entry.production_entry, ...entry.component_paths]) if (!existsSync(resolve(root, file))) errors.push(`${entry.id}: missing selected production source ${file}`);
    if (entry.approval?.state === 'pending') errors.push(`${entry.id}: production UI needs matching human design approval`);
    if (mode !== 'stage') continue;
    for (const platform of entry.platforms) {
      const reviews = entry.reviews.filter(review => review.platform === platform && review.result === 'passed' &&
        review.design_version === entry.design_version && review.design_digest === entry.design_digest &&
        review.source_revision === options.sourceRevision && review.font_scale === 1 && hasText(review.viewport) && hasText(review.safe_area) &&
        hasText(review.entry) && hasText(review.source_revision) && strings(review.screenshots) && strings(review.interactions));
      if (!reviews.length || entry.states.some(state => entry.themes.some(theme =>
        !reviews.some(review => review.states.includes(state) && review.themes.includes(theme))))) errors.push(`${entry.id}: missing actual ${platform} whole-page visual/interaction review`);
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), value = (name: string) => args[args.indexOf(name) + 1];
  const root = process.cwd(), mode = args.includes('--mode') ? value('--mode') : 'structure';
  if (!['structure', 'changes', 'stage'].includes(mode)) throw new Error('Unknown UI binding check mode');
  let paths: string[] | undefined;
  if (args.includes('--base')) {
    const base = execFileSync('git', ['rev-parse', '--verify', '--end-of-options', value('--base') + '^{commit}'], { encoding: 'utf8' }).trim();
    paths = [...new Set([...execFileSync('git', ['diff', '--name-only', '-z', base, '--'], { encoding: 'utf8' }).split('\0'),
      ...execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0')])].filter(Boolean);
  } else if (args.includes('--paths') && hasText(value('--paths'))) paths = value('--paths').split(',').filter(Boolean);
  const registry = JSON.parse(readFileSync('docs/design/page-registry.json', 'utf8')) as PageRegistry;
  let sourceRevision = args.includes('--source-revision') ? value('--source-revision') : undefined;
  if (mode === 'stage' && sourceRevision) {
    sourceRevision = execFileSync('git', ['rev-parse', '--verify', '--end-of-options', sourceRevision + '^{commit}'], { encoding: 'utf8' }).trim();
    const selectedIds = args.includes('--ids') ? value('--ids').split(',') : [];
    const sourcePaths = [...new Set(registry.entries.filter(entry => selectedIds.includes(entry.id)).flatMap(entry => [entry.production_entry, ...entry.component_paths]))];
    if (sourcePaths.length) {
      execFileSync('git', ['diff', '--quiet', sourceRevision, '--', ...sourcePaths], { stdio: 'pipe' });
      if (execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', ...sourcePaths], { encoding: 'utf8' }).trim()) throw new Error('Selected production source has untracked files; old screenshots cannot verify them');
    }
  }
  const errors = checkUiBindings(registry, root, { mode: mode as 'structure' | 'changes' | 'stage', paths, ids: args.includes('--ids') ? value('--ids').split(',') : [],
    sourceRevision });
  if (errors.length) throw new Error(errors.join('\n'));
  process.stdout.write(JSON.stringify({ state: 'passed', mode, checked_ui_paths: paths?.filter(productionUiPath).length || 0,
    scope: 'binding-records-only', human_approval_verified: false, visual_quality_verified: false }) + '\n');
}
