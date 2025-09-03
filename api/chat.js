export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY; // Вercel env дээрээс уншина

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    res.status(200).json({ reply: data.choices?.[0]?.message?.content || "…" });
  } catch (e) {
    res.status(500).json({ error: "Server error", details: e.message });
  }
}
