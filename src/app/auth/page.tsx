"use client"
import React, { useState } from 'react'
import supabase from '../../lib/supabaseClient'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    async function signInWithEmail(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            const { error } = await supabase.auth.signInWithOtp({ email })
            if (error) setMessage(error.message)
            else setMessage('Check your email for the login link (magic link).')
        } catch (err: any) {
            setMessage(err.message)
        } finally { setLoading(false) }
    }

    async function signInWithProvider(provider: 'github' | 'google') {
        setLoading(true)
        setMessage(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider })
            if (error) setMessage(error.message)
        } catch (err: any) {
            setMessage(err.message)
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto mt-12">
            <div className="p-6 rounded-xl glass">
                <h2 className="text-2xl font-semibold">Sign in to Skillnora</h2>
                <form className="mt-4" onSubmit={signInWithEmail}>
                    <label className="block text-sm">Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-2 p-2 rounded-md border" placeholder="you@domain.com" />
                    <div className="mt-4 flex gap-3">
                        <button disabled={loading} className="px-4 py-2 bg-primary-500 text-white rounded-md">Send magic link</button>
                        <button type="button" onClick={() => signInWithProvider('github')} className="px-4 py-2 border rounded-md">Sign in with GitHub</button>
                        <button type="button" onClick={() => signInWithProvider('google')} className="px-4 py-2 border rounded-md">Sign in with Google</button>
                    </div>
                </form>
                {message && <div className="mt-3 text-sm text-slate-600">{message}</div>}
            </div>
        </div>
    )
}
