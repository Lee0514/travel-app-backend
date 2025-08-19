export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, sourceLang, targetLang } = req.body

  // 暫時回傳模擬數據來測試
  res.status(200).json({
    message: 'Translation endpoint working!',
    received: { text, sourceLang, targetLang },
    timestamp: new Date().toISOString()
  })
}