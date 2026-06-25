"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const StatCard = ({ title, value, icon, color, delay }: { title: string, value: string | number, icon: React.ReactNode, color: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className={`rounded-xl border p-6 ${color}`}
    >
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</h3>
            <div className="opacity-50">{icon}</div>
        </div>
        <h2 className="text-3xl font-black">{value}</h2>
    </motion.div>
)

export default function AdminOverviewPage() {
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [platformStats, setPlatformStats] = useState({ students: 0, instructors: 0, categories: 0 })

    useEffect(() => {
        setMounted(true)
        
        const fetchAll = async () => {
            try {
                const [statsRes, coursesRes, studentsRes, instructorsRes, categoriesRes] = await Promise.all([
                    apiClient.get('/api/statistics'),
                    apiClient.get('/api/courses'),
                    apiClient.get('/api/admin/students'),
                    apiClient.get('/api/admin/instructors'),
                    apiClient.get('/api/admin/categories'),
                ])

                setStats(statsRes.data?.stats)
                
                const courseList = coursesRes.data?.courses || coursesRes.data || []
                setCourses(Array.isArray(courseList) ? courseList : [])

                const instrList = instructorsRes.data?.instructors || []
                setInstructors(instrList)

                const catList = categoriesRes.data?.categories || []
                setCategories(catList)

                setPlatformStats({
                    students: (studentsRes.data?.students || []).length,
                    instructors: instrList.length,
                    categories: catList.length,
                })
            } catch (err) {
                console.error('Failed to load overview data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) return <Loader type="dashboard" />

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
    const realEnrollmentData = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        realEnrollmentData.push({
            name: dayNames[d.getDay()],
            count: enrollmentsByDay[d.getDay()]
        })
    }

    // Category pie chart from real data
    const categoryCounts: Record<string, number> = {}
    courses.forEach((c: any) => {
        const cat = c.category || 'Artificial Intelligence'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
    const categoryPieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))

    // Top instructors from real data
    const topInstructors = instructors.slice(0, 4)
    const maxStudents = Math.max(...topInstructors.map((i: any) => i.students || 0), 1)

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
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
                    color="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    delay={0.1}
                />
                <StatCard 
                    title="Active Students" 
                    value={platformStats.students}
                    color="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    delay={0.15}
                />
                <StatCard 
                    title="Published Courses" 
                    value={stats?.publishedCourses || courses.length}
                    color="bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    delay={0.2}
                />
                <StatCard 
                    title="Active Instructors" 
                    value={platformStats.instructors}
                    color="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    delay={0.25}
                />
            </div>

            {/* Recent Transactions & All Courses */}
            <div className="grid grid-cols-1 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                        <Link href="/admin/payments" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
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
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md w-fit text-xs font-bold ${txn.status === 'success' || txn.status === 'created' || txn.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'success' || txn.status === 'created' || txn.status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
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

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">All Courses</h2>
                        <p className="text-sm text-slate-500 mt-1">Courses currently on the platform.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Published</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {courses.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">No courses found</td></tr>
                                ) : courses.slice(0, 5).map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-[260px] truncate">{c.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{c.category || 'Artificial Intelligence'}</td>
                                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">Rs. {c.price || 0}</td>
                                        <td className="px-6 py-4">
                                            {c.average_rating ? (
                                                <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                    {Number(c.average_rating).toFixed(1)}
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </span>
                                            ) : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.is_published ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                                                {c.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Monthly earnings overview</p>
                        </div>
                    </div>
                    <div className="h-80 w-full min-w-0">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b' }}
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
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col"
                >
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Enrollments</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Activity over the last 7 days</p>
                    </div>
                    <div className="flex-1 w-full min-h-[250px] min-w-0">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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

            {/* Analytics Row: Category Pie + Top Instructors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Courses by Category</h2>
                    <div className="flex-1 w-full h-[300px] min-w-0">
                        {mounted && categoryPieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <PieChart>
                                    <Pie
                                        data={categoryPieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryPieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No category data</div>
                        )}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Instructors</h2>
                    <div className="space-y-5">
                        {topInstructors.length === 0 ? (
                            <div className="text-slate-500 text-center py-8">No instructor data</div>
                        ) : topInstructors.map((instructor: any, i: number) => (
                            <div key={instructor.id || i}>
                                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    <span>{instructor.name}</span>
                                    <span>{instructor.revenue}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(((instructor.students || 0) / maxStudents) * 100, 5)}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 w-20 text-right">{instructor.students} students</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    )
}
