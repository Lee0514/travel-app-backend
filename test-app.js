const express = require('express')
const cors = require('cors')

const app = express()

// 添加 CORS
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
  res.json({ message: 'Hello from Vercel with CORS!' })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful!' })
})

module.exports = app