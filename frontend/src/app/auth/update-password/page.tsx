"use client"
import React, { useState } from 'react'
import supabase from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.')
            return
        }

        setLoading(true)
        setMessage(null)
        const { error } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (error) {
            setMessage(error.message)
            return
        }

        setMessage('Password updated successfully. Redirecting...')
        setTimeout(() => router.push('/dashboard'), 1200)
    }

    return (
        <div className='mx-auto max-w-xl surface rounded-[2rem] p-6 md:p-8'>
            <h1 className='text-3xl font-black text-slate-950 dark:text-white'>Set a new password</h1>
            <p className='mt-2 text-sm muted'>Use the link from your reset email to come here, then create a new password.</p>
            <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>New password</label>
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-900' />
                </div>
                <div>
                    <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200'>Confirm password</label>
                    <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-900' />
                </div>
                <button disabled={loading} className='btn btn-primary w-full py-3'>Update password</button>
            </form>
            {message && <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'>{message}</div>}
        </div>
    )
}
