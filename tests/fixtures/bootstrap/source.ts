import { createHash } from 'node:crypto';
import type { CollectionRequest } from '../../../tools/ci/collect-evidence.ts';

export function sourceFixture() {
  const archive = Buffer.from('synthetic archive bytes');
  const sha = 'a'.repeat(40);
  const request: CollectionRequest = {
    repository: 'Self-Command/agora-weave', run_id: '4242', expected_sha: sha,
    expected_attempt: 2, workflow_path: '.github/workflows/ci-bootstrap.yml',
    artifact_name: 'bootstrap-transport-4242-2', token: 'synthetic-fixture-token',
  };
  const run = { id: 4242, head_sha: sha, run_attempt: 2, event: 'push',
    path: request.workflow_path, repository: { full_name: request.repository },
    head_repository: { full_name: request.repository } };
  const attempts = [
    { ...run, run_attempt: 1, status: 'completed', conclusion: 'failure' },
    { ...run, status: 'completed', conclusion: 'success' },
  ];
  const artifact = { id: 77, name: request.artifact_name, expired: false, size_in_bytes: archive.length,
    digest: `sha256:${createHash('sha256').update(archive).digest('hex')}`,
    workflow_run: { id: 4242, head_sha: sha } };
  const requests: { url: string; authorization: string | null }[] = [];
  const reply = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } });
  let artifactPages = [[artifact]];
  let unavailablePath = '';
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, authorization: new Headers(init?.headers).get('authorization') });
    const path = new URL(url).pathname;
    if (path.includes(unavailablePath) && unavailablePath) return new Response('synthetic unavailable', { status: 503 });
    if (path.endsWith('/actions/runs/4242')) return reply(run);
    const attempt = path.match(/\/attempts\/(\d+)$/);
    if (attempt) return reply(attempts[Number(attempt[1]) - 1]);
    if (path.endsWith('/artifacts')) {
      const page = Number(new URL(url).searchParams.get('page') || 1);
      return reply({ total_count: artifactPages.flat().length, artifacts: artifactPages[page - 1] || [] });
    }
    if (path.endsWith('/artifacts/77/zip')) return new Response(null, { status: 302, headers: { location: 'https://synthetic.actions.githubusercontent.com/archive.zip?signed=fixture' } });
    if (url.startsWith('https://synthetic.actions.githubusercontent.com/')) return new Response(archive);
    throw new Error(`Unexpected source fixture request: ${path}`);
  };
  return { request, run, attempts, artifact, archive, fetcher, requests,
    setPages: (pages: typeof artifactPages) => { artifactPages = pages; },
    setUnavailable: (path: string) => { unavailablePath = path; } };
}
