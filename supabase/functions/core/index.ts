Deno.serve(() => Response.json({ request_id: crypto.randomUUID(), code: 'SERVICE_UNAVAILABLE',
  message: 'Service unavailable', retryable: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } }));
