import nc from 'next-connect';
import cors from 'cors';
import axios from 'axios';

const DeepL_API_KEY = process.env.DEEPL_API_KEY;

// 語言代碼轉換
const normalizeLangCode = (lang) => {
  if (!lang) return 'EN';
  if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn')
    return 'ZH';
  if (lang.toLowerCase() === 'fr-fr') return 'FR';
  return lang.toUpperCase();
};

// 建立 handler
const handler = nc()
  .use(
    cors({
      origin: [
        'https://travel-app-frontend-navy.vercel.app',
        'http://localhost:5173',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    })
  )
  .use((req, res, next) => {
    // 簡單模擬 express.json()
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data || '{}');
      } catch {
        req.body = {};
      }
      next();
    });
  })
  .post(async (req, res) => {
    const { text, sourceLang, targetLang } = req.body;

    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        new URLSearchParams({
          auth_key: DeepL_API_KEY,
          text,
          source_lang: normalizeLangCode(sourceLang),
          target_lang: normalizeLangCode(targetLang),
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      res.status(200).json(response.data);
    } catch (err) {
      if (err.response) {
        console.error('DeepL API Error:', err.response.status, err.response.data);
        res.status(err.response.status).json(err.response.data);
      } else if (err.request) {
        console.error('No response from DeepL API:', err.request);
        res.status(500).json({ error: 'No response from DeepL API' });
      } else {
        console.error('Axios error:', err.message);
        res.status(500).json({ error: err.message });
      }
    }
  });

export default handler;
