import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// try default first (process.cwd()), then fallback to project root relative to this file
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
// debug: show which .env was picked up (if any)
// console.debug('ENV supabase url:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '[present]' : '[missing]')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceRole, { auth: { persistSession: false } })
export default supabase
