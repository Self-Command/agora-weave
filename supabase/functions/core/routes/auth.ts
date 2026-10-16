import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';

export async function refreshSession(request: Request,failure: (code: string,status: number) => Response): Promise<Response> {
  let input;
  try {
    input = await readCommandJson(request,4096);
  } catch { return failure('INVALID_INPUT',422); }
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => key !== 'refresh_token') ||
    typeof input.refresh_token !== 'string' || input.refresh_token.length < 12 || input.refresh_token.length > 2048 ||
    Array.from(input.refresh_token as string).some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return failure('INVALID_INPUT',422);
  let session;
  let actor;
  try {
    const response = await fetch('http://auth:9999/token?grant_type=refresh_token',{ method: 'POST',
      headers: { 'Content-Type': 'application/json' },body: JSON.stringify({ refresh_token: input.refresh_token }),signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      await response.body?.cancel();
      return failure(response.status >= 500 ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID',response.status >= 500 ? 503 : 401);
    }
    const result = await response.json();
    if (typeof result.access_token !== 'string' || typeof result.refresh_token !== 'string' || result.refresh_token.length > 2048) throw new Error();
    actor = await principal(new Request(request.url,{ headers: { Authorization: `Bearer ${result.access_token}` } }));
    if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID',401);
    session = { access_token: result.access_token,refresh_token: result.refresh_token,expires_at: actor.expires_at };
  } catch { return failure('SERVICE_UNAVAILABLE',503); }
  const verified = actor;
  const tokens = session;
  return new Promise(resolve => {
    let delivered = false;
    const deliver = (response: Response) => { if (!delivered) { delivered = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      const [row] = await tx`SELECT core.current_identity(${verified.account}::uuid,${verified.session}::uuid) AS active`;
      if (!row.active) { deliver(failure('SESSION_INVALID',401)); return; }
      const bytes = new TextEncoder().encode(JSON.stringify({ request_id: crypto.randomUUID(),data: { session: tokens } }));
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(bytes); value.close(); } finally { clearTimeout(timer); done(); } },
        cancel() { clearTimeout(timer); done(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ headers: { 'Content-Type': 'application/json; charset=utf-8','Cache-Control': 'no-store' } }));
      await handedOff;
    }).catch(() => deliver(failure('SERVICE_UNAVAILABLE',503)));
  });
}

export function registrationDocuments(request: Request, failure: (code: string,status: number) => Response): Promise<Response> {
  const query = new URL(request.url).searchParams;
  if ([...query].some(([key,value]) => !({ kind: 'terms',surface: 'app',locale: 'zh-CN' } as Record<string,string>)[key] ||
    ({ kind: 'terms',surface: 'app',locale: 'zh-CN' } as Record<string,string>)[key] !== value) ||
    [...new Set(query.keys())].some(key => query.getAll(key).length !== 1)) return Promise.resolve(failure('INVALID_INPUT',422));
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev','test','production'].includes(environment)) return Promise.resolve(failure('SERVICE_UNAVAILABLE',503));
  return new Promise(resolve => {
    let delivered = false;
    const deliver = (response: Response) => { if (!delivered) { delivered = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      const [row] = await tx`SELECT core.registration_documents_result(${environment}) AS result`;
      if (row.result.code !== 'OK') { deliver(failure(row.result.code,503)); return; }
      const data = { documents: row.result.documents,document_set_digest: row.result.document_set_digest,
        age_declaration_version: row.result.age_declaration_version };
      const bytes = new TextEncoder().encode(JSON.stringify({ request_id: crypto.randomUUID(),data }));
      if (bytes.length > 1024 * 1024) { deliver(failure('SERVICE_UNAVAILABLE',503)); return; }
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(bytes); value.close(); } finally { clearTimeout(timer); done(); } },
        cancel() { clearTimeout(timer); done(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ headers: { 'Content-Type': 'application/json; charset=utf-8','Cache-Control': 'no-store' } }));
      await handedOff;
    }).catch(() => deliver(failure('SERVICE_UNAVAILABLE',503)));
  });
}
