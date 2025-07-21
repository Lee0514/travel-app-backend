// index.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')

const app = express()
app.use(cors())
app.use(express.json())

// 路由掛載
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
