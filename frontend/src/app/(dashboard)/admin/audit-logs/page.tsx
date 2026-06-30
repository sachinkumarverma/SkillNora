"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Pagination from '@/components/ui/Pagination'

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/admin/audit-logs')
            setLogs(res.data?.logs || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const [expandedLogId, setExpandedLogId] = useState<string | number | null>(null)

    const toggleExpand = (id: string | number) => {
        setExpandedLogId(prev => prev === id ? null : id)
    }

    const filtered = logs.filter(log => 
        log.action?.toLowerCase().includes(search.toLowerCase()) || 
        log.user?.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading && logs.length === 0) return <Loader type="management-table" />

    return (
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Audit Logs
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Track system events, administrative actions, and security alerts.
                    </motion.p>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search logs by action, user or details..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-full py-2 pl-10 pr-10 text-sm font-medium outline-none transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className={`p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Refresh Data"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 w-10"></th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No audit logs found</td></tr>
                            ) : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log, index) => {
                                const rowId = log.id || index;
                                const isExpanded = expandedLogId === rowId;
                                return (
                                <React.Fragment key={rowId}>
                                    <tr className={`transition-colors ${isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                onClick={() => toggleExpand(rowId)}
                                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-all"
                                            >
                                                <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {log.user}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{log.details}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1.5 ${
                                                log.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                                                log.type === 'danger' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                                                log.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                                                'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    log.type === 'success' ? 'bg-emerald-500' :
                                                    log.type === 'danger' ? 'bg-red-500' :
                                                    log.type === 'warning' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                                }`}></span>
                                                {log.type === 'success' ? 'Success' : log.type === 'danger' ? 'Danger' : log.type === 'warning' ? 'Warning' : 'Info'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-bold">{log.time}</td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800/50">
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-hidden"
                                                >
                                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-base">Log Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-1">Action</span><span className="font-medium">{log.action}</span></div>
                                                        <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-1">User / System</span><span className="font-medium">{log.user}</span></div>
                                                        <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-1">Status</span><span className="font-medium capitalize">{log.type}</span></div>
                                                        <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-1">Timestamp</span><span className="font-medium">{log.time}</span></div>
                                                    </div>
                                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-3">Raw Payload</span>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 font-mono text-xs overflow-x-auto text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {log.details}
                                                    </div>
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </motion.div>
        </div>
    )
}
