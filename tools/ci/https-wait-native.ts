import { writeFileSync } from 'node:fs';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Native wait is Actions only');
const expected = [' / native / iOS shell 16.4', ' / native / iOS shell 26.4', ' / native / Android shell API 24', ' / native / Android shell API 36'];
for (let poll = 0; poll < 110; poll++) {
  const jobs: Record<string, any>[] = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/attempts/${process.env.GITHUB_RUN_ATTEMPT}/jobs?per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
      redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Current native job metadata unavailable');
    const listing = await response.json() as Record<string, any>;
    if (!Array.isArray(listing.jobs)) throw new Error('Invalid native job list');
    jobs.push(...listing.jobs);
    if (jobs.length === listing.total_count) break;
    if (!listing.jobs.length || page === 10) throw new Error('Incomplete native job list');
  }
  const selected = expected.map(name => jobs.filter(job => String(job.name).includes(name)));
  if (selected.every(matches => matches.length === 1 && matches[0].status === 'completed')) {
    const success = selected.every(matches => matches[0].conclusion === 'success');
    writeFileSync('service-output/https-native-outcomes.json', JSON.stringify({ state: success ? 'passed' : 'blocked',
      run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      jobs: selected.map(matches => ({ id: matches[0].id, name: matches[0].name, conclusion: matches[0].conclusion })) }, null, 2) + '\n');
    if (!success) throw new Error('Actual native HTTPS executor failed');
    break;
  }
  if (poll === 109) throw new Error('Native HTTPS executor completion unavailable');
  await new Promise(resolve => setTimeout(resolve, 30000));
}
