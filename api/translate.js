export default function handler(req, res) {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Translation API is working!',
      usage: 'Send POST request with { text, sourceLang, targetLang }'
    })
  }

  if (req.method === 'POST') {
    const { text, sourceLang, targetLang } = req.body || {}
    
    return res.status(200).json({
      message: 'Translation endpoint working!',
      received: { text, sourceLang, targetLang },
      timestamp: new Date().toISOString()
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}