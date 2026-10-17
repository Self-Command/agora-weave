import postgres from 'npm:postgres@3.4.7';

let connection: ReturnType<typeof postgres> | undefined;
export function database() {
  const url = Deno.env.get('SUPABASE_DB_URL');
  if (!url || new URL(url).username !== 'core_runtime') throw new Error('SERVICE_UNAVAILABLE');
  return connection ??= postgres(url, { max: 4, idle_timeout: 10, connect_timeout: 5, prepare: false,
    fetch_types: false, onnotice: () => {} });
}
