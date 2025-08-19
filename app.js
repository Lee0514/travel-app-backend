const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate')
const phrasesRoutes = require('./routes/phrases')

const app = express()

// CORS 設定
app.use(
  cors({
    origin: [
      'https://travel-app-frontend-navy.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

app.use(express.json())

// 健康檢查路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  })
})

// 路由掛載
app.use('/api', (router => {
  router.use('/auth', authRoutes)
  router.use('/favorites', favoritesRoutes)
  router.use('/translate', translateRoutes)
  router.use('/phrases', phrasesRoutes)
  return router
})(express.Router()))

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// **重要：導出 app 供 Vercel 使用**
module.exports = app

// 只在本地環境啟動服務器
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}