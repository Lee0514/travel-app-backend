const { phrases } = require('../data/phrasesData');

const normalizeLangCode = (lang) => {
  if (!lang) return 'EN';
  if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn') return 'ZH';
  if (lang.toLowerCase() === 'fr-fr') return 'FR';
  return lang.toUpperCase();
};

export default function handler(req, res) {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { lang } = req.query;
    
    if (Array.isArray(lang)) {
      lang = lang[0];
    }
    
    lang = lang ? normalizeLangCode(lang).toLowerCase() : 'en';
    const result = phrases[lang] || {};
    
    res.status(200).json(result);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
}