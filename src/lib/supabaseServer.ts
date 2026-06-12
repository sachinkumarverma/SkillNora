import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceRole) {
    // Do not throw — allow app to start; server API routes should validate and surface errors.
    console.warn('Supabase server client not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.')
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false }
})

export default supabaseServer
