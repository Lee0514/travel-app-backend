const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: [
    'https://travel-app-frontend-navy.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    message: 'Testing route loading...',
    env: {
      hasDeepLKey: !!process.env.DeepL_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  })
})

// 測試載入 translate 路由
try {
  const translateRoutes = require('./routes/translate')
  app.use('/api/translate', translateRoutes)
  
  app.get('/api/status', (req, res) => {
    res.json({ 
      message: 'Translate routes loaded successfully!',
      routes: 'translate loaded'
    })
  })
} catch (error) {
  app.get('/api/status', (req, res) => {
    res.status(500).json({ 
      error: 'Failed to load translate routes',
      message: error.message,
      stack: error.stack
    })
  })
}

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  })
})

module.exports = app