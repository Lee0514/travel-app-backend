const express = require('express')
const cors = require('cors')
require('dotenv').config()

// 注意：這些路由只在本地開發時使用
// 生產環境使用 api/ 文件夾中的 Vercel API Routes
const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate')
const phrasesRoutes = require('./routes/phrases')

const app = express()
app.use(cors())
app.use(express.json())

// 添加提示信息
app.get('/', (req, res) => {
  res.json({
    message: 'Local development server',
    note: 'In production, this uses Vercel API Routes in /api folder',
    availableRoutes: [
      '/api/auth',
      '/api/favorites', 
      '/api/translate',
      '/api/phrases'
    ]
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

const PORT = process.env.PORT || 3001

// 只在非生產環境啟動服務器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Local development server running on port ${PORT}`)
    console.log(`Available at: http://localhost:${PORT}`)
    console.log('Note: Production uses Vercel API Routes')
  })
}