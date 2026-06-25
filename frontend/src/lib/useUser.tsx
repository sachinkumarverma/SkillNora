'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import apiClient from '@/lib/apiClient'

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function init() {
            const { data } = await supabase.auth.getSession()
            if (!active) return
            let sessionUser = data.session?.user ?? null;
            if (sessionUser) {
                try {
                    const res = await apiClient.get('/api/users/me');
                    if (res.data?.user) {
                        sessionUser = { ...sessionUser, user_metadata: { ...sessionUser.user_metadata, ...res.data.user } };
                    }
                } catch (e) {
                    console.error("Failed to fetch full user profile", e);
                }
            }
            setUser(sessionUser)
            setLoading(false)
        }

        init()

        const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            active = false
            listener.subscription.unsubscribe()
        }
    }, [])

    return { user, loading }
}
