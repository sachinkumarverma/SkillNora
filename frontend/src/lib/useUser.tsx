'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import apiClient from '@/lib/apiClient'

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function fetchFullProfile(sessionUser: any, token: string) {
            if (!sessionUser) return null;
            try {
                const res = await apiClient.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
            if (sessionUser && data.session?.access_token) {
                sessionUser = await fetchFullProfile(sessionUser, data.session.access_token);
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
            if (sessionUser && session?.access_token) {
                sessionUser = await fetchFullProfile(sessionUser, session.access_token);
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
