export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY; // Vercel дээр env key хадгалсан байх ёстой

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // Claude-ийн хамгийн сайн model
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await r.json();

    res.status(200).json({
      reply: data.content?.[0]?.text || "⚠️ Claude-с хоосон хариу ирлээ"
    });
  } catch (e) {
    res.status(500).json({ error: "Server error", details: e.message });
  }
}
