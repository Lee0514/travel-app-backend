export default async function handler(req, res) {
  // 設置 CORS - 必須在所有邏輯之前
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // 處理 preflight 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
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

      // 現在添加真正的 DeepL API 調用
      const axios = require('axios')
      
      // 語言代碼轉換
      const normalizeLangCode = (lang) => {
        if (!lang) return 'EN'
        if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn')
          return 'ZH'
        if (lang.toLowerCase() === 'fr-fr') return 'FR'
        return lang.toUpperCase()
      }

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

      return res.status(200).json(response.data)
    } catch (error) {
      console.error('Translation error:', error.message)
      return res.status(500).json({ 
        error: 'Translation failed',
        details: error.response?.data || error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}