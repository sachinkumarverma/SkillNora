"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import Loader from '@/components/ui/Loader'

export default function AuthCallback() {
    const router = useRouter()
    useEffect(() => {
        let mounted = true
        
        const { data: authListener } = authService.onAuthStateChange((event: any, session: any) => {
            if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && mounted) {
                router.replace('/dashboard')
            }
        })
        
        authService.getSession().then(({ data: { session } }) => {
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
        <Loader fullScreen />
    )
}
