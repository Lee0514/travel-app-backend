const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate')
const phrasesRoutes = require('./routes/phrases')

const app = express()
app.use(express.json())

// CORS 設定
app.use(
  cors({
    origin: [
      'http://localhost:5173', // 本地前端
      'https://travel-app-frontend-navy.vercel.app', // 部署前端
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

// Route 掛載，不加 /api
app.use('/auth', authRoutes)
app.use('/favorites', favoritesRoutes)
app.use('/translate', translateRoutes)
app.use('/phrases', phrasesRoutes)

// 供 Vercel serverless 使用
module.exports = app
module.exports.handler = serverless(app)

// 本地開發可用
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}
