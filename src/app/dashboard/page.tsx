"use client"
import React from 'react'
import useUser from '../../lib/useUser'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'

export default function DashboardPage() {
    const { user, loading } = useUser()
    const router = useRouter()

    if (loading) return <div className="max-w-2xl mx-auto mt-12">Loading...</div>
    if (!user) {
        if (typeof window !== 'undefined') router.push('/auth')
        return null
    }

    async function signOut() {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="max-w-4xl mx-auto mt-12">
            <div className="p-6 rounded-xl glass">
                <h2 className="text-2xl font-semibold">Welcome back, {user.email}</h2>
                <p className="mt-2 text-slate-600">Role: {user.role ?? 'student'}</p>
                <div className="mt-4">
                    <button onClick={signOut} className="px-4 py-2 rounded-md border">Sign out</button>
                </div>
            </div>
        </div>
    )
}
