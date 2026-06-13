import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const envMissingMessage = 'Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the root .env file.'

function createFallbackClient() {
    const missingError = new Error(envMissingMessage)
    const fallbackQuery = {
        select: async () => ({ data: null, error: missingError }),
        insert: async () => ({ data: null, error: missingError }),
        update: async () => ({ data: null, error: missingError }),
        delete: async () => ({ data: null, error: missingError }),
        eq: () => fallbackQuery,
        single: async () => ({ data: null, error: missingError }),
        maybeSingle: async () => ({ data: null, error: missingError }),
        order: () => fallbackQuery,
        limit: () => fallbackQuery,
    }

    return {
        auth: {
            getUser: async () => ({ data: { user: null }, error: missingError }),
            getSession: async () => ({ data: { session: null }, error: missingError }),
        },
        from: () => fallbackQuery,
        storage: {
            from: () => ({
                createSignedUploadUrl: async () => ({ data: null, error: missingError }),
            }),
        },
    }
}

export const supabase = supabaseUrl && supabaseServiceRole
    ? createClient(supabaseUrl, supabaseServiceRole, { auth: { persistSession: false } })
    : createFallbackClient()

export default supabase
