import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Guard creation: avoid calling createBrowserClient with empty values (which throws at runtime)
let supabase: any = null

if (url && anonKey) {
    // Normal case: env is provided (browser)
    supabase = createBrowserClient(url, anonKey)
} else {
    // Graceful stub for development when env vars are missing.
    // This prevents Next from crashing with "supabaseUrl is required." and gives
    // clearer guidance to the developer. Real Supabase features will be disabled
    // until the proper env vars are set.
    const missingErr = new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to frontend/.env.local and restart the dev server.')
    supabase = {
        auth: {
            signInWithOtp: async () => ({ error: missingErr }),
            signUp: async () => ({ error: missingErr }),
            signInWithOAuth: async () => ({ error: missingErr }),
            signOut: async () => ({ error: missingErr }),
            getSession: async () => ({ data: { session: null }, error: missingErr })
        },
        from: () => ({ select: async () => ({ data: null, error: missingErr }) }),
        rpc: async () => ({ data: null, error: missingErr }),
    }
}

export default supabase
