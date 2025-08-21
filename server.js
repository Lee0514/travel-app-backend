const express = require('express')
const cors = require('cors')
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
      'http://localhost:5173',
      'https://travel-app-frontend-navy.vercel.app',
      'https://travel-app-frontend-sand.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/translate', translateRoutes)
app.use('/api/phrases', phrasesRoutes)

module.exports = app
