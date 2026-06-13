"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useUser from '../lib/useUser'
import Link from 'next/link'
import supabase from '../lib/supabaseClient'

function getRole(user: any) {
    return user?.user_metadata?.role || user?.app_metadata?.role || 'student'
}

function getAvatar(user: any) {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL || null
}

export default function Navbar() {
    const [dark, setDark] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const { user } = useUser()
    const role = useMemo(() => getRole(user), [user])
    const avatarUrl = getAvatar(user)

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        const nextDark = stored === 'dark'
        setDark(nextDark)
        document.documentElement.classList.toggle('dark', nextDark)
    }, [])

    useEffect(() => {
        function onClick(event: MouseEvent) {
            if (!panelRef.current?.contains(event.target as Node)) setMenuOpen(false)
        }
        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [])

    function toggleTheme() {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    async function signOut() {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const initials = (user?.email || 'SN').slice(0, 2).toUpperCase()

    return (
        <header className='sticky top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80'>
            <div className='mx-auto flex w-full max-w-none items-center justify-between px-4 py-4 sm:px-6 lg:px-10'>
                <Link href='/' className='flex items-center gap-3'>
                    <img src='/logo.png' alt='Skillnora logo' className='h-11 w-11 rounded-2xl object-cover shadow-lg shadow-blue-500/20' />
                    <div>
                        <div className='text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>Skillnora</div>
                        <div className='text-sm font-medium text-slate-900 dark:text-white'>Learn • Grow • Succeed</div>
                    </div>
                </Link>

                <div className='flex items-center gap-2'>
                    <Link href='/courses' className='btn btn-outline px-4 py-2'>Courses</Link>
                    {user && <Link href='/dashboard' className='btn btn-outline px-4 py-2'>Dashboard</Link>}
                    <button onClick={toggleTheme} className='btn btn-outline px-4 py-2'>{dark ? 'Light' : 'Dark'}</button>

                    {user ? (
                        <div className='relative' ref={panelRef}>
                            <button
                                onClick={() => setMenuOpen((value) => !value)}
                                className='flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900'
                                aria-label='Open account menu'
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt='User avatar' className='h-full w-full object-cover' />
                                ) : (
                                    <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 text-sm font-bold text-white'>
                                        {initials}
                                    </div>
                                )}
                            </button>

                            {menuOpen && (
                                <div className='absolute right-0 mt-3 w-80 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/15 dark:border-slate-700 dark:bg-slate-950'>
                                    <div className='flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900'>
                                        <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-bold text-white'>
                                            {avatarUrl ? <img src={avatarUrl} alt='User avatar' className='h-full w-full object-cover' /> : <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600'>{initials}</div>}
                                        </div>
                                        <div className='min-w-0'>
                                            <div className='truncate text-sm font-semibold text-slate-950 dark:text-white'>{user.email}</div>
                                            <div className='flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>
                                                <span className='inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] shadow'>G</span>
                                                {role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-4 space-y-2 text-sm'>
                                        <div className='rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200'>
                                            Role: <span className='font-semibold'>{role}</span>
                                        </div>
                                        <div className='rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200'>
                                            Account: <span className='font-semibold'>{user.email}</span>
                                        </div>
                                    </div>

                                    <div className='mt-4 flex gap-3'>
                                        <button onClick={signOut} className='btn btn-primary flex-1 py-3'>Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href='/auth' className='btn btn-primary px-5 py-2.5'>Sign in</Link>
                    )}
                </div>
            </div>
        </header>
    )
}
