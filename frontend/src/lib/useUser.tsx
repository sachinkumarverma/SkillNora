"use client"
import { useState, useEffect } from 'react'
import supabase from './supabaseClient'

export default function useUser() {
    const [user, setUser] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function init() {
            const { data } = await supabase.auth.getSession()
            if (!mounted) return
            setUser(data?.session?.user ?? null)
            setLoading(false)
        }

        init()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            mounted = false
            if (listener && typeof listener.subscription?.unsubscribe === 'function') listener.subscription.unsubscribe()
        }
    }, [])

    return { user, loading }
}
