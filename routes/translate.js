const express = require('express')
const router = express.Router()
const axios = require('axios')

const DeepL_API_KEY = process.env.DeepL_API_KEY

// 語言代碼轉換
const normalizeLangCode = (lang) => {
  if (!lang) return 'EN'
  if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn')
    return 'ZH'
  if (lang.toLowerCase() === 'fr-fr') return 'FR'
  return lang.toUpperCase()
}

// 翻譯 API
router.post('/', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    if (!DeepL_API_KEY) {
      console.error('DeepL API key not found')
      return res.status(500).json({ error: 'Translation service not configured' })
    }

    console.log('Translation request:', { 
      text: text.substring(0, 50) + '...', 
      sourceLang, 
      targetLang 
    })

    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: DeepL_API_KEY,
        text,
        source_lang: normalizeLangCode(sourceLang),
        target_lang: normalizeLangCode(targetLang),
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000, // 10秒超時
      },
    )

    console.log('Translation successful')
    res.json(response.data)
  } catch (err) {
    console.error('Translation error:', err.message)
    if (err.response) {
      console.error('DeepL API Error:', err.response.status, err.response.data)
      res.status(err.response.status).json({
        error: 'Translation API error',
        details: err.response.data
      })
    } else if (err.request) {
      console.error('No response from DeepL API')
      res.status(500).json({ error: 'Translation service unavailable' })
    } else {
      console.error('Request setup error:', err.message)
      res.status(500).json({ error: 'Translation failed', message: err.message })
    }
  }
})

// 測試路由
router.get('/test', (req, res) => {
  res.json({
    message: 'Translate route is working',
    hasApiKey: !!DeepL_API_KEY
  })
})

module.exports = router