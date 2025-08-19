const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

// CORS 設定
app.use(cors({
  origin: [
    'https://travel-app-frontend-navy.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}))

app.use(express.json())

// 健康檢查
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel App Backend is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDeepLKey: !!process.env.DeepL_API_KEY
  })
})

// API 狀態檢查
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    deepl: !!process.env.DeepL_API_KEY
  })
})

// 翻譯 API（直接在主文件中，避免路由載入問題）
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
        timeout: 10000
      }
    )

    res.json(response.data)
  } catch (err) {
    console.error('Translation error:', err)
    if (err.response) {
      res.status(err.response.status).json({
        error: 'Translation API error',
        details: err.response.data
      })
    } else {
      res.status(500).json({ 
        error: 'Translation failed', 
        message: err.message 
      })
    }
  }
})

// 基本的其他 API 端點（暫時返回佔位符）
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Auth endpoint - coming soon' })
})

app.use('/api/favorites', (req, res) => {
  res.json({ message: 'Favorites endpoint - coming soon' })
})

app.use('/api/phrases', (req, res) => {
  res.json({ message: 'Phrases endpoint - coming soon' })
})

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  })
})

module.exports = app