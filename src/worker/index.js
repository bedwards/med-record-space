import { handleSubmit } from './routes/submit.js';
import { handleFetch } from './routes/fetch.js';
import { handleSync } from './routes/sync.js';
import { verifySignature } from './utils/auth.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      switch (url.pathname) {
        case '/submit':
          response = await handleSubmit(request, env);
          break;
        case '/fetch':
          response = await handleFetch(request, env);
          break;
        case '/sync':
          response = await handleSync(request, env);
          break;
        case '/health':
          response = new Response(JSON.stringify({ status: 'healthy' }), {
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        default:
          response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers to response
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
