import { verifySignature } from '../utils/auth.js';
import { validatePayload } from '../utils/validation.js';

export async function handleSubmit(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await request.json();

  // Validate payload structure
  if (!validatePayload(payload)) {
    return new Response('Invalid payload', { status: 400 });
  }

  // Verify signature
  const isValid = await verifySignature(payload.encrypted, payload.signature);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Forward to Deta Space
  const detaResponse = await fetch(`${env.DETA_SPACE_URL}/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.DETA_API_KEY,
    },
    body: JSON.stringify({
      encrypted: payload.encrypted,
      timestamp: Date.now(),
      type: payload.type,
    }),
  });

  if (!detaResponse.ok) {
    return new Response('Storage failed', { status: 500 });
  }

  const result = await detaResponse.json();

  // Cache metadata in KV
  await env.CACHE.put(
    `record:${result.id}`,
    JSON.stringify({
      id: result.id,
      timestamp: result.timestamp,
      type: payload.type,
    }),
    { expirationTtl: 3600 }
  );

  return new Response(JSON.stringify({ success: true, id: result.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
