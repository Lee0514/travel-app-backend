const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
const axios = require('axios')
require('dotenv').config()

const app = express()

// 中間件
app.use(express.json())
app.use(cors())

// 測試路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    originalUrl: req.originalUrl
  })
})

// 調試所有請求
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.originalUrl}`)
  next()
})

// 翻譯路由 - 匹配前端請求路徑
app.post('/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  if (!process.env.DeepL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' })
  }

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
    console.error('Translation error:', err.message)
    res.status(500).json({ 
      error: 'Translation failed',
      details: err.response?.data || err.message
    })
  }
})

// 也支援舊路徑（向後相容）
app.post('/translate/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  if (!process.env.DeepL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' })
  }

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
    console.error('Translation error:', err.message)
    res.status(500).json({ 
      error: 'Translation failed',
      details: err.response?.data || err.message
    })
  }
})

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasDeepLKey: !!process.env.DeepL_API_KEY
    }
  })
})

module.exports = app
module.exports.handler = serverless(app)