const express = require('express')
const router = express.Router()
const axios = require('axios')

// 移除這行：require('dotenv').config()
// Vercel 會自動處理環境變數

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
      return res.status(500).json({ error: 'DeepL API key not configured' })
    }

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
      },
    )

    res.json(response.data)
  } catch (err) {
    console.error('Translation error:', err)
    if (err.response) {
      res.status(err.response.status).json(err.response.data)
    } else {
      res.status(500).json({ error: 'Translation failed' })
    }
  }
})

module.exports = router