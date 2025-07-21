// routes/favorites.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// 查詢使用者收藏的景點
router.get('/:userId', async (req, res) => {
  const { userId } = req.params
  const { data, error } = await supabase
    .from('favorites')
    .select('place_id, places(name, description)')
    .eq('user_id', userId)
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// 收藏新景點
router.post('/', async (req, res) => {
  const { user_id, place_id } = req.body
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id, place_id }])
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

module.exports = router
