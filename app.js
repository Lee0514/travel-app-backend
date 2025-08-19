const express = require('express')
const cors = require('cors')

const app = express()

console.log('🚀 Starting app initialization...')

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

console.log('✅ CORS and JSON middleware loaded')

// 基本檢查
app.get('/', (req, res) => {
  console.log('📍 Root route accessed')
  res.json({ 
    message: 'Travel App Backend is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDeepLKey: !!process.env.DeepL_API_KEY
  })
})

// API 狀態檢查
app.get('/api/status', (req, res) => {
  console.log('📍 Status route accessed')
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    deepl: !!process.env.DeepL_API_KEY
  })
})

// 調試路由 - 簡單測試
app.get('/api/debug', (req, res) => {
  console.log('📍 Debug route accessed')
  res.json({
    message: 'Debug route working',
    timestamp: new Date().toISOString()
  })
})

console.log('📍 Starting route loading attempt...')

// 嘗試載入翻譯路由
try {
  console.log('📁 Looking for routes/translate.js...')
  const translateRoutes = require('./routes/translate')
  console.log('✅ translate.js file found and loaded')
  
  app.use('/api/translate', translateRoutes)
  console.log('✅ Translate routes mounted to /api/translate')
  
  app.get('/api/route-test', (req, res) => {
    res.json({ message: 'External routes loaded successfully!' })
  })
  
} catch (error) {
  console.error('❌ Route loading failed:', error.message)
  console.error('❌ Full error:', error)
  
  // 備用翻譯路由
  app.post('/api/translate', async (req, res) => {
    const axios = require('axios')
    
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
      res.status(500).json({ error: 'Translation failed (fallback)', message: err.message })
    }
  })
  
  app.get('/api/route-test', (req, res) => {
    res.json({ message: 'Using fallback inline routes' })
  })
}

console.log('📍 Route loading attempt completed')

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('💥 Express error:', err)
  res.status(500).json({ error: err.message })
})

// 404 處理
app.use('*', (req, res) => {
  console.log('❌ 404 for path:', req.originalUrl)
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  })
})

console.log('🎉 App setup complete, exporting module...')

module.exports = app