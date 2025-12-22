const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')
const upload = require('../utils/uploadConfig')

const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID
const LINE_CLIENT_SECRET = process.env.LINE_CLIENT_SECRET
const LINE_REDIRECT_URI = `${process.env.BACKEND_URL}/api/auth/line/callback`

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
        provider: 'email',
      },
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
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
        provider: 'email',
      },
      accessToken: data.session.access_token,
      refreshToken: data.session?.refresh_token,
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
      const { provider } = user?.app_metadata // user.provider 會是 'email', 'google', 'line', etc.
      // console.log('user', user)
      if (provider === 'email') {
        // 只有 email/password 用戶才可以改密碼
        if (newPassword && currentPassword) {
          // 1️⃣ 驗證舊密碼是否正確
          const { data: oldLogin, error: oldLoginError } =
            await supabase.auth.signInWithPassword({
              email: user.email,
              password: currentPassword,
            })

          if (oldLoginError) {
            return res.status(400).json({ error: '原密碼錯誤，請重新輸入。' })
          }

          // 2️⃣ 驗證通過 → 修改密碼
          const { error: passwordError } = await supabase.auth.updateUser(
            { password: newPassword },
            { headers: { Authorization: `Bearer ${token}` } },
          )

          if (passwordError) {
            return res.status(400).json({ error: passwordError.message })
          }
        } else if (newPassword || currentPassword) {
          return res.status(400).json({ error: '請同時提供舊密碼與新密碼。' })
        }
      } else {
        // Google / LINE 用戶不允許改密碼
        if (newPassword || currentPassword) {
          return res
            .status(400)
            .json({ error: '此帳號為第三方登入，無法修改密碼。' })
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
// Google OAuth 登入
router.get('/oauth/:provider', async (req, res) => {
  const { provider } = req.params

  if (!['google'].includes(provider)) {
    return res.status(400).json({ error: '不支援的登入方式' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'http://localhost:5173/auth/callback', // 前端 callback 頁面
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // 回傳 OAuth 登入網址
    res.status(200).json({ url: data.url })
  } catch (err) {
    res.status(500).json({ error: '伺服器錯誤', details: err.message })
  }
})

// get user info from google
router.post('/oauth/google/callback', async (req, res) => {
  const { accessToken } = req.body // 前端解析 hash 後送給後端

  try {
    // 用 Supabase accessToken 取得 user
    const { data, error } = await supabase.auth.getUser(accessToken)
    if (error || !data.user)
      return res.status(400).json({ error: '取得使用者資料失敗' })

    const user = data.user
    const avatar = user.user_metadata.avatar_url || null
    const provider = user.user_metadata.provider || 'google'

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        userName: user.user_metadata.userName,
        avatar,
        provider,
      },
      accessToken,
      refreshToken: user.refresh_token || null,
    })
  } catch (err) {
    res.status(500).json({ error: '伺服器錯誤', details: err.message })
  }
})

// Step 1: 導向 LINE 授權頁
router.get('/line', (req, res) => {
  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINE_REDIRECT_URI)}&state=${Date.now()}&scope=profile%20openid%20email`
  res.redirect(lineAuthUrl)
})

// Step 2: LINE callback
router.get('/line/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.status(400).send('No code returned from LINE')

  try {
    // 1️⃣ 換取 LINE access token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CLIENT_ID,
        client_secret: LINE_CLIENT_SECRET,
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) return res.status(400).json(tokenData)

    const { access_token } = tokenData

    // 2️⃣ 取得 LINE profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const profile = await profileRes.json() // userId, displayName, pictureUrl

    // 3️⃣ 在 Supabase Auth 中創建或登入使用者
    const lineEmail = `${profile.userId}@line.local` // 假設 LINE 沒有 email
    const password = Math.random().toString(36).slice(-12) // 隨機密碼
    let user

    // 嘗試用 email 登入
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: lineEmail,
        password,
      })

    if (signInError) {
      // 如果沒有帳號，創建新帳號
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: lineEmail,
          password,
          options: {
            data: {
              userName: profile.displayName,
              profileImage: profile.pictureUrl,
              provider: 'line',
              lineId: profile.userId,
            },
          },
        })

      if (signUpError)
        return res.status(400).json({ error: signUpError.message })
      user = signUpData.user
    } else {
      user = signInData.user
    }

    // 4️⃣ 更新 users 表格
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .upsert([
        {
          id: user.id,
          email: user.email,
          user_name: profile.displayName,
          line_id: profile.userId,
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (dbError) return res.status(400).json({ error: dbError.message })

    // 5️⃣ 回傳 access token 給前端
    res.status(200).json({
      message: 'LINE 登入成功',
      user: {
        id: user.id,
        userName: profile.displayName,
        profileImage: profile.pictureUrl,
        provider: 'line',
        lineId: profile.userId,
      },
      accessToken: tokenData.access_token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'LINE OAuth 登入失敗', details: err.message })
  }
})

module.exports = router
