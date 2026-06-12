"use client"
import React, { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import Link from 'next/link'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            if (isSignUp) {
                // Sign up with email + password
                const { data, error } = await supabase.auth.signUp({ email, password })
                if (error) setMessage(error.message)
                else setMessage('Sign-up successful. Check your email to confirm.')
            } else {
                // Sign in via magic link
                const { error } = await supabase.auth.signInWithOtp({ email })
                if (error) setMessage(error.message)
                else setMessage('Check your email for the login link (magic link).')
            }
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
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass shadow-md">
                <h2 className="text-2xl font-semibold">{isSignUp ? 'Create an account' : 'Sign in to Skillnora'}</h2>
                <p className="text-sm muted mt-1">Access courses, progress tracking, and personalized AI study help.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm">Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-2 p-3 rounded-md border" placeholder="you@domain.com" />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="block text-sm">Password</label>
                            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full mt-2 p-3 rounded-md border" placeholder="Choose a password" />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button disabled={loading} className="btn btn-primary">{isSignUp ? 'Create account' : 'Send magic link'}</button>
                        <button type="button" onClick={() => signInWithProvider('github')} className="btn btn-outline">GitHub</button>
                        <button type="button" onClick={() => signInWithProvider('google')} className="btn btn-outline">Google</button>
                    </div>
                </form>

                <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => setIsSignUp(s => !s)} className="text-sm underline">{isSignUp ? 'Have an account? Sign in' : 'Create an account'}</button>
                    <Link href="/" className="text-sm">Back home</Link>
                </div>

                {message && <div className="mt-3 text-sm text-slate-600">{message}</div>}
            </div>
        </div>
    )
}
