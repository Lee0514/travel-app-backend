const express = require('express')
const cors = require('cors')

const app = express()

// CORS 設定
app.use(cors({
  origin: [
    'https://travel-app-frontend-navy.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

app.use(express.json())

// 健康檢查
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel App Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API 狀態檢查
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      translation: !!process.env.DeepL_API_KEY
    }
  })
})

// 載入所有路由
const translateRoutes = require('./routes/translate')
const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const phrasesRoutes = require('./routes/phrases')

// 掛載路由
app.use('/api/translate', translateRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/phrases', phrasesRoutes)

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    error: 'Internal server error'
  })
})

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

module.exports = app