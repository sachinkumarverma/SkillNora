'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import apiClient from '@/lib/apiClient'

let profilePromise: Promise<any> | null = null;
let profileCache: any = null;

async function fetchFullProfile(sessionUser: any, token: string, forceRefetch = false) {
    if (!sessionUser) return null;
    
    if (!forceRefetch && profileCache !== null) {
        return profileCache;
    }
    if (!forceRefetch && profilePromise) {
        return profilePromise;
    }

    profilePromise = (async () => {
        try {
            const res = await apiClient.get('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.user) {
                profileCache = { 
                    ...sessionUser, 
                    ...res.data.user,
                    user_metadata: { 
                        ...sessionUser.user_metadata, 
                        ...(res.data.user.user_metadata || {}) 
                    } 
                };
                return profileCache;
            }
        } catch (e) {
            console.error("Failed to fetch full user profile", e);
        } finally {
            profilePromise = null;
        }
        return sessionUser;
    })();

    return profilePromise;
}

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

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
            if (_event === 'SIGNED_OUT') {
                profileCache = null;
                profilePromise = null;
            }
            if (!active) return;
            let sessionUser = session?.user ?? null;
            if (sessionUser && session?.access_token) {
                const forceRefetch = _event === 'SIGNED_IN';
                sessionUser = await fetchFullProfile(sessionUser, session.access_token, forceRefetch);
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
