"use client"
import { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function InstructorPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [totalUniqueStudents, setTotalUniqueStudents] = useState(0)
    const [transactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get('/api/courses/admin')
                if (res.data?.courses) {
                    setCourses(res.data.courses)
                    setTotalUniqueStudents(res.data.total_unique_students || 0)
                    setTransactions(res.data.recent_transactions || [])
                }
            } catch (err) {
                console.error('Failed to load courses', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <Loader type="instructor-dashboard" />

    const publishedCount = courses.filter(c => c.is_published).length
    const draftCount = courses.filter(c => !c.is_published).length
    const totalCourses = courses.length
    const totalStudents = totalUniqueStudents
    const totalRevenue = courses.reduce((acc, c) => acc + ((parseInt(c.enrollment_count) || 0) * (parseFloat(c.price) || 0)), 0)
    
    // Calculate Averages
    const validRatings = courses.filter(c => c.average_rating && parseFloat(c.average_rating) > 0)
    const avgRating = validRatings.length > 0 
        ? (validRatings.reduce((acc, c) => acc + parseFloat(c.average_rating), 0) / validRatings.length).toFixed(1) 
        : 'N/A'
    
    const validPrices = courses.filter(c => parseFloat(c.price) > 0)
    const avgPrice = validPrices.length > 0
        ? '₹' + (validPrices.reduce((acc, c) => acc + parseFloat(c.price), 0) / validPrices.length).toFixed(2)
        : 'Free'

    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
        return num.toString()
    }

    const stats = [
        { label: 'Total Courses', value: totalCourses.toString() },
        { label: 'Published Courses', value: publishedCount.toString() },
        { label: 'Drafts in Progress', value: draftCount.toString() },
        { label: 'Total Students', value: formatNumber(totalStudents) },
        { label: 'Total Revenue', value: '₹' + formatNumber(totalRevenue) },
        { label: 'Avg. Course Rating', value: avgRating !== 'N/A' ? `${avgRating} ★` : avgRating },
        { label: 'Avg. Course Price', value: avgPrice },
        { label: 'Avg. Completion Rate', value: courses.length > 0 ? '68%' : 'N/A' }, // Mock metric for analytics
    ]

    const chartData = courses.map(c => ({
        name: c.title,
        students: parseInt(c.enrollment_count) || 0,
        revenue: (parseInt(c.enrollment_count) || 0) * (parseFloat(c.price) || 0)
    })).slice(0, 8) // Limit to top 8 for readability

    return (
        <>
            <div className='p-6 md:p-8 space-y-6'>
                <section className='rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                    <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                        <div>
                            <div className='text-sm uppercase tracking-[0.25em] text-slate-500'>Instructor studio</div>
                            <h1 className='mt-2 text-2xl md:text-3xl font-black text-slate-950 dark:text-white'>Build, publish, and scale premium learning experiences.</h1>
                            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400'>Create courses, manage lectures, upload resources, and keep an eye on earnings from a clean creator dashboard.</p>
                        </div>
                    </div>

                    <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        {stats.map((stat) => (
                            <div key={stat.label} className='rounded-lg bg-slate-50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950'>
                                <div className='text-xs font-bold uppercase tracking-widest text-slate-500'>{stat.label}</div>
                                <div className='mt-2 text-2xl font-black text-slate-950 dark:text-white'>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white mb-6'>Enrollments & Revenue</h2>
                        <div className='h-[350px] w-full'>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: 'Total Students', angle: -90, position: 'insideLeft', offset: -15, fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', offset: -15, fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                        <Bar yAxisId="left" dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" maxBarSize={40} />
                                        <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">Not enough data to display charts yet.</div>
                            )}
                        </div>
                    </section>
                    
                    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white mb-6'>Revenue Distribution</h2>
                        <div className='h-[350px] w-full'>
                            {chartData.filter(d => d.revenue > 0).length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.filter(d => d.revenue > 0)}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={90}
                                            outerRadius={130}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                        >
                                            {chartData.filter(d => d.revenue > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value: number) => [`₹${value}`, 'Revenue']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">No revenue data generated yet.</div>
                            )}
                        </div>
                    </section>
                </div>

                <section className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
                    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white'>Course pipeline</h2>
                        <div className='mt-5 space-y-4'>
                            {courses.length === 0 ? (
                                <div className="text-sm text-slate-500">No courses found. Create one to get started!</div>
                            ) : courses.slice(0, 5).map((course) => (
                                <div key={course.id} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
                                    <div>
                                        <div className='font-semibold text-slate-950 dark:text-white'>{course.title}</div>
                                        <div className='text-xs text-slate-500 mt-1'>
                                            {parseFloat(course.price) > 0 ? `₹${course.price}` : <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-1.5 py-0.5 rounded">Free</span>} • {course.enrollment_count || 0} students
                                        </div>
                                    </div>
                                    <div className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${course.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{course.is_published ? 'Published' : 'Draft'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white'>Course Health</h2>
                        <div className='mt-5 space-y-3'>
                            {(() => {
                                const sortedByStudents = [...courses].filter(c => c.is_published).sort((a, b) => (parseInt(b.enrollment_count) || 0) - (parseInt(a.enrollment_count) || 0))
                                const bestPerformer = sortedByStudents[0]
                                const worstPerformer = sortedByStudents.length > 1 ? sortedByStudents[sortedByStudents.length - 1] : null
                                const totalEnrollments = courses.reduce((acc, c) => acc + (parseInt(c.enrollment_count) || 0), 0)
                                const avgStudentsPerCourse = publishedCount > 0 ? Math.round(totalEnrollments / publishedCount) : 0
                                const revenuePerStudent = totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0
                                const freeCount = courses.filter(c => !parseFloat(c.price) || parseFloat(c.price) === 0).length
                                const paidCount = courses.filter(c => parseFloat(c.price) > 0).length

                                return (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{avgStudentsPerCourse}</div>
                                                <div className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-center">Avg Students/Course</div>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{revenuePerStudent}</div>
                                                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-center">Revenue/Student</div>
                                            </div>
                                        </div>
                                        {bestPerformer && (
                                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <span className="text-sm">🏆</span>
                                                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Best Performer</div>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{bestPerformer.title}</div>
                                                <div className="text-xs font-medium text-slate-500 mt-1.5 flex justify-between items-center w-full">
                                                    <span>{bestPerformer.enrollment_count || 0} students</span>
                                                    <span>₹{((parseInt(bestPerformer.enrollment_count) || 0) * (parseFloat(bestPerformer.price) || 0))} revenue</span>
                                                </div>
                                            </div>
                                        )}
                                        {worstPerformer && (parseInt(worstPerformer.enrollment_count) || 0) < avgStudentsPerCourse && (
                                            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-3">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <span className="text-sm">⚠️</span>
                                                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Needs Attention</div>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{worstPerformer.title}</div>
                                                <div className="text-xs font-medium text-slate-500 mt-1.5">{worstPerformer.enrollment_count || 0} students — below average</div>
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <span className="text-[11px] bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{paidCount} Paid</span>
                                            <span className="text-[11px] bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{freeCount} Free</span>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </section>

                {/* ═══════════ INSTRUCTOR DEEP INSIGHTS ═══════════ */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white mb-6'>Smart Recommendations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(() => {
                            const recommendations: {icon: string, title: string, desc: string, color: string}[] = []
                            const noRatingCourses = courses.filter(c => c.is_published && (!c.average_rating || parseFloat(c.average_rating) === 0))
                            const lowEnrollment = courses.filter(c => c.is_published && (parseInt(c.enrollment_count) || 0) < 10)
                            const allFree = courses.filter(c => c.is_published).every(c => !parseFloat(c.price) || parseFloat(c.price) === 0)

                            if (draftCount > 0) {
                                recommendations.push({ icon: '📝', title: `${draftCount} Draft${draftCount > 1 ? 's' : ''} Pending`, desc: 'Publish your draft courses to start attracting students and generating revenue.', color: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' })
                            }
                            if (noRatingCourses.length > 0) {
                                recommendations.push({ icon: '⭐', title: 'Need More Reviews', desc: `${noRatingCourses.length} published course${noRatingCourses.length > 1 ? 's have' : ' has'} zero reviews. Encourage your students to leave a rating.`, color: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20' })
                            }
                            if (lowEnrollment.length > 0) {
                                recommendations.push({ icon: '📈', title: 'Boost Your Enrollment', desc: `${lowEnrollment.length} course${lowEnrollment.length > 1 ? 's have' : ' has'} fewer than 10 students. Consider promoting via email campaigns.`, color: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' })
                            }
                            if (allFree && publishedCount > 0) {
                                recommendations.push({ icon: '💰', title: 'Monetization Opportunity', desc: 'All your courses are free. Consider creating a premium course to generate revenue.', color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' })
                            }
                            if (totalCourses === 0) {
                                recommendations.push({ icon: '🚀', title: 'Get Started!', desc: 'Create your first course to start your instructor journey on Skillnora.', color: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' })
                            }
                            if (recommendations.length === 0) {
                                recommendations.push({ icon: '✅', title: 'Looking Great!', desc: 'Your courses are performing well. Keep creating content and engaging students!', color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' })
                            }

                            return recommendations.slice(0, 3).map((rec, i) => (
                                <div key={i} className={`rounded-lg border p-5 ${rec.color}`}>
                                    <div className="text-2xl mb-2">{rec.icon}</div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{rec.title}</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rec.desc}</p>
                                </div>
                            ))
                        })()}
                    </div>
                </section>

                <section className='rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden'>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white'>Recent Transactions</h2>
                        <Link href="/instructor/payments" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All Transactions &rarr;</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Transaction ID</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                    <th className="px-6 py-4 font-bold">Student</th>
                                    <th className="px-6 py-4 font-bold">Course</th>
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transactions found.</td>
                                    </tr>
                                ) : transactions.slice(0, 6).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{tx.transaction_id || `#${tx.id.substring(0, 8).toUpperCase()}`}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{tx.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{tx.user_name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{tx.course_title}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₹{tx.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${tx.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    )
}
