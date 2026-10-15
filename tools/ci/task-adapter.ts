export function deriveTaskAdapter(tasks: string) {
  const canonical = tasks.split(/\r?\n/).map(line => ({ line, match: line.match(/^- \[([ xX])\] (T\d{3})\b/) }))
    .filter(item => item.match !== null);
  const ids = canonical.map(item => item.match![2]);
  if (!ids.length || new Set(ids).size !== ids.length) return { state: 'blocked', mapping: [], adapter: '' };
  const pending = canonical.filter(item => item.match![1] === ' ');
  if (!pending.length) return { state: 'empty', mapping: [], adapter: '' };
  const mapping = pending.map((item, index) => ({ id: item.match![2], task: index + 1 }));
  const context = ['.specify/memory/constitution.md', 'specs/001-agoraweave-v1/spec.md',
    'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/tasks.md'];
  const adapter = '# Disposable native tool compatibility probe\n\nCanonical inputs: ' + context.join(', ') +
    '\nAll project execution is GitHub-hosted Actions only. This synthetic probe completes no canonical task.\n\n' +
    pending.map((item, index) => `### Task ${index + 1}: ${mapping[index].id}\n\n${item.line}\n\n` +
      'Expected: current same-SHA Actions evidence; missing evidence refuses completion.\n' +
      'Interface checks: actual reports, digests and applicable contract.\n' +
      'Overall regression: every activated required target.\n').join('\n');
  return { state: 'mapped', mapping, adapter };
}
