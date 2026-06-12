"use client"
import React, { useEffect, useState } from 'react'
import useUser from '../lib/useUser'
import Link from 'next/link'
import supabase from '../lib/supabaseClient'

export default function Navbar() {
    const [dark, setDark] = useState(false)
    const { user } = useUser()

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        if (stored === 'dark') {
            document.documentElement.classList.add('dark')
            setDark(true)
        }
    }, [])

    function toggle() {
        const next = !dark
        setDark(next)
        if (next) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    async function signOut() {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <header className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">SN</div>
                        <span className="font-semibold">Skillnora</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="/courses" className="text-sm hover:underline">Courses</Link>
                    <Link href="/payments" className="text-sm hover:underline">Payments</Link>
                    {!user ? (
                        <Link href="/auth" className="btn btn-primary">Sign in</Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="text-sm">Dashboard</Link>
                            <button onClick={signOut} className="btn btn-outline">Sign out</button>
                        </div>
                    )}
                    <button onClick={toggle} className="btn btn-outline">{dark ? 'Light' : 'Dark'}</button>
                </nav>
            </div>
        </header>
    )
}
