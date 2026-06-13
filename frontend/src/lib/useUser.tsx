'use client'
import { useEffect, useState } from 'react'
import supabase from './supabaseClient'

export default function useUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function init() {
            const { data } = await supabase.auth.getSession()
            if (!active) return
            setUser(data.session?.user ?? null)
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
