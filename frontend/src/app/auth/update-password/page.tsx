"use client"
import React, { useState } from 'react'
import supabase from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        await supabase.auth.signOut()
        toast.success('Password updated successfully. Please sign in with your new password.')
        setTimeout(() => router.push('/auth'), 1500)
    }

    return (
        <div className='mx-auto max-w-xl surface rounded-xl p-6 md:p-8 mt-24 relative'>
            <Toaster position="top-center" richColors />
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-xl transition-all duration-300">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4 shadow-lg"></div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 animate-pulse">Updating...</p>
                </div>
            )}
            <h1 className='text-3xl font-black text-slate-950 dark:text-white'>Set a new password</h1>
            <p className='mt-2 text-sm muted'>Use the link from your reset email to come here, then create a new password.</p>
            <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>New password</label>
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-900' />
                </div>
                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Confirm password</label>
                    <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-900' />
                </div>
                <button disabled={loading} className='btn btn-primary w-full py-3'>Update password</button>
            </form>
        </div>
    )
}
