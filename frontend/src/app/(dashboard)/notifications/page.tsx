"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await apiClient.get('/api/notifications/user')
                setNotifications(res.data?.notifications || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const filtered = notifications.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.message?.toLowerCase().includes(search.toLowerCase()) ||
        n.user_name?.toLowerCase().includes(search.toLowerCase())
    )

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'new_comment':
            case 'comment_reply':
                return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            case 'enrollment':
                return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            case 'payment':
                return 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
        }
    }

    const handleNotificationClick = async (notif: any) => {
        if (!notif.is_read) {
            try {
                await apiClient.post('/api/notifications/read')
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
            } catch (err) {}
        }
        if (notif.link) {
            router.push(notif.link)
        }
    }

    if (loading) return <Loader />

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Notifications
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Your personal notifications and updates.
                    </motion.p>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full md:w-96"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </motion.div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notifications found</h3>
                            <p className="text-slate-500">You're all caught up!</p>
                        </div>
                    ) : (
                        filtered.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                                    !notif.is_read 
                                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' 
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getTypeColor(notif.type)}`}>
                                        <span className="font-bold text-sm">
                                            {notif.user_name ? notif.user_name.charAt(0).toUpperCase() : 'S'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold ${!notif.is_read ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTypeColor(notif.type)}`}>
                                                {notif.type.replace('_', ' ')}
                                            </span>
                                            {!notif.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            )}
                                        </div>
                                        <p className={`text-sm ${!notif.is_read ? 'text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            {notif.user_name && (
                                                <span className="text-xs font-semibold text-slate-500">From: {notif.user_name}</span>
                                            )}
                                            <span className="text-xs font-medium text-slate-400">
                                                {new Date(notif.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {notif.link && (
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                            View Details &rarr;
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    )
}
