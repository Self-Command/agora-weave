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
    '\nConstitution 5.0.0 and ED-22 govern: business first, local batch development and on-demand Actions verification. Per-behavior TDD is discretionary. Critical permissions, security, data integrity and bug fixes require effective tests. Historical Red certification and daily receipts are not prerequisites. Never fabricate results or runner identity.\n\n' +
    pending.map((item, index) => `### Task ${index + 1}: ${mapping[index].id}\n\n${item.line}\n\n` +
      'Expected: usable implemented behavior with corresponding real tests; record partial progress and remaining validation separately.\n' +
      'Interface checks: current behavior, authorization and applicable contract.\n' +
      'Overall regression: target tests and directly affected regressions; expand by actual risk. Actions are on demand by business batch or release need.\n').join('\n');
  return { state: 'mapped', mapping, adapter };
}
