const express = require('express')
const app = express()

// 最基本的路由
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Vercel!' })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' })
})

// 導出給 Vercel
module.exports = app