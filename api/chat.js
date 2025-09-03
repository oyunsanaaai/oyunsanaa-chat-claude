// /api/chat.js  (Vercel Serverless Function)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });

    const messages = [];

    for (const item of history) {
      if (item?.role === 'user' || item?.role === 'assistant') {
        messages.push({ role: item.role, content: item.content || '' });
      }
    }
    messages.push({ role: 'user', content: message });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 512,
        system: 'You are Oyunsanaa, a helpful, warm Mongolian assistant.',
        messages
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Upstream error', detail: text });
    }

    const data = await r.json();
    const reply =
      data?.content?.map?.(c => (typeof c === 'string' ? c : c?.text || '')).join('') ||
      data?.content?.[0]?.text ||
      '';

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
