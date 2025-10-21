export async function handleFetch(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const query = await request.json();

  // Check KV cache first
  const cached = await env.CACHE.get(`record:${query.id}`);
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch from Deta Space
  const detaResponse = await fetch(`${env.DETA_SPACE_URL}/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.DETA_API_KEY,
    },
    body: JSON.stringify(query),
  });

  if (!detaResponse.ok) {
    return new Response('Record not found', { status: 404 });
  }

  const data = await detaResponse.json();

  // Update cache
  await env.CACHE.put(`record:${query.id}`, JSON.stringify(data), {
    expirationTtl: 3600,
  });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
