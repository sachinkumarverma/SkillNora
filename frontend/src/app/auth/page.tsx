"use client"
import React, { useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()

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
                if (error?.message?.toLowerCase().includes("rate limit")) {
                    setMessage("You can only request one magic link per minute. Please check your inbox or wait a bit.")
                } else {
                    setMessage(error ? error.message : 'Magic link sent. Check your email and open the link to sign in.')
                }
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
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/logo.png" alt="Skillnora" className="h-10 w-10 object-contain" />
                        <div className='inline-flex rounded-full bg-blue-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700 dark:text-blue-200'>Authentication</div>
                    </div>
                    <h1 className='mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white'>{heading}</h1>
                    <p className='mt-4 max-w-2xl text-base leading-7 muted'>{description}</p>
                    <div className='mt-8 rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden'>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className='text-xs font-bold uppercase tracking-[0.25em] opacity-80 mb-3 relative z-10'>Premium access</div>
                        <div className='text-3xl font-black leading-tight relative z-10'>Unlock your learning potential.</div>
                        <p className='mt-4 max-w-xl text-sm leading-relaxed opacity-90 relative z-10'>Sign in to access your wishlist, track certificates, and enroll in our world-class courses.</p>
                        <div className="mt-8 flex items-center gap-3 relative z-10">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-semibold opacity-90">Join 10,000+ learners</span>
                        </div>
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
                            <button key={value} type='button' onClick={() => setMode(value as Mode)} className={`btn px-4 py-2 transform transition hover:scale-[1.02] active:scale-95 ${mode === value ? 'btn-primary' : 'btn-outline'}`}>
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

                        <button disabled={loading} className='btn btn-primary w-full py-3 transform transition hover:scale-[1.02] active:scale-95'>
                            {mode === 'signup' ? 'Create account' : mode === 'magic' ? 'Send magic link' : mode === 'reset' ? 'Send reset email' : 'Sign in'}
                        </button>
                    </form>

                    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                        <button type='button' onClick={signInWithGoogle} className='btn btn-outline py-3 transform transition hover:scale-[1.02] active:scale-95'>
                            <GoogleIcon />
                            Continue with Google
                        </button>
                        <button type='button' onClick={() => setMode('magic')} className='btn btn-outline py-3 transform transition hover:scale-[1.02] active:scale-95'>Use magic link</button>
                    </div>

                    <div className='mt-6 flex flex-wrap items-center justify-between gap-3 text-sm'>
                        <button type='button' onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className='font-medium text-blue-600 dark:text-blue-300'>
                            {mode === 'signup' ? 'Have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                        <button type='button' onClick={() => setMode('reset')} className='font-medium text-blue-600 dark:text-blue-300'>Forgot password?</button>
                    </div>

                    <div className='mt-8 flex justify-center'>
                        <button type='button' onClick={() => router.push('/dashboard')} className='text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 dark:text-slate-400 dark:hover:text-white'>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Go to Dashboard
                        </button>
                    </div>

                    {message && <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm'>{message}</div>}
                </section>
            </div>
        </main>
    )
}
