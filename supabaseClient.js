// supabaseClient.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)
function assertAscii(label, v) {
  const s = String(v ?? '')
  if (/[^\x00-\x7F]/.test(s)) {
    throw new Error(`[ENV NON-ASCII] ${label} has non-ascii: ${s.slice(0, 30)}`)
  }
}

assertAscii('SUPABASE_URL', process.env.SUPABASE_URL)
assertAscii(
  'SUPABASE_KEY',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
)

console.log(
  '[ENV] SUPABASE_URL:',
  String(process.env.SUPABASE_URL).slice(0, 30),
)
console.log(
  '[ENV] SUPABASE_KEY preview:',
  String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  ).slice(0, 15),
)

module.exports = supabase
