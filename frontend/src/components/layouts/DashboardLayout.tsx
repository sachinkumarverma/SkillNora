"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useUser from '../../lib/useUser'
import supabase from '../../lib/supabaseClient'

function getRole(user: any) {
    return user?.user_metadata?.role || user?.app_metadata?.role || 'student'
}

function getAvatar(user: any) {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL || null
}

export default function DashboardLayout({ children, title, breadcrumbs = [] }: { children: React.ReactNode, title: string, breadcrumbs?: { label: string, href?: string }[] }) {
    const { user, loading } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const role = useMemo(() => getRole(user), [user])
    const avatarUrl = useMemo(() => getAvatar(user), [user])
    
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [dark, setDark] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        const nextDark = stored === 'dark'
        setDark(nextDark)
        document.documentElement.classList.toggle('dark', nextDark)
    }, [])

    useEffect(() => {
        if (!loading && !user) router.replace('/auth')
    }, [loading, user, router])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (loading || !user) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
    )

    async function signOut() {
        await supabase.auth.signOut()
        router.push('/')
    }

    function toggleTheme() {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    const initials = (user.email || 'SN').slice(0, 2).toUpperCase()

    const sidebarItemsByRole = {
        student: [
            ['/dashboard', 'Dashboard', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'], 
            ['/courses', 'My Courses', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'], 
            ['/wishlist', 'Wishlist', 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'], 
            ['/certificates', 'Certificates', 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'], 
        ],
        instructor: [
            ['/dashboard', 'Dashboard', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'], 
            ['/instructor', 'Instructor Studio', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'], 
            ['/instructor/new', 'Course Builder', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'], 
        ],
        admin: [
            ['/dashboard', 'Dashboard', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'], 
            ['/admin', 'Approvals', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'], 
            ['/admin/users', 'Users', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'], 
        ],
    } as const

    const sidebarItems = sidebarItemsByRole[role as keyof typeof sidebarItemsByRole] || sidebarItemsByRole.student

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans fixed inset-0 z-50">
            {/* Sidebar */}
            <aside className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 relative z-20`}>
                <div className="flex h-16 items-center px-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden cursor-pointer w-full">
                        <img src="/logo.png" alt="Skillnora" className="h-8 w-8 shrink-0 object-contain" />
                        {sidebarOpen && <span className="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase whitespace-nowrap">Skillnora</span>}
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3 mt-4 custom-scrollbar">
                    {sidebarItems.map(([path, label, iconPath]) => {
                        const isActive = pathname === path || (path !== '/dashboard' && pathname.startsWith(path))
                        return (
                            <Link key={path} href={path} className={`group flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors ${isActive ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} /></svg>
                                {sidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white dark:bg-slate-700 dark:ring-slate-900 overflow-hidden shadow-sm">
                            {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{initials}</span>}
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900"></div>
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0 overflow-hidden">
                                <div className="truncate text-sm font-bold text-slate-900 dark:text-white capitalize">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                                <div className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{role}</div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex flex-1 flex-col overflow-hidden relative z-10">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        
                        <div className="flex items-center text-sm font-semibold">
                            {breadcrumbs.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {breadcrumbs.map((bc, idx) => (
                                        <React.Fragment key={idx}>
                                            {bc.href ? <Link href={bc.href} className="text-slate-400 hover:text-blue-600 transition-colors">{bc.label}</Link> : <span className="text-slate-900 dark:text-white">{bc.label}</span>}
                                            {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Global Search..." className="w-64 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500" />
                        </div>
                        
                        <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                            {dark ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 transition hover:bg-slate-100 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm overflow-hidden">
                                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                                        <p className="text-xs font-medium text-slate-500 capitalize mt-1">Role: {role}</p>
                                    </div>
                                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Profile Settings
                                    </button>
                                    <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}
