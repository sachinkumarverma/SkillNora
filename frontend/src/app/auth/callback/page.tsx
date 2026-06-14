"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabaseClient'

export default function AuthCallback() {
    const router = useRouter()
    useEffect(() => {
        let mounted = true
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && mounted) {
                router.replace('/dashboard')
            }
        })
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && mounted) {
                router.replace('/dashboard')
            }
        })
        
        return () => { 
            mounted = false
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe()
            }
        }
    }, [router])
    
    return (
        <div className="flex h-[70vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">Authenticating</div>
            </div>
        </div>
    )
}
