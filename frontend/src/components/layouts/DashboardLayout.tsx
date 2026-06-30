"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useUser from '@/lib/useUser'
import { authService } from '@/services/authService'
import AskieBot from '@/components/AskieBot'
import Loader from '@/components/ui/Loader'

function getRole(user: any) {
    if (user?.email === 'sachinverma1489@gmail.com') return 'admin'
    return user?.user_metadata?.role || user?.app_metadata?.role || 'student'
}

function getAvatar(user: any) {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.photoURL || null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const role = useMemo(() => getRole(user), [user])
    const avatarUrl = useMemo(() => getAvatar(user), [user])

    const PATH_LABELS: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/courses': 'Courses',
        '/enrolled': 'Enrolled',
        '/coding': 'Code Playground',
        '/notes': 'Notes',
        '/statistics': 'Statistics',
        '/wishlist': 'Wishlist',
        '/certificates': 'Certificates',
        '/settings': 'Account Details',
        '/contact': 'Contact Support',
        
        '/instructor': 'Instructor Studio',
        '/instructor/courses': 'Course Management',
        '/instructor/ai': 'AI Studio',
        '/instructor/drafts': 'Draft Courses',
        '/instructor/new': 'Course Builder',
        '/instructor/payments': 'Payments & Enrollments',
        
        '/admin': 'Admin Portal',
        '/admin/courses': 'Course Management',
        '/admin/instructors': 'Instructor Management',
        '/admin/students': 'Student Management',
        '/admin/payments': 'Payments & Enrollments',
        '/admin/tickets': 'Support Tickets',
        '/admin/ai': 'AI Studio',
        '/admin/settings': 'System Settings',
        '/admin/audit-logs': 'Audit Logs',
        '/admin/drafts': 'Draft Courses',
        '/admin/courses/new': 'Course Builder'
    }

    const breadcrumbs = useMemo(() => {
        const parts = pathname?.split('/').filter(Boolean) || []
        if (parts.length === 0) return [{ label: 'Dashboard' }]

        const crumbs: {label: string, href?: string}[] = []
        let currentPath = ''

        // Special handling if the path is exactly /admin or /instructor
        if (pathname === '/admin') return [{ label: 'Overview' }]
        if (pathname === '/instructor') return [{ label: 'Instructor Studio' }]

        parts.forEach((part, index) => {
            currentPath += `/${part}`
            
            // Skip the root 'admin' or 'instructor' part from breadcrumbs if there are more parts
            if ((part === 'admin' || part === 'instructor') && parts.length > 1 && index === 0) {
                return
            }

            // Handle UUIDs and numeric IDs
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part) || /^\d+$/.test(part)) {
                // For student paths, ignore UUIDs as per original behavior
                if (!currentPath.includes('/admin') && !currentPath.includes('/instructor')) {
                    if (crumbs.length > 0 && crumbs[crumbs.length - 1].href) {
                        crumbs[crumbs.length - 1].href += `/${part}`
                    }
                    return
                }
                
                let label = 'Details'
                if (currentPath.includes('/payments/')) label = 'View Receipt'
                else if (currentPath.includes('/instructors/') || currentPath.includes('/students/')) label = 'View Profile'
                else if (currentPath.includes('/courses/edit/')) label = 'Edit Course'
                else if (currentPath.includes('/courses/')) label = 'Course Details'
                else if (currentPath.includes('/drafts/')) label = 'Draft Details'
                crumbs.push({ label, href: currentPath })
                return
            }

            let label = part
            if (PATH_LABELS[currentPath]) {
                label = PATH_LABELS[currentPath]
            } else {
                label = part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
            crumbs.push({ label, href: currentPath })
        })

        if (crumbs.length > 0) delete crumbs[crumbs.length - 1].href
        return crumbs
    }, [pathname])

    const title = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard'

    
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [dark, setDark] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setSidebarOpen(true)
        }
    }, [])
    const searchRef = useRef<HTMLDivElement>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])

    useEffect(() => {
        const updateCart = async () => {
            if (user) {
                try {
                    const cartModule = await import('@/services/cartService')
                    const cart = await cartModule.cartService.getCart()
                    setCartCount(cart.length)
                } catch { setCartCount(0) }
            } else {
                const cart = JSON.parse(localStorage.getItem('skillnora_cart') || '[]')
                setCartCount(cart.length)
            }
        }
        updateCart()
        window.addEventListener('cartUpdated', updateCart)
        return () => window.removeEventListener('cartUpdated', updateCart)
    }, [user])

    useEffect(() => {
        if (user) {
            import('@/lib/apiClient').then(({ default: apiClient }) => {
                apiClient.get('/api/notifications/user').then(res => {
                    if (res && res.data && res.data.notifications) {
                        setNotifications(res.data.notifications)
                    }
                }).catch(console.error)
            })
        }
    }, [user])

    const markNotificationsRead = () => {
        import('@/lib/apiClient').then(({ default: apiClient }) => {
            apiClient.post('/api/notifications/read').then(() => {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            }).catch(console.error)
        })
    }

    const suggestions = useMemo(() => {
        return []
    }, [searchQuery])

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowSuggestions(false)
            router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    useEffect(() => {
        setSearchQuery('')
        setShowSuggestions(false)
    }, [pathname])

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        const nextDark = stored === 'dark'
        setDark(nextDark)
        document.documentElement.classList.toggle('dark', nextDark)
    }, [])

    useEffect(() => {
        if (!loading && !user) {
            const protectedPaths = ['/cart', '/wishlist', '/certificates', '/settings', '/admin', '/instructor', '/enrolled', '/notes', '/statistics', '/coding']
            const isProtected = protectedPaths.some(p => pathname.startsWith(p))
            const isPublicCertificate = pathname.match(/^\/certificates\/[^/]+$/)
            
            if (isProtected && !isPublicCertificate) {
                router.replace('/auth')
            }
        } else if (!loading && user) {
            if (pathname === '/dashboard') {
                if (role === 'admin') router.replace('/admin')
                else if (role === 'instructor') router.replace('/instructor')
            }
            
            const studentOnlyPaths = ['/cart', '/wishlist', '/enrolled', '/notes', '/statistics', '/coding']
            if ((role === 'admin' || role === 'instructor') && studentOnlyPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
                router.replace(role === 'admin' ? '/admin' : '/instructor')
            }

            if (pathname.startsWith('/admin') && role !== 'admin') {
                router.replace(role === 'instructor' ? '/instructor' : '/dashboard')
            }

            if (pathname.startsWith('/instructor') && role !== 'instructor') {
                router.replace(role === 'admin' ? '/admin' : '/dashboard')
            }
        }
    }, [loading, user, pathname, router, role])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const isRedirecting = !loading && user && (
        (pathname === '/dashboard' && (role === 'admin' || role === 'instructor')) ||
        ((role === 'admin' || role === 'instructor') && ['/cart', '/wishlist', '/enrolled', '/notes', '/statistics', '/coding'].some(p => pathname === p || pathname.startsWith(p + '/'))) ||
        (pathname.startsWith('/admin') && role !== 'admin') ||
        (pathname.startsWith('/instructor') && role !== 'instructor')
    )

    if (loading || isLoggingOut || isRedirecting) return <Loader fullScreen />

    async function signOut() {
        setDropdownOpen(false)
        setIsLoggingOut(true)
        await authService.logout()
        router.push('/auth')
    }

    function toggleTheme() {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    const initials = user ? (user.email || 'SN').slice(0, 2).toUpperCase() : 'SN'

    const sidebarItemsByRole = {
        student: [
            ['/dashboard', 'Dashboard', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'], 
            ['/courses', 'Courses', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'], 
            ['/enrolled', 'Enrolled', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
            ['/coding', 'Coding', 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'],
            ['/notes', 'Notes', 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'],
            ['/statistics', 'Statistics', 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z'],
            ['/wishlist', 'Wishlist', 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'], 
            ['/certificates', 'Certificates', 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'], 
            ['/settings', 'Account Details', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
            ['/contact', 'Contact Support', 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'],
            // ['https://cv-pilot-ai.vercel.app/', 'Create Resume', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z']
        ],
        instructor: [
            ['/instructor', 'Instructor Studio', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'], 
            ['/instructor/courses', 'Course Management', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'],
            ['/instructor/ai', 'AI Studio', 'M13 10V3L4 14h7v7l9-11h-7z'],
            ['/instructor/payments', 'Payments & Enrollments', 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'],
            ['/settings', 'Account Details', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
            ['/contact', 'Contact Support', 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z']
        ],
        admin: [
            ['/admin', 'Overview', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'], 
            ['/admin/courses', 'Course Management', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'], 
            ['/admin/instructors', 'Instructor Management', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'], 
            ['/admin/students', 'Student Management', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],  
            ['/admin/payments', 'Payments & Enrollments', 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'], 
            ['/admin/certificates', 'Certificates', 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'],
            ['/admin/reviews', 'Reviews & Ratings', 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'], 
            ['/admin/ai', 'AI Content', 'M13 10V3L4 14h7v7l9-11h-7z'], 
            ['/admin/notifications', 'Notifications', 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'], 

            ['/settings', 'Settings', 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'], 
            ['/admin/audit-logs', 'Audit Logs', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'], 
            ['/admin/promotions', 'Promotions', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
            ['/admin/support', 'Support Tickets', 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z']
        ],
    } as const

    let sidebarItems = sidebarItemsByRole[role as keyof typeof sidebarItemsByRole] || sidebarItemsByRole.student
    if (!user) {
        sidebarItems = sidebarItems.filter(item => !['/wishlist', '/certificates', '/settings', '/enrolled', '/notes', '/statistics', '/coding'].includes(item[0])) as any
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans fixed inset-0 z-50">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 md:z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:relative md:translate-x-0 shrink-0 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:w-20'}`}>
                <div className="flex h-16 items-center px-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden cursor-pointer w-full">
                        <img src="/logo.png" alt="Skillnora" className="h-8 w-8 shrink-0 object-contain" />
                        {sidebarOpen && <span className="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase whitespace-nowrap">Skillnora</span>}
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3 mt-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {sidebarItems.map(([path, label, iconPath]) => {
                        const isActive = pathname === path || (path !== '/' && path !== '/dashboard' && path !== '/admin' && path !== '/instructor' && pathname.startsWith(path + '/'))
                        const isExternal = path.startsWith('http')
                        return (
                            <Link 
                                key={path} 
                                href={path} 
                                target={isExternal ? '_blank' : undefined} 
                                rel={isExternal ? 'noopener noreferrer' : undefined} 
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={`group flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors ${isActive ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
                            >
                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} /></svg>
                                {sidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {user && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white dark:bg-slate-700 dark:ring-slate-900 overflow-hidden shadow-sm">
                                {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{initials}</span>}
                            </div>
                            {sidebarOpen && (
                                <div className="min-w-0 overflow-hidden">
                                    <div className="truncate text-sm font-bold text-slate-900 dark:text-white capitalize">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                                    <div className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{role}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </aside>

        <div className="flex flex-1 flex-col overflow-hidden relative z-10 md:z-10 w-full">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 z-20">
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 md:p-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    
                    <div className="hidden lg:flex items-center text-sm font-semibold truncate">
                            {breadcrumbs.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {breadcrumbs.map((bc, idx) => (
                                        <React.Fragment key={idx}>
                                            {bc.href ? <Link href={bc.href} className="text-slate-400 hover:text-blue-600 transition-colors truncate">{bc.label}</Link> : <span className="text-slate-900 dark:text-white truncate">{bc.label}</span>}
                                            {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h1>
                            )}
                        </div>

                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {/* Mega Menu Explore Dropdown (Moved to left of search) */}
                        {role === 'student' && (
                            <div className="relative group hidden lg:block mr-2">
                            <button className="flex h-10 items-center gap-1.5 font-bold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                                Explore
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full -right-[350px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="w-[850px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl p-8 grid grid-cols-4 gap-8">
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Explore Roles</h4>
                                        <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                            <li><Link href="/courses?role=data-analyst" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Data Analyst</Link></li>
                                            <li><Link href="/courses?role=project-manager" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Project Manager</Link></li>
                                            <li><Link href="/courses?role=cyber-security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cyber Security Analyst</Link></li>
                                            <li><Link href="/courses?role=ui-ux" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">UI / UX Designer</Link></li>
                                            <li><Link href="/courses?role=machine-learning" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Machine Learning Engineer</Link></li>
                                            <li><Link href="/courses?role=software-engineer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Software Engineer</Link></li>
                                            <li><Link href="/courses?role=frontend-developer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Frontend Developer</Link></li>
                                            <li><Link href="/courses?role=backend-developer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Backend Developer</Link></li>
                                            <li><Link href="/courses?role=marketing-manager" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Marketing Manager</Link></li>
                                            <li><Link href="/courses?role=financial-analyst" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Financial Analyst</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Explore Categories</h4>
                                        <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                            <li><Link href="/courses?category=ai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Artificial Intelligence</Link></li>
                                            <li><Link href="/courses?category=business" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Business</Link></li>
                                            <li><Link href="/courses?category=data-science" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Data Science</Link></li>
                                            <li><Link href="/courses?category=it" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Information Technology</Link></li>
                                            <li><Link href="/courses?category=health" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Healthcare</Link></li>
                                            <li><Link href="/courses?category=web-dev" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Web Development</Link></li>
                                            <li><Link href="/courses?category=marketing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Digital Marketing</Link></li>
                                            <li><Link href="/courses?category=cloud" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cloud Computing</Link></li>
                                            <li><Link href="/courses?category=design" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Graphic Design</Link></li>
                                            <li><Link href="/courses?category=finance" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Finance & Accounting</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Earn a Certificate</h4>
                                        <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                            <li><Link href="/certificates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Professional Certificates</Link></li>
                                            <li><Link href="/certificates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Online Degrees</Link></li>
                                            <li><Link href="/certificates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Specializations</Link></li>
                                            <li><Link href="/certificates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Master's Degrees</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Trending Skills</h4>
                                        <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                            <li><Link href="/courses?skill=python" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Python</Link></li>
                                            <li><Link href="/courses?skill=machine-learning" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Machine Learning</Link></li>
                                            <li><Link href="/courses?skill=sql" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SQL</Link></li>
                                            <li><Link href="/courses?skill=excel" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Excel</Link></li>
                                            <li><Link href="/courses?skill=power-bi" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Power BI</Link></li>
                                            <li><Link href="/courses?skill=react" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">React</Link></li>
                                            <li><Link href="/courses?skill=javascript" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">JavaScript</Link></li>
                                            <li><Link href="/courses?skill=java" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Java</Link></li>
                                            <li><Link href="/courses?skill=cpp" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">C++</Link></li>
                                            <li><Link href="/courses?skill=go" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Go</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            </div>
                        )}

                        <div className="relative hidden sm:block" ref={searchRef}>
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleSearch}
                                placeholder="Search courses..." 
                                className="h-10 w-32 sm:w-48 lg:w-80 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                            {showSuggestions && searchQuery.trim() && (
                                <div className="absolute top-full right-0 md:left-0 md:right-auto mt-2 w-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
                                    {suggestions.length > 0 ? (
                                        <ul>
                                            {suggestions.map(c => (
                                                <li key={c.id}>
                                                    <Link href={`/courses/${c.slug}/${c.id}`} onClick={() => setShowSuggestions(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                            <img src={c.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</span>
                                                            <span className="text-xs text-slate-500">{c.instructor || (c as any).instructor_name || 'Expert Instructor'}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                            <li>
                                                <button onClick={() => { setShowSuggestions(false); router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`); }} className="w-full text-center py-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                    See all results for "{searchQuery}"
                                                </button>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-sm text-slate-500">
                                            No matching courses found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {user && role === 'student' && (
                            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">{cartCount}</span>
                                )}
                            </Link>
                        )}
                        {user && (
                            <Link href="/notifications" onClick={markNotificationsRead} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                                )}
                            </Link>
                        )}
                        

                        <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
                            {dark ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-1 sm:pr-3 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                                        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                                    </div>
                                    <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                                    <svg className="hidden sm:block h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                                            <p className="text-xs font-medium text-slate-500 capitalize mt-1">Role: {role}</p>
                                        </div>
                                        <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profile Settings
                                        </Link>
                                        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth" className="flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                                Sign In
                            </Link>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col relative">
                    <div className="flex-1">
                        {children}
                    </div>
                    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-6 bg-slate-50 dark:bg-slate-950">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Skillnora" className="h-6 w-6 object-contain" />
                                <span className="font-bold text-slate-900 dark:text-white">Skillnora © {new Date().getFullYear()}</span>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link>
                                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link>
                                <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
                                <Link href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms & Conditions</Link>
                                <Link href="/refund-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Refund Policy</Link>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
            <AskieBot />
        </div>
    )
}
