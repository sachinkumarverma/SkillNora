"use client"
import React, { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import Link from 'next/link'

type Mode = 'signin' | 'signup' | 'magic' | 'reset'

function GoogleIcon() {
    return (
        <svg viewBox='0 0 48 48' aria-hidden='true' className='h-5 w-5'>
            <path fill='#FFC107' d='M43.611 20.083H42V20H24v8h11.303C33.655 32.659 29.369 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.158 7.961 3.047l5.657-5.657C34.412 6.053 29.476 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.648-.389-3.917z'/>
            <path fill='#FF3D00' d='M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.158 7.961 3.047l5.657-5.657C34.412 6.053 29.476 4 24 4 16.318 4 9.656 8.337 6.306 14.691z'/>
            <path fill='#4CAF50' d='M24 44c5.353 0 10.245-2.057 13.945-5.404l-6.437-5.44C29.474 34.978 26.947 36 24 36c-5.348 0-9.624-3.317-11.286-7.946l-6.52 5.025C9.51 39.556 16.227 44 24 44z'/>
            <path fill='#1976D2' d='M43.611 20.083H42V20H24v8h11.303a11.997 11.997 0 01-4.795 6.156l.003-.002 6.437 5.44C36.485 39.655 44 34 44 24c0-1.341-.138-2.648-.389-3.917z'/>
        </svg>
    )
}

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [mode, setMode] = useState<Mode>('signin')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
                setMessage(error ? error.message : 'Account created. Check your email to confirm your account.')
            } else if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                setMessage(error ? error.message : 'Signed in successfully. Redirecting to your dashboard...')
            } else if (mode === 'magic') {
                const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
                setMessage(error ? error.message : 'Magic link sent. Check your email and open the link to sign in.')
            } else {
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` })
                setMessage(error ? error.message : 'Password reset email sent. Open the link to set a new password.')
            }
        } catch (err: any) {
            setMessage(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function signInWithGoogle() {
        setLoading(true)
        setMessage(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
            if (error) setMessage(error.message)
        } catch (err: any) {
            setMessage(err.message)
        } finally {
            setLoading(false)
        }
    }

    const heading = mode === 'signup' ? 'Create your Skillnora account' : mode === 'magic' ? 'Sign in with a magic link' : mode === 'reset' ? 'Reset your password' : 'Sign in to Skillnora'
    const description = mode === 'signup'
        ? 'Create a new account with email and password, or use Google to continue faster.'
        : mode === 'magic'
            ? 'We will email you a secure login link. No password required for this mode.'
            : mode === 'reset'
                ? 'Enter your email and we will send a password reset link.'
                : 'Use your email and password, or continue with Google.'

    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="fixed inset-0 pointer-events-none grid-pattern opacity-[0.35]" />
            <div className="relative z-10 w-full grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <section className='surface rounded-[2rem] p-6 md:p-8'>
                    <div className='inline-flex rounded-full bg-blue-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700 dark:text-blue-200'>Authentication</div>
                    <h1 className='mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white'>{heading}</h1>
                    <p className='mt-4 max-w-2xl text-base leading-7 muted'>{description}</p>
                    <div className='mt-8 rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 p-6 text-white'>
                        <div className='text-sm font-semibold uppercase tracking-[0.25em] opacity-80'>Premium access</div>
                        <div className='mt-2 text-2xl font-bold'>Beautiful login, clean account recovery, and secure role-based access.</div>
                        <p className='mt-3 max-w-xl text-sm leading-6 opacity-90'>Magic link and password reset are both handled through Supabase email auth, while Google OAuth stays available as the faster sign-in path.</p>
                    </div>
                </section>

                <section className='surface rounded-[2rem] p-6 md:p-8'>
                    <div className='flex flex-wrap items-center gap-2'>
                        {[
                            ['signin', 'Sign in'],
                            ['signup', 'Sign up'],
                            ['magic', 'Magic link'],
                            ['reset', 'Forgot password'],
                        ].map(([value, label]) => (
                            <button key={value} type='button' onClick={() => setMode(value as Mode)} className={`btn px-4 py-2 ${mode === value ? 'btn-primary' : 'btn-outline'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
                        <div>
                            <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Email</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900' placeholder='you@domain.com' />
                        </div>

                        {(mode === 'signin' || mode === 'signup') && (
                            <div>
                                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Password</label>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900' placeholder='Enter your password' />
                            </div>
                        )}

                        <button disabled={loading} className='btn btn-primary w-full py-3'>
                            {mode === 'signup' ? 'Create account' : mode === 'magic' ? 'Send magic link' : mode === 'reset' ? 'Send reset email' : 'Sign in'}
                        </button>
                    </form>

                    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                        <button type='button' onClick={signInWithGoogle} className='btn btn-outline py-3'>
                            <GoogleIcon />
                            Continue with Google
                        </button>
                        <button type='button' onClick={() => setMode('magic')} className='btn btn-outline py-3'>Use magic link</button>
                    </div>

                    <div className='mt-6 flex flex-wrap items-center justify-between gap-3 text-sm'>
                        <button type='button' onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className='font-medium text-blue-600 dark:text-blue-300'>
                            {mode === 'signup' ? 'Have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                        <button type='button' onClick={() => setMode('reset')} className='font-medium text-blue-600 dark:text-blue-300'>Forgot password?</button>
                    </div>

                    <div className='mt-4 flex justify-end'>
                        <Link href='/' className='text-sm muted'>Back home</Link>
                    </div>

                    {message && <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'>{message}</div>}
                </section>
            </div>
        </main>
    )
}
