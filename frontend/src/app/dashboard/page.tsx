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
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
                <div className="p-4 rounded-xl glass">
                    <div className="text-sm muted">Signed in as</div>
                    <div className="font-semibold mt-1 break-all">{user.email}</div>
                    <div className="mt-3 text-sm muted">Role</div>
                    <div className="font-medium">{(user as any).role ?? 'student'}</div>
                    <div className="mt-4">
                        <button onClick={signOut} className="btn btn-outline">Sign out</button>
                    </div>
                </div>
            </aside>

            <main className="lg:col-span-3">
                <div className="p-6 rounded-xl glass">
                    <h2 className="text-2xl font-semibold">Welcome back</h2>
                    <p className="muted mt-1">Quick links and recent activity</p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                            <div className="text-sm muted">Enrolled courses</div>
                            <div className="font-semibold mt-2">{(user as any)?.enroll_count ?? 0}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                            <div className="text-sm muted">Progress</div>
                            <div className="font-semibold mt-2">{(user as any)?.progress ?? '0%'}</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">Recent activity</h3>
                        <div className="mt-3 space-y-2 text-sm muted">No recent activity yet.</div>
                    </div>
                </div>
            </main>
        </div>
    )
}
