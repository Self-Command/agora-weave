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
  const adapter = '# Disposable Spec Kit execution adapter\n\nCanonical inputs: ' + context.join(', ') +
    '\nConstitution 4.0.0 and ED-21 govern: real local TDD feedback, independent Actions checkpoints and formal acceptance. Never fabricate runner identity. Canonical full task completion requires its applicable evidence.\n\n' +
    pending.map((item, index) => `### Task ${index + 1}: ${mapping[index].id}\n\n${item.line}\n\n` +
      'Expected: source-bound local development feedback and current same-SHA Actions evidence at the applicable acceptance checkpoint; missing required evidence refuses completion.\n' +
      'Interface checks: actual reports, digests and applicable contract.\n' +
      'Overall regression: every activated required target.\n').join('\n');
  return { state: 'mapped', mapping, adapter };
}
