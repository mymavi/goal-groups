// Same-origin JSON only for writes, plus a catch-all error handler.
export async function onRequest({ request, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const ct = request.headers.get('content-type') || '';
    if (request.method !== 'DELETE' && !ct.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Send JSON.' }), { status: 415, headers: { 'content-type': 'application/json' } });
    }
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return new Response(JSON.stringify({ error: 'Cross-site request blocked.' }), { status: 403, headers: { 'content-type': 'application/json' } });
    }
  }
  try { return await next(); }
  catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Something went wrong. Try again.' }), { status: 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
}
