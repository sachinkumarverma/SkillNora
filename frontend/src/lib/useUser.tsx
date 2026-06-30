'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import apiClient from '@/lib/apiClient'

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function fetchFullProfile(sessionUser: any) {
            if (!sessionUser) return null;
            try {
                const res = await apiClient.get('/api/users/me');
                if (res.data?.user && active) {
                    return { 
                        ...sessionUser, 
                        ...res.data.user,
                        user_metadata: { 
                            ...sessionUser.user_metadata, 
                            ...(res.data.user.user_metadata || {}) 
                        } 
                    };
                }
            } catch (e) {
                console.error("Failed to fetch full user profile", e);
            }
            return sessionUser;
        }

        async function init() {
            const { data } = await supabase.auth.getSession()
            if (!active) return
            let sessionUser = data.session?.user ?? null;
            if (sessionUser) {
                sessionUser = await fetchFullProfile(sessionUser);
            }
            if (active) {
                setUser(sessionUser)
                setLoading(false)
            }
        }

        init()

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
            if (!active) return;
            let sessionUser = session?.user ?? null;
            if (sessionUser) {
                sessionUser = await fetchFullProfile(sessionUser);
            }
            if (active) {
                setUser(sessionUser)
                setLoading(false)
            }
        })

        return () => {
            active = false
            listener.subscription.unsubscribe()
        }
    }, [])

    return { user, loading }
}
