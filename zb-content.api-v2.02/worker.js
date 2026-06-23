// Only these origins may call the API. Add a custom domain here if one is set up later.
const ALLOWED_ORIGINS = [
  'https://brand-content-manager.pages.dev',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow Cloudflare Pages preview deployments: <hash>.brand-content-manager.pages.dev
  try {
    return new URL(origin).host.endsWith('.brand-content-manager.pages.dev');
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {

    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Reject browser calls from origins that are not on the allowlist
    if (origin && !isAllowedOrigin(origin)) {
      return new Response('Forbidden', { status: 403, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    const url = new URL(request.url);

    // ── Route: /image — GPT Image generation ──
    if (url.pathname === '/image') {
      try {
        const body = await request.json();
        const {
          prompt,
          size = '1024x1024',
          quality = 'high',
          model = 'gpt-image-1',
        } = body;

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'prompt is required' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        const qualityMap = {
          standard: 'medium',
          hd: 'high',
          low: 'low',
          medium: 'medium',
          high: 'high',
          auto: 'auto',
        };
        const normalizedQuality = qualityMap[quality] || 'high';

        const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size,
            quality: normalizedQuality,
            response_format: 'b64_json',
          }),
        });

        const imageData = await imageRes.json();

        if (!imageRes.ok) {
          return new Response(JSON.stringify({ error: imageData.error?.message || 'Image generation failed' }), {
            status: imageRes.status,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          ...imageData,
          requested_model: model,
          requested_quality: normalizedQuality,
        }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Route: / — OpenAI chat completions (text + vision) ──
    try {
      const body = await request.json();
      const { model = 'gpt-5.4', max_tokens = 1500, messages, system, response_format } = body;

      // Convert Anthropic-style system prompt to OpenAI messages format
      const openAIMessages = [];
      if (system) {
        openAIMessages.push({ role: 'system', content: system });
      }
      if (messages && Array.isArray(messages)) {
        // Pass messages as-is — content may be string or array (vision)
        openAIMessages.push(...messages);
      }

      const textRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_completion_tokens: max_tokens,
          messages: openAIMessages,
          ...(response_format ? { response_format } : {}),
        }),
      });

      const textData = await textRes.json();

      if (!textRes.ok) {
        return new Response(JSON.stringify({ error: textData.error?.message || 'Text generation failed' }), {
          status: textRes.status,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Normalize response to Anthropic-style format so frontend code needs minimal changes
      const normalized = {
        content: [
          {
            type: 'text',
            text: textData.choices?.[0]?.message?.content || '',
          },
        ],
        model: textData.model,
        usage: textData.usage,
      };

      return new Response(JSON.stringify(normalized), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
