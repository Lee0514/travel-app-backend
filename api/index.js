const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
const path = require('path')
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

// 直接定義翻譯路由（避免路徑問題）
app.post('/translate/translate', async (req, res) => {
  const axios = require('axios')
  const { text, sourceLang, targetLang } = req.body

  // 語言代碼轉換
  const normalizeLangCode = (lang) => {
    if (!lang) return 'EN'
    if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn')
      return 'ZH'
    if (lang.toLowerCase() === 'fr-fr') return 'FR'
    return lang.toUpperCase()
  }

  try {
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: process.env.DeepL_API_KEY,
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
    if (err.response) {
      console.error('DeepL API Error:', err.response.status, err.response.data)
      res.status(err.response.status).json(err.response.data)
    } else if (err.request) {
      console.error('No response from DeepL API:', err.request)
      res.status(500).json({ error: 'No response from DeepL API' })
    } else {
      console.error('Axios error:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
})

// 嘗試載入其他路由文件
try {
  // 使用絕對路徑
  const authRoutes = require(path.join(__dirname, '../routes/auth'))
  const favoritesRoutes = require(path.join(__dirname, '../routes/favorites'))
  const phrasesRoutes = require(path.join(__dirname, '../routes/phrases'))

  app.use('/auth', authRoutes)
  app.use('/favorites', favoritesRoutes)
  app.use('/phrases', phrasesRoutes)
  
  console.log('All routes loaded successfully')
} catch (error) {
  console.error('Error loading some routes:', error.message)
  // 繼續執行，至少翻譯功能可以工作
}

// 調試路由
app.get('/debug/routes', (req, res) => {
  const routes = []
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // 單個路由
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      })
    } else if (middleware.name === 'router') {
      // 路由器
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: middleware.regexp.source.replace(/\\\//g, '/').replace(/\$.*/, ''),
            route: handler.route.path,
            methods: Object.keys(handler.route.methods)
          })
        }
      })
    }
  })
  res.json({ routes })
})

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    message: `Path ${req.originalUrl} not found`,
    availableRoutes: ['/translate/translate', '/auth/*', '/favorites/*', '/phrases/*']
  })
})

module.exports = app
module.exports.handler = serverless(app)