const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')
const upload = require('../utils/uploadConfig')

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
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: '已成功登出' })
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤', details: error.message })
  }
})

// 編輯用戶資料
router.post(
  '/edit-profile',
  upload.single('profileImage'),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ error: '未提供認證 token' })
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token)
      if (userError || !user) {
        return res.status(401).json({ error: '無效的認證 token' })
      }

      const { userName, newPassword, currentPassword } = req.body
      const profileImage = req.file

      // 更新 userName

      if (userName && userName !== user.user_metadata.userName) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { userName },
        })
        if (metadataError) {
          return res.status(400).json({ error: metadataError.message })
        }

        const { error: dbError } = await supabase
          .from('users')
          .update({ user_name: userName })
          .eq('id', user.id)
        if (dbError) {
          return res.status(400).json({ error: dbError.message })
        }
      }

      // 上傳大頭照
      let imageUrl = user.user_metadata.profileImage || null
      if (profileImage) {
        const fileName = `${user.id}/${Date.now()}-${profileImage.originalname}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, profileImage.buffer, {
            contentType: profileImage.mimetype,
          })
        if (uploadError) {
          return res.status(400).json({ error: uploadError.message })
        }

        imageUrl = `${supabase.storage.from('avatars').getPublicUrl(fileName).publicUrl}`
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { profileImage: imageUrl },
        })
        if (metadataError) {
          return res.status(400).json({ error: metadataError.message })
        }
      }

      // 修改密碼
      if (newPassword && currentPassword) {
        const { error: passwordError } = await supabase.auth.updateUser(
          {
            password: newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (passwordError) {
          return res.status(400).json({ error: passwordError.message })
        }
      }

      res.status(200).json({
        message: '用戶資料更新成功',
        user: {
          id: user.id,
          email: user.email,
          userName: userName || user.user_metadata.userName,
          profileImage: imageUrl || user.user_metadata.profileImage,
        },
      })
    } catch (error) {
      res.status(500).json({ error: '伺服器錯誤', details: error.message })
    }
  },
)

module.exports = router
