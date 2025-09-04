const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// 註冊帳號
router.post('/signup', async (req, res) => {
  const { email, password, passwordCheck, userName } = req.body

  // 輸入驗證
  if (!email || !password || !userName) {
    return res.status(400).json({ error: '請提供 email、密碼和使用者名稱' })
  }
  if (password !== passwordCheck) {
    return res.status(400).json({ error: '密碼與確認密碼不一致' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: '密碼長度必須至少 8 個字符' })
  }

  try {
    // 檢查 email 是否已存在於 users 表
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: '此 email 已註冊' })
    }
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 表示無結果
      return res.status(500).json({ error: '檢查 email 時發生錯誤' })
    }

    // Supabase 註冊
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { userName }, // 將 userName 存到 user_metadata
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // 將資料插入 users 表
    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: data.user.id, // 使用 Supabase 自動生成的 user ID
          email,
          user_name: userName,
          created_at: new Date(),
        },
      ])

      if (dbError) {
        return res.status(400).json({ error: dbError.message })
      }
    }

    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        userName: data.user.user_metadata.userName,
      },
    })
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // 輸入驗證
  if (!email || !password) {
    return res.status(400).json({ error: '請提供 email 和密碼' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        userName: data.user.user_metadata.userName,
      },
      accessToken: data.session.access_token, // 返回 JWT token
    })
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: '請提供 email' })
  }

  try {
    const { data, error } = await supabase.auth.resend({
      email,
      type: 'signup', // 指定為註冊驗證
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: '驗證信已重新發送，請檢查您的郵件' })
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// 登出
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: '未提供認證 token' })
    }

    // 執行登出
    const { error } = await supabase.auth.signOut() // 這將終止與 token 相關的會話
    if (error) {
      console.error('SignOut error:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: '已成功登出' })
  } catch (error) {
    console.error('Server error details:', error.stack)
    res.status(500).json({ error: '伺服器錯誤', details: error.message })
  }
})

module.exports = router
