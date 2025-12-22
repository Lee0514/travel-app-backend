// routes/upcoming.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// 取得使用者行程
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return res.status(401).json({ error: 'Invalid token' })

    const { data, error } = await supabase
      .from('upcoming')
      .select('*')
      .eq('user_id', user.id)

    if (error) return res.status(400).json({ error: error.message })

    // 將資料整理成 { 'YYYY-MM-DD': [event, ...] } 格式
    const events = {}
    data.forEach(item => {
      const key = item.date
      if (!events[key]) events[key] = []
      events[key].push({
        id: item.id,
        title: item.title,
        note: item.description || ''
      })
    })

    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 新增行程
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return res.status(401).json({ error: 'Invalid token' })

    const { title, note, date } = req.body
    if (!title || !date) return res.status(400).json({ error: 'Missing title or date' })

    const { data, error } = await supabase
      .from('upcoming')
      .insert([{ user_id: user.id, title, description: note, date }])
      .select() // 取得新增後的完整資料

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 刪除行程（使用 row id）
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return res.status(401).json({ error: 'Invalid token' })

    const { id } = req.params
    const { data, error } = await supabase
      .from('upcoming')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
