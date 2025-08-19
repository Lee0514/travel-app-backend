const express = require('express')
const cors = require('cors')

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

// 檢查
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

// 載入翻譯路由
try {
  const translateRoutes = require('./routes/translate')
  app.use('/api/translate', translateRoutes)
  console.log('Translate routes loaded successfully')
} catch (error) {
  console.error('Error loading translate routes:', error)
  
  // 如果路由載入失敗，使用備用的直接路由
  const axios = require('axios')
  
  app.post('/api/translate', async (req, res) => {
    res.status(500).json({ error: 'Route loading failed, using fallback' })
  })
}

// 其他 API 端點的佔位符
app.get('/api/auth', (req, res) => {
  res.json({ message: 'Auth endpoint - coming soon' })
})

app.get('/api/favorites', (req, res) => {
  res.json({ message: 'Favorites endpoint - coming soon' })
})

app.get('/api/phrases', (req, res) => {
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