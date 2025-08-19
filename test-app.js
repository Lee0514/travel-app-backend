const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors({
  origin: [
    'https://travel-app-frontend-navy.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    hasDeepLKey: !!process.env.DeepL_API_KEY
  })
})

// 直接添加翻譯路由來測試
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const DeepL_API_KEY = process.env.DeepL_API_KEY
    
    if (!DeepL_API_KEY) {
      return res.status(500).json({ error: 'DeepL API key not configured' })
    }

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
      res.status(500).json({ error: 'Translation failed', message: err.message })
    }
  }
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

module.exports = app