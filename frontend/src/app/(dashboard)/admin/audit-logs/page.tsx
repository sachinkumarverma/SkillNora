"use client"
import React from 'react'
import { motion } from 'framer-motion'

const logs = [
    { id: 1, action: 'Course Published', user: 'admin@skillnora.com', details: 'Published course "AI Engineer Agentic Track"', time: '10 mins ago', type: 'success' },
    { id: 2, action: 'User Suspended', user: 'admin@skillnora.com', details: 'Suspended user taylor.s@example.com (Violation of Terms)', time: '1 hour ago', type: 'danger' },
    { id: 3, action: 'Role Changed', user: 'system', details: 'Granted admin rights to sachinverma1489@gmail.com', time: '2 hours ago', type: 'warning' },
    { id: 4, action: 'Payment Processed', user: 'system', details: 'Webhook received for TXN-94821', time: '5 hours ago', type: 'info' },
    { id: 5, action: 'Admin Login', user: 'admin@skillnora.com', details: 'Successful login from IP 192.168.1.1', time: '1 day ago', type: 'success' },
]

export default function AdminAuditLogsPage() {
    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
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
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 md:ml-6 space-y-8">
                    {logs.map((log, index) => (
                        <div key={log.id} className="relative pl-6 md:pl-8">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                log.type === 'success' ? 'bg-emerald-500' :
                                log.type === 'danger' ? 'bg-red-500' :
                                log.type === 'warning' ? 'bg-amber-500' :
                                'bg-blue-500'
                            }`}></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{log.action}</h3>
                                <span className="text-xs font-bold text-slate-400">{log.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{log.details}</p>
                            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {log.user}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
