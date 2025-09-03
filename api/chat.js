export default async function handler(req, res) {
// CORS тохируулах
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { message } = req.body;

if (!message) {
return res.status(400).json({ error: ‘Message is required’ });
}

// API key шалгах
if (!process.env.ANTHROPIC_API_KEY) {
return res.status(500).json({
error: ‘API key тохируулаагүй байна’,
debug: ‘ANTHROPIC_API_KEY environment variable байхгүй’
});
}

try {
console.log(‘🔄 Claude API дуудаж байна…’);

```
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  })
});

console.log('📡 Response status:', response.status);

if (!response.ok) {
  const errorData = await response.text();
  console.error('❌ API Error:', response.status, errorData);
  
  if (response.status === 401) {
    return res.status(401).json({ 
      error: 'API key буруу байна',
      debug: 'Anthropic console-аас API key-ээ дахин шалгаарай'
    });
  }
  
  if (response.status === 429) {
    return res.status(429).json({ 
      error: 'Rate limit хүрсэн байна',
      debug: 'Хэдэн секунд хүлээгээд дахин оролдоно уу'
    });
  }
  
  throw new Error(`API Error: ${response.status} - ${errorData}`);
}

const data = await response.json();
console.log('✅ Claude хариулт ирлээ');

if (data.content && data.content[0] && data.content[0].text) {
  return res.json({ reply: data.content[0].text });
} else {
  console.error('❌ Unexpected response format:', data);
  return res.status(500).json({ 
    error: 'Хариултын формат буруу байна',
    debug: data
  });
}
```

} catch (error) {
console.error(‘💥 API Error:’, error.message);
return res.status(500).json({
error: ‘Claude API-тай холбогдож чадсангүй’,
debug: error.message,
suggestion: ‘API key болон интернет холболтоо шалгаарай’
});
}
}
