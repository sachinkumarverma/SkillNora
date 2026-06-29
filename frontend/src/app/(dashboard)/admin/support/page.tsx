"use client"
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Pagination from '@/components/ui/Pagination'

import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    
    // Modal State
    const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null)
    const [resolveMessage, setResolveMessage] = useState('')
    const [isResolving, setIsResolving] = useState(false)

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get('/api/support/admin/all')
            setTickets(res.data?.tickets || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const submitResolution = async () => {
        if (!resolvingTicketId || !resolveMessage.trim()) return;
        setIsResolving(true);
        try {
            await apiClient.post(`/api/support/admin/${resolvingTicketId}/resolve`, { adminMessage: resolveMessage })
            setTickets(tickets.map(t => t.id === resolvingTicketId ? { ...t, status: 'Closed' } : t))
            setResolvingTicketId(null);
            setResolveMessage('');
            toast.success("Ticket resolved and email sent!")
        } catch (error) {
            console.error('Failed to resolve ticket:', error)
            toast.error('Failed to resolve ticket')
        } finally {
            setIsResolving(false);
        }
    }

    const filtered = tickets.filter(t => t.subject?.toLowerCase().includes(search.toLowerCase()) || t.user?.toLowerCase().includes(search.toLowerCase()))

    if (loading && tickets.length === 0) return <Loader type="management-table" />

    return (
        <>
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Support Tickets
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Manage user queries, feature requests, and bug reports.
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
                            placeholder="Search tickets..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-full py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all"
                        />
                    </div>
                    <button 
                        onClick={fetchTickets}
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
                                <th className="px-6 py-4">Ticket</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Closed Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No support tickets found</td></tr>
                            ) : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={t.subject}>{t.subject}</div>
                                        <div className="text-xs text-slate-500">{t.user || t.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            t.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            t.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1.5 ${
                                            t.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                                            t.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 
                                            'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Open' ? 'bg-emerald-500' : t.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-500">{t.created}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.status === 'Closed' ? (
                                            <div className="text-slate-500 font-medium">{t.closed_date || '-'}</div>
                                        ) : (
                                            <div className="text-slate-400 italic">-</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status !== 'Closed' && (
                                            <button onClick={() => setResolvingTicketId(t.id)} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Resolve</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
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

            {/* Resolve Modal */}
            {resolvingTicketId && (
                <div className="fixed top-16 left-0 right-0 bottom-0 z-[15] bg-slate-900/60 backdrop-blur-sm">
                    <div className="flex w-full h-full items-center justify-center p-4 md:pl-64">
                        <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 -mt-10"
                    >
                        <h2 className="text-2xl font-bold mb-2">Resolve Ticket</h2>
                        <p className="text-slate-500 mb-6 text-sm">Enter your resolution message below. This will be securely emailed directly to the user.</p>
                        
                        <textarea
                            value={resolveMessage}
                            onChange={(e) => setResolveMessage(e.target.value)}
                            rows={5}
                            placeholder="Type your response here..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-blue-500 resize-none mb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                        ></textarea>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setResolvingTicketId(null); setResolveMessage(''); }}
                                disabled={isResolving}
                                className="px-5 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitResolution}
                                disabled={isResolving || !resolveMessage.trim()}
                                className="px-5 py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isResolving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sending...
                                    </>
                                ) : 'Resolve'}
                            </button>
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </>
    )
}
