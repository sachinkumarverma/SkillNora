"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/api'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layouts/DashboardLayout'

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export default function DashboardPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<any[]>([])
    const [loadingCourses, setLoadingCourses] = useState(true)

    useEffect(() => {
        let active = true
        api.api('/api/courses').then((data) => {
            if (!active) return
            setCourses(Array.isArray(data) ? data : data.data ?? [])
        }).catch(() => {
            if (active) setCourses([])
        }).finally(() => {
            if (active) setLoadingCourses(false)
        })
        return () => { active = false }
    }, [])

    const studentMetrics = [
        { label: 'Learning Streak', value: '14 Days', icon: '🔥', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
        { label: 'Total Minutes', value: '840', icon: '⏱️', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Active Courses', value: '5', icon: '📚', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
        { label: 'Certificates', value: '2', icon: '🏅', color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/20' },
    ]

    return (
        <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
            <div className="p-6 md:p-8">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col xl:flex-row gap-6">
                    {/* Left Column: Continue Learning */}
                    <div className="flex-1 space-y-6">
                        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">Continue Learning</h2>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent</span>
                            </div>
                            
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {(loadingCourses ? [] : courses.slice(0, 3)).map((course, i) => (
                                    <div key={course.id} className="group relative min-w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700" onClick={() => router.push(`/courses/${course.slug}`)}>
                                        <div className="mb-4 flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-md group-hover:scale-110 transition-transform">
                                                <svg className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h3>
                                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{course.description || 'Learn and master the fundamentals with comprehensive lessons.'}</p>
                                        
                                        <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                                            <span>Progress</span>
                                            <span>{Math.floor(Math.random() * 60 + 20)}%</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                {!loadingCourses && courses.length === 0 && (
                                    <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-12 text-slate-500 dark:border-slate-800">
                                        <p className="text-sm font-medium">No active courses found.</p>
                                        <button onClick={() => router.push('/courses')} className="mt-3 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Explore Courses</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Metrics & AI */}
                    <div className="flex w-full flex-col gap-6 xl:w-[380px] shrink-0">
                        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Dynamic Metrics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {studentMetrics.map((metric, i) => (
                                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${metric.bg} ${metric.color} text-lg`}>
                                                {metric.icon}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    AI Learning Assistant
                                </h2>
                                <span className="text-[10px] uppercase text-slate-400">Powered by GPT-4o</span>
                            </div>
                            
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                <button className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">Summarize Lesson</button>
                                <button className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Quiz Hints</button>
                                <button className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Explain Concepts</button>
                            </div>
                            
                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Can you summarize the concept of Server-Side Rendering in Next.js?
                                </p>
                                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                        Sure! Server-side rendering (SSR) generates the full HTML for a page on the server in response to each request, sending a fully rendered page to the client. This improves SEO and initial load times compared to pure client-side rendering.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end gap-2">
                                <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Clear</button>
                                <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">Copy Summary</button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
