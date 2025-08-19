const express = require('express')
const cors = require('cors')

const app = express()

// CORS 設定
app.use(
  cors({
    origin: [
      'https://travel-app-frontend-navy.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)

app.use(express.json())

// 健康檢查路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel App Backend is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: '1.0.0'
  })
})

// 載入路由
try {
  const authRoutes = require('./routes/auth')
  const favoritesRoutes = require('./routes/favorites')
  const translateRoutes = require('./routes/translate')
  const phrasesRoutes = require('./routes/phrases')

  // 路由掛載
  app.use('/api/auth', authRoutes)
  app.use('/api/favorites', favoritesRoutes)
  app.use('/api/translate', translateRoutes)
  app.use('/api/phrases', phrasesRoutes)
} catch (error) {
  console.error('Error loading routes:', error)
  
  // 如果路由載入失敗，提供基本的翻譯功能
  const axios = require('axios')
  
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
}

// API 狀態檢查
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      deepl: !!process.env.DeepL_API_KEY,
    }
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  })
})

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  })
})

// 導出給 Vercel
module.exports = app

// 只在本地環境啟動服務器
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}