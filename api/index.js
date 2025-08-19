const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
require('dotenv').config()

const app = express()

// 中間件
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://travel-app-frontend-navy.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

// 測試根路由
app.get('/', (req, res) => {
  res.json({ message: 'API is working on Vercel!' })
})

app.get('/api', (req, res) => {
  res.json({ message: 'API root is working!' })
})

// 動態導入路由（避免路徑問題）
try {
  const authRoutes = require('../routes/auth')
  const favoritesRoutes = require('../routes/favorites')  
  const translateRoutes = require('../routes/translate')
  const phrasesRoutes = require('../routes/phrases')

  app.use('/auth', authRoutes)
  app.use('/favorites', favoritesRoutes)
  app.use('/translate', translateRoutes)
  app.use('/phrases', phrasesRoutes)
} catch (error) {
  console.error('Error loading routes:', error)
  
  // 如果路由加載失敗，提供一個備用的翻譯端點
  app.post('/translate/translate', async (req, res) => {
    const axios = require('axios')
    const { text, sourceLang, targetLang } = req.body
    
    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        new URLSearchParams({
          auth_key: process.env.DeepL_API_KEY,
          text,
          source_lang: sourceLang?.toUpperCase() || 'EN',
          target_lang: targetLang?.toUpperCase() || 'ZH',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      )
      res.json(response.data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    message: `Path ${req.originalUrl} not found`
  })
})

module.exports = app
module.exports.handler = serverless(app)