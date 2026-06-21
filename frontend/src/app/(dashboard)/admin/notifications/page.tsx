"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await apiClient.get('/api/admin/notifications')
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
                        All system notifications across the platform.
                    </motion.p>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <div className="relative w-full max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search notifications..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-full py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 min-h-[300px]">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">No notifications found</div>
                    ) : filtered.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm uppercase shrink-0 mt-0.5">
                                {n.user_name?.charAt(0) || 'N'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</span>
                                    {n.type && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeColor(n.type)}`}>
                                            {n.type.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">{n.message}</p>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                    {n.user_name && <span>To: {n.user_name}</span>}
                                    <span>•</span>
                                    <span>{n.date}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
