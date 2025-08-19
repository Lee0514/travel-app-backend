export default async function handler(req, res) {
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
      usage: 'Send POST request with { text, sourceLang, targetLang }',
      hasApiKey: !!process.env.DeepL_API_KEY
    })
  }

  if (req.method === 'POST') {
    try {
      const { text, sourceLang, targetLang } = req.body || {}
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' })
      }

      if (!process.env.DeepL_API_KEY) {
        return res.status(500).json({ error: 'DeepL API key not configured' })
      }

      // 先測試不調用 DeepL API
      return res.status(200).json({
        message: 'Translation request processed!',
        received: { text, sourceLang, targetLang },
        timestamp: new Date().toISOString(),
        willTranslate: `${text} from ${sourceLang} to ${targetLang}`
      })
    } catch (error) {
      return res.status(500).json({ 
        error: 'Server error',
        details: error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}