"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

// Dummy data fallbacks removed

const StatCard = ({ title, value, trend, isPositive, delay }: { title: string, value: string, trend: string, isPositive: boolean, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
    >
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
        <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h2>
            <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                {trend}
            </div>
        </div>
    </motion.div>
)

import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function AdminOverviewPage() {
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setMounted(true)
        apiClient.get('/api/statistics')
            .then(res => {
                setStats(res.data.stats)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load stats', err)
                setLoading(false)
            })
    }, [])

    if (loading) return <Loader />

    // Process chart data from real stats
    // Revenue chart (monthly)
    const revenueByMonth = new Array(12).fill(0)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if (stats?.activityData?.revenue) {
        stats.activityData.revenue.forEach((r: any) => {
            const date = new Date(r.created_at)
            if (date.getFullYear() === new Date().getFullYear()) {
                revenueByMonth[date.getMonth()] += Number(r.amount)
            }
        })
    }
    const realRevenueData = monthNames.map((name, i) => ({ name, value: revenueByMonth[i] }))

    // Enrollments chart (weekly: last 7 days)
    const enrollmentsByDay = [0, 0, 0, 0, 0, 0, 0]
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    // Calculate past 7 days properly or just simple day of week mapping
    if (stats?.activityData?.enrollments) {
        stats.activityData.enrollments.forEach((eDate: string) => {
            const date = new Date(eDate)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - date.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays <= 7) {
                enrollmentsByDay[date.getDay()]++
            }
        })
    }
    // Reorder array so today is last
    const today = new Date().getDay()
    const realEnrollmentData = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        realEnrollmentData.push({
            name: dayNames[d.getDay()],
            count: enrollmentsByDay[d.getDay()]
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Dashboard Overview
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Here's what's happening with SkillNora today.
                    </motion.p>
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3"
                >
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm">
                        Export Report
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm">
                        New Campaign
                    </button>
                </motion.div>
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} trend="--" isPositive={true} delay={0.1} />
                <StatCard title="Active Students" value={(stats?.activeStudents || 0).toLocaleString()} trend="--" isPositive={true} delay={0.2} />
                <StatCard title="Published Courses" value={(stats?.publishedCourses || 0).toLocaleString()} trend="--" isPositive={true} delay={0.3} />
                <StatCard title="Refund Rate" value="0%" trend="--" isPositive={true} delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Monthly earnings overview</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-lg px-4 py-2 outline-none cursor-pointer">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full min-w-0">
                        {mounted && (
                            <ResponsiveContainer width="99%" height="100%">
                                <AreaChart data={realRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'var(--tw-colors-slate-900)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* Enrollments Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col"
                >
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Enrollments</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Activity over the last 7 days</p>
                    </div>
                    <div className="flex-1 w-full min-h-[250px] min-w-0">
                        {mounted && (
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={realEnrollmentData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>
            
            {/* Recent Activity Table (Placeholder) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                    <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats?.recentTransactions?.map((txn: any) => (
                                <tr key={txn.transaction_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-400">#{txn.transaction_id.substring(0, 8).toUpperCase()}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{txn.user_name || 'Anonymous'}</td>
                                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{txn.course_title || 'Unknown Course'}</td>
                                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">₹{Number(txn.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md w-fit text-xs font-bold ${txn.status === 'success' || txn.status === 'created' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'success' || txn.status === 'created' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            {txn.status || 'Success'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        No recent transactions.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
