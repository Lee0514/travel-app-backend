import axios from 'axios'

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
      usage: 'Send POST request with { text, sourceLang, targetLang }'
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, sourceLang, targetLang } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  if (!process.env.DeepL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' })
  }

  // 語言代碼轉換
  const normalizeLangCode = (lang) => {
    if (!lang) return 'EN'
    if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn')
      return 'ZH'
    if (lang.toLowerCase() === 'fr-fr') return 'FR'
    return lang.toUpperCase()
  }

  try {
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: process.env.DeepL_API_KEY,
        text,
        source_lang: normalizeLangCode(sourceLang),
        target_lang: normalizeLangCode(targetLang),
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    )

    res.status(200).json(response.data)
  } catch (err) {
    console.error('Translation error:', err.message)
    res.status(500).json({ 
      error: 'Translation failed',
      details: err.response?.data || err.message
    })
  }
}