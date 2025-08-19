const express = require('express')
const router = express.Router()
const { phrases } = require('../data/phrasesData')

const normalizeLangCode = (lang) => {
  if (!lang) return 'EN'
  if (lang.toLowerCase() === 'zh-tw' || lang.toLowerCase() === 'zh-cn') return 'ZH'
  if (lang.toLowerCase() === 'fr-fr') return 'FR'
  return lang.toUpperCase()
}

router.get('/', (req, res) => {
  let { lang } = req.query
  if (Array.isArray(lang)) lang = lang[0]
  lang = lang ? normalizeLangCode(lang).toLowerCase() : 'en'
  const result = phrases[lang] || {}
  res.json(result)
})

module.exports = router
