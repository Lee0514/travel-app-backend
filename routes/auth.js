// routes/auth.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// 註冊帳號
router.post('/signup', async (req, res) => {
  const { email, password, checkedPassword, userName } = req.body
  const { data, error } = await supabase.auth.signUp({ email, password, checkedPassword, userName })
  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

module.exports = router
