"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function AdminApprovalsDashboard() {
    const pendingApprovals = [
        { id: 1, instructor: 'Sarah J.', course: 'AI in Design', submitted: '2h ago' },
        { id: 2, instructor: 'Mark T.', course: 'React Hooks Deep Dive', submitted: '3h ago' },
        { id: 3, instructor: 'Emily R.', course: 'Figma to Code', submitted: '5h ago' },
        { id: 4, instructor: 'Alex M.', course: 'Next.js API Routes', submitted: '1d ago' },
        { id: 5, instructor: 'Jane D.', course: 'Advanced Tailwind', submitted: '1d ago' },
    ]

    return (
        <>
            <div className="p-6 md:p-8">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    
                    {/* Metrics Row */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Pending Courses</div>
                                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">1</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl dark:bg-orange-900/20">🔥</div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active Instructors</div>
                                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">2</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl dark:bg-blue-900/20">👥</div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Flagged Users</div>
                                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">5</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/20">⚠️</div>
                        </div>
                    </div>

                    {/* Approvals Table */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Pending Approvals</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 w-12"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700" /></th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Instructor</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Course</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Submitted</th>
                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {pendingApprovals.map((approval) => (
                                        <tr key={approval.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900" /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{approval.instructor.charAt(0)}</div>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{approval.instructor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{approval.course}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{approval.submitted}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30">Approve</button>
                                                    <button className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30">Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}
