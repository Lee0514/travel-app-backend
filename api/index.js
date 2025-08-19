const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')

const app = express()

app.use(express.json())
app.use(cors())

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Minimal API working!' })
})

// 簡單測試路由
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' })
})

// 翻譯路由
app.post('/translate', (req, res) => {
  res.json({ 
    message: 'Translation endpoint reached!',
    received: req.body,
    timestamp: new Date().toISOString()
  })
})

// 捕獲所有路由
app.all('*', (req, res) => {
  res.json({
    message: 'Catch all route',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl
  })
})

module.exports = app
module.exports.handler = serverless(app)