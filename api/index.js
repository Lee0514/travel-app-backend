const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
require('dotenv').config()

const authRoutes = require('../routes/auth')
const favoritesRoutes = require('../routes/favorites')
const translateRoutes = require('../routes/translate')
const phrasesRoutes = require('../routes/phrases')

const app = express()
app.use(express.json())

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173', // local front-end
      'https://travel-app-frontend-navy.vercel.app', // deployed front-end
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

// 路由掛載
app.use('/auth', authRoutes)
app.use('/favorites', favoritesRoutes)
app.use('/translate', translateRoutes)
app.use('/phrases', phrasesRoutes)

// serverless handler
module.exports = app
module.exports.handler = serverless(app)
