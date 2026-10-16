import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const status = (code: string) => code === 'SESSION_INVALID' ? 401 : code === 'FORBIDDEN' ? 403 :
  code === 'NOT_FOUND' ? 404 : code === 'CONFLICT' ? 409 : 422;
export async function recoveryCase(request: Request,target: string | null,failure: (code: string,status: number) => Response): Promise<Response> {
  if (new URL(request.url).search || target !== null && !uuid.test(target)) return failure('INVALID_INPUT',422);
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev','test','production'].includes(environment)) return failure('SERVICE_UNAVAILABLE',503);
  const actor = await principal(request);
  if (!actor || actor.audience !== 'authenticated') return failure('SESSION_INVALID',401);
  if (target === null) {
    let input;
    try { input = await readCommandJson(request,2048); } catch { return failure('INVALID_INPUT',422); }
    if (typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      typeof input.mode !== 'string' || !['trusted','manual'].includes(input.mode) ||
      Object.keys(input).some(key => !['operation_id','mode'].includes(key))) return failure('INVALID_INPUT',422);
    const [row] = await database()`SELECT core.request_recovery_result(${actor.account}::uuid,${actor.session}::uuid,
      ${input.operation_id}::uuid,${input.mode},${environment}) AS result`;
    if (row.result.code !== 'OK') return failure(row.result.code,status(row.result.code));
    target = row.result.id;
  }
  const caseRef = target;
  return new Promise(resolve => {
    let delivered = false;
    const deliver = (response: Response) => { if (!delivered) { delivered = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      const [row] = await tx`SELECT core.recovery_case_result(${actor.account}::uuid,${actor.session}::uuid,${caseRef}::uuid,${environment}) AS result`;
      if (row.result.code !== 'OK') { deliver(failure(row.result.code,status(row.result.code))); return; }
      const bytes = new TextEncoder().encode(JSON.stringify({ request_id: crypto.randomUUID(),data: row.result.data }));
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(bytes); value.close(); } finally { clearTimeout(timer); done(); } },
        cancel() { clearTimeout(timer); done(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ status: request.method === 'POST' ? 202 : 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8','Cache-Control': 'no-store' } }));
      await handedOff;
    }).catch(() => deliver(failure('SERVICE_UNAVAILABLE',503)));
  });
}
