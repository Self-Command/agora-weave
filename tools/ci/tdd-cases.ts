export function selectTddCases(tap: string, selection: { case_ids?: string[]; case_titles?: string[] }):
  { title: string; failed: boolean }[] {
  const exact = selection.case_titles !== undefined;
  const targets = exact ? selection.case_titles : selection.case_ids;
  if (!Array.isArray(targets) || !targets.length || targets.some(value => typeof value !== 'string' || !value.trim()) ||
    new Set(targets).size !== targets.length) return [];
  const assertions = [...tap.matchAll(/^(not )?ok \d+ - (.+)\r?$/gm)].map(match =>
    ({ title: match[2].replace(/\r$/, ''), failed: !!match[1] }));
  const selected = targets.map(target => assertions.filter(assertion => exact ? assertion.title === target :
    assertion.title.startsWith(target + ':')));
  if (selected.some(matches => matches.length !== 1)) return [];
  return selected.map(matches => matches[0]);
}
