const express = require('express')
const router = express.Router()
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

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
  const { text, sourceLang, targetLang } = req.body

  try {
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
    if (err.response) {
      console.error('DeepL API Error:', err.response.status, err.response.data)
      res.status(err.response.status).json(err.response.data)
    } else if (err.request) {
      console.error('No response from DeepL API:', err.request)
      res.status(500).json({ error: 'No response from DeepL API' })
    } else {
      console.error('Axios error:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
})

module.exports = router
