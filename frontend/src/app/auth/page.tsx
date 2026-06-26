"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import Loader from '@/components/ui/Loader'

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
    const [mode, setMode] = useState<Mode>('signin')
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isInstructor, setIsInstructor] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if ((mode === 'signin' || mode === 'signup') && password.length < 6) {
            toast.error('Password must be at least 6 characters.')
            return
        }

        setLoading(true)

        let isSuccessRedirect = false;

        try {
            if (mode === 'signup') {
                const { data, error } = await authService.signUp(email, password, isInstructor ? 'instructor' : 'student', fullName)
                if (error) {
                    if (error.message.toLowerCase().includes("already registered")) {
                        toast.error('An account with this email already exists. Please sign in instead.')
                    } else {
                        toast.error(error.message)
                    }
                } else if (data?.user?.identities && data.user.identities.length === 0) {
                    toast.error('An account with this email already exists. Please sign in instead.')
                } else {
                    if (data?.user) {
                        // Sync user to backend users table
                        await apiClient.post('/api/users/sync', { 
                            id: data.user.id, 
                            email: data.user.email, 
                            role: isInstructor ? 'instructor' : 'student',
                            full_name: fullName
                        }).catch(() => {})
                    }
                    toast.success('Account created. Check your email to confirm your account.')
                }
            } else if (mode === 'signin') {
                const { error } = await authService.signInWithPassword(email, password)
                if (error) {
                    if (error.message.toLowerCase().includes("invalid login credentials")) {
                        toast.error('Invalid email or password.')
                    } else {
                        toast.error(error.message)
                    }
                } else {
                    isSuccessRedirect = true;
                    router.push('/dashboard')
                }
            } else if (mode === 'magic') {
                const { error } = await authService.signInWithOtp(email)
                if (error) {
                    toast.error(error.message)
                } else {
                    toast.success('Magic link sent! Check your email.')
                }
            } else if (mode === 'reset') {
                const { error } = await authService.resetPasswordForEmail(email)
                if (error) {
                    toast.error(error.message)
                } else {
                    toast.success('Password reset email sent!')
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred.')
        } finally {
            if (!isSuccessRedirect) {
                setLoading(false)
            }
        }
    }

    async function handleGoogleLogin() {
        try {
            const { error } = await authService.signInWithOAuth('google')
            if (error) toast.error(error.message)
        } catch (error: any) {
            toast.error(error.message || 'Failed to initialize Google login.')
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
            {loading && <Loader fullScreen />}
            <div className="fixed inset-0 pointer-events-none grid-pattern opacity-[0.35]" />
            <div className="relative z-10 w-full grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <section className='surface rounded-xl p-6 md:p-8'>
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/logo.png" alt="Skillnora" className="h-10 w-10 object-contain" />
                        <div className='inline-flex rounded-full bg-blue-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700 dark:text-blue-200'>Authentication</div>
                    </div>
                    <h1 className='mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white'>{heading}</h1>
                    <p className='mt-4 max-w-2xl text-base leading-7 muted min-h-[56px]'>{description}</p>
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

                <section className='surface rounded-xl p-6 md:p-8'>
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

                    <form className='mt-6 flex flex-col gap-4' onSubmit={handleSubmit}>
                        <div className="min-h-[320px] space-y-4">
                            {mode === 'signup' && (
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Full Name</label>
                                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900' placeholder='Your full name' />
                                </div>
                            )}

                            <div>
                                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Email</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900' placeholder='you@domain.com' />
                            </div>

                            {(mode === 'signin' || mode === 'signup') && (
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Password</label>
                                    <div className="relative">
                                        <input 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            type={showPassword ? 'text' : 'password'} 
                                            className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 pr-10' 
                                            placeholder='Enter your password' 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {mode === 'signup' && (
                                <label className="flex items-center gap-3 cursor-pointer group pt-2" onClick={() => setIsInstructor(!isInstructor)}>
                                    <div className={`relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${isInstructor ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                                        {isInstructor && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Sign up as an Instructor</span>
                                </label>
                            )}
                        </div>

                        <button disabled={loading} className='btn btn-primary w-full py-3 transform transition hover:scale-[1.02] active:scale-95'>
                            {mode === 'signup' ? 'Create account' : mode === 'magic' ? 'Send magic link' : mode === 'reset' ? 'Send reset email' : 'Sign in'}
                        </button>
                    </form>

                    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                        <button type='button' onClick={handleGoogleLogin} className='btn btn-outline py-3 transform transition hover:scale-[1.02] active:scale-95'>
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
                </section>
            </div>
        </main>
    )
}
