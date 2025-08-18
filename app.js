const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate');
const phrasesRoutes = require('./routes/phrases');

const app = express()
app.use(cors())
app.use(express.json())

// 路由掛載
app.use('/api', (router => {
  router.use('/auth', authRoutes)
  router.use('/favorites', favoritesRoutes)
  router.use('/translate', translateRoutes)
  router.use('/phrases', phrasesRoutes)
  return router
})(express.Router()))


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
