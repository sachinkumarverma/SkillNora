"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function AuthCallback() {
    const router = useRouter()
    useEffect(() => {
        let mounted = true
        let hasSynced = false
        
        const handleSession = async (session: any) => {
            if (!session?.user || hasSynced) return
            hasSynced = true
            try {
                await apiClient.post('/api/users/sync', {
                    id: session.user.id,
                    email: session.user.email,
                    role: 'student',
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                    avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || ''
                })
            } catch (err) {
                console.error('Failed to sync user on callback', err)
            }
            if (mounted) {
                router.replace('/dashboard')
            }
        }

        const { data: authListener } = authService.onAuthStateChange((event: any, session: any) => {
            if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && mounted) {
                handleSession(session)
            }
        })
        
        authService.getSession().then(({ data: { session } }) => {
            if (session && mounted) {
                handleSession(session)
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
