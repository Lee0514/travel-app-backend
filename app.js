const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const favoritesRoutes = require('./routes/favorites')
const translateRoutes = require('./routes/translate')
const phrasesRoutes = require('./routes/phrases')

const app = express()
app.use(cors())
app.use(express.json())

// 路由掛載
// prettier-ignore
app.use('/api', (router => {
  router.use('/auth', authRoutes)
  router.use('/favorites', favoritesRoutes)
  router.use('/translate', translateRoutes)
  router.use('/phrases', phrasesRoutes)
  return router
})(express.Router()))

// CORS 設定
app.use(
  cors({
    origin: ['https://travel-app-frontend-navy.vercel.app/'], // 允許的前端網址
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
