const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate')
const phrasesRoutes = require('./routes/phrases')
const upcomingRoutes = require('./routes/upcoming')

const app = express()
app.use(express.json())
app.use(cookieParser())

// CORS 設定
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://travel-app-frontend-navy.vercel.app',
      'https://travel-app-frontend-sand.vercel.app',
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/translate', translateRoutes)
app.use('/api/phrases', phrasesRoutes)
app.use('/api/upcoming', upcomingRoutes)

module.exports = app
