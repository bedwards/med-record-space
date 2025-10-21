export async function handleSync(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await request.json();

  // Update sync metrics
  const metrics = JSON.parse((await env.CACHE.get('metrics')) || '{}');
  metrics.lastSync = Date.now();
  metrics.syncCount = (metrics.syncCount || 0) + 1;
  await env.CACHE.put('metrics', JSON.stringify(metrics));

  // Forward to Deta Space
  const detaResponse = await fetch(`${env.DETA_SPACE_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.DETA_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!detaResponse.ok) {
    return new Response('Sync failed', { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
