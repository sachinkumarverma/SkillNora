"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import useUser from '@/lib/useUser'
import apiClient from '@/lib/apiClient'


import CourseCarousel from '@/components/CourseCarousel'
import HeroCarousel from '@/components/HeroCarousel'

export default function DashboardPage() {
    const router = useRouter()
    const { user } = useUser()
    const [courses, setCourses] = useState<any[]>([])
    const [enrolledIds, setEnrolledIds] = useState<string[]>([])
    const [userEnrollments, setUserEnrollments] = useState<any[]>([])
    const [certificatesCount, setCertificatesCount] = useState<number>(0)
    const [streakCount, setStreakCount] = useState<number>(1)
    const [loadingCourses, setLoadingCourses] = useState(true)

    useEffect(() => {
        let active = true
        Promise.all([
            apiClient.get('/api/courses').then(r => r.data).catch(e => { console.error(e); return { courses: [] }; }),
            apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] })),
            apiClient.get('/api/statistics').then(r => r.data.stats).catch(() => null)
        ]).then(([coursesData, enrollData, statsData]) => {
            if (!active) return
            setCourses(Array.isArray(coursesData) ? coursesData : coursesData.courses || coursesData.data || [])
            setEnrolledIds(enrollData?.enrolledIds || [])
            setUserEnrollments(enrollData?.enrollments || [])
            setCertificatesCount(enrollData?.certificatesCount || 0)
            
            // Calculate Active Streak
            let streak = 0;
            if (statsData?.activityData) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const activityMap = new Map<string, number>();
                const formatDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                Object.values(statsData.activityData).flat().forEach((dateStr: any) => {
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    d.setHours(0,0,0,0);
                    const key = formatDateKey(d);
                    activityMap.set(key, (activityMap.get(key) || 0) + 1);
                });

                const last364Days = Array.from({ length: 364 }).map((_, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - (363 - i));
                    return d;
                });
                
                for (let i = 363; i >= 0; i--) {
                    const d = last364Days[i];
                    const key = formatDateKey(d);
                    if (activityMap.get(key) && activityMap.get(key)! > 0) {
                        streak++;
                    } else {
                        if (i !== 363) break;
                    }
                }
            }
            setStreakCount(streak || 1);
            
        }).catch(() => {
            if (active) setCourses([])
        }).finally(() => {
            if (active) setLoadingCourses(false)
        })
        return () => { active = false }
    }, [])

    const displayCourses = courses
    const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id))
    
    // Sort enrolled courses by recently watched if available
    // Currently disabled until DB sorting is fully wired up

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-16">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 space-y-16 pt-8">

                {/* Coursera-style Hero Banners Carousel */}
                <HeroCarousel />

                {/* University Logos */}
                <section className="py-6 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Learn from 350+ leading universities and companies</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        <div className="text-xl font-black font-sans flex items-center gap-2">
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                            Google
                        </div>
                        <div className="text-xl font-black font-serif flex items-center gap-2 text-blue-700">IBM</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2"><div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-red-500"></div><div className="bg-green-500"></div><div className="bg-blue-500"></div><div className="bg-yellow-500"></div></div>Microsoft</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2 text-indigo-900 dark:text-indigo-400">Stanford University</div>
                        <div className="text-xl font-black font-sans flex items-center gap-2">DeepLearning.AI</div>
                    </div>
                </section>

                {/* Logged-in User Specific Sections */}
                {user && (
                    <div className="space-y-12 mb-12">
                        {/* ═══════════ DEEP ANALYTICS & INSIGHTS ═══════════ */}
                        {!loadingCourses && (() => {
                            // ── Compute all analytics from real data ──
                            const progressData = enrolledCourses.map(course => {
                                const enrollment = userEnrollments.find(e => e.course_id === course.id)
                                const progList = enrollment?.progress?.[course.slug] || []
                                const totalLectures = course.lectures?.length || parseInt(course.lectures_count) || 1
                                const percent = Math.min(100, Math.round((progList.length / totalLectures) * 100))
                                return { ...course, percent, lecturesCompleted: progList.length, totalLectures }
                            })

                            const completionRate = enrolledCourses.length > 0 ? Math.round((certificatesCount / enrolledCourses.length) * 100) : 0
                            const avgProgress = progressData.length > 0 ? Math.round(progressData.reduce((s, c) => s + c.percent, 0) / progressData.length) : 0
                            const totalLecturesCompleted = progressData.reduce((s, c) => s + c.lecturesCompleted, 0)
                            const totalLecturesAll = progressData.reduce((s, c) => s + c.totalLectures, 0)

                            // Skill coverage from enrolled categories
                            const enrolledCategories = new Set(enrolledCourses.map(c => c.category).filter(Boolean))
                            const allCategories = new Set(courses.map(c => c.category).filter(Boolean))
                            const skillCoverage = allCategories.size > 0 ? Math.round((enrolledCategories.size / allCategories.size) * 100) : 0

                            // Category distribution
                            const catCounts: Record<string, number> = {}
                            enrolledCourses.forEach(c => { if (c.category) catCounts[c.category] = (catCounts[c.category] || 0) + 1 })
                            const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]

                            // Skill gaps: categories with courses available but not enrolled
                            const gapCategories = [...allCategories].filter(cat => !enrolledCategories.has(cat))

                            // Smart recommendations: courses NOT enrolled, sorted by rating
                            const notEnrolled = courses.filter(c => !enrolledIds.includes(c.id) && c.is_published !== false)
                            const topRatedNotEnrolled = [...notEnrolled].sort((a, b) => (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0)).slice(0, 3)

                            // Courses in same category as top enrolled category (for "Because you studied X")
                            const sameCategory = topCategory ? notEnrolled.filter(c => c.category === topCategory[0]).slice(0, 3) : []

                            // Stalled courses (enrolled but < 30% progress)
                            const stalledCourses = progressData.filter(c => c.percent > 0 && c.percent < 30)

                            // Near completion (> 70% but not 100%)
                            const nearCompletion = progressData.filter(c => c.percent >= 70 && c.percent < 100)

                            // Learning velocity: lectures per enrolled course
                            const velocity = enrolledCourses.length > 0 ? (totalLecturesCompleted / enrolledCourses.length).toFixed(1) : '0'

                            // Streak analysis
                            const streakLabel = streakCount >= 30 ? '🔥 Legendary' : streakCount >= 14 ? '⚡ On Fire' : streakCount >= 7 ? '💪 Strong' : streakCount >= 3 ? '✨ Growing' : '🌱 Starting'

                            return (
                                <section className="space-y-8">
                                    <div className="flex justify-between items-end mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">Deep Insights & Analytics</h2>
                                        <Link href="/statistics" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                            See full statistics <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    </div>

                                    {/* Row 1: Key Metrics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl text-white">
                                            <div className="text-sm font-medium opacity-80">Completion Rate</div>
                                            <div className="text-3xl font-black mt-1">{completionRate}%</div>
                                            <div className="text-xs opacity-70 mt-1">{certificatesCount} of {enrolledCourses.length} courses finished</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-xl text-white">
                                            <div className="text-sm font-medium opacity-80">Avg. Progress</div>
                                            <div className="text-3xl font-black mt-1">{avgProgress}%</div>
                                            <div className="text-xs opacity-70 mt-1">{totalLecturesCompleted} / {totalLecturesAll} lectures done</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-xl text-white">
                                            <div className="text-sm font-medium opacity-80">Skill Coverage</div>
                                            <div className="text-3xl font-black mt-1">{skillCoverage}%</div>
                                            <div className="text-xs opacity-70 mt-1">{enrolledCategories.size} of {allCategories.size} domains explored</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl text-white">
                                            <div className="text-sm font-medium opacity-80">Streak Status</div>
                                            <div className="text-3xl font-black mt-1">{streakCount}d</div>
                                            <div className="text-xs opacity-70 mt-1">{streakLabel}</div>
                                        </div>
                                    </div>

                                    {/* Row 2: Skill Distribution + Learning Velocity */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Skill Distribution */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-serif">Your Skill Distribution</h3>
                                            {Object.entries(catCounts).length > 0 ? (
                                                <div className="space-y-3">
                                                    {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => {
                                                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500']
                                                        const maxCount = Math.max(...Object.values(catCounts))
                                                        const width = Math.round((count / maxCount) * 100)
                                                        return (
                                                            <div key={cat}>
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count} course{count > 1 ? 's' : ''}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                                    <div className={`h-2 rounded-full ${colors[i % colors.length]} transition-all duration-500`} style={{ width: `${width}%` }}></div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">Enroll in courses to see your skill distribution.</p>
                                            )}
                                        </div>

                                        {/* Learning Velocity & Insights */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-serif">Learning Velocity</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-5">
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{velocity}</div>
                                                    <div className="text-xs font-semibold text-slate-500 mt-1">Lectures / Course</div>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{totalLecturesCompleted}</div>
                                                    <div className="text-xs font-semibold text-slate-500 mt-1">Total Lectures Done</div>
                                                </div>
                                            </div>
                                            {/* Near Completion Nudges */}
                                            {nearCompletion.length > 0 && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                                                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">🎯 Almost There!</div>
                                                    {nearCompletion.map(c => (
                                                        <div key={c.id} className="flex items-center justify-between py-1 cursor-pointer hover:opacity-80" onClick={() => router.push(`/courses/${c.slug}`)}>
                                                            <span className="text-sm text-emerald-800 dark:text-emerald-200 font-medium line-clamp-1 flex-1">{c.title}</span>
                                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2 shrink-0">{c.percent}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Stalled Courses Warning */}
                                            {stalledCourses.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-3">
                                                    <div className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">⏸️ Needs Attention</div>
                                                    {stalledCourses.slice(0, 2).map(c => (
                                                        <div key={c.id} className="flex items-center justify-between py-1 cursor-pointer hover:opacity-80" onClick={() => router.push(`/courses/${c.slug}`)}>
                                                            <span className="text-sm text-amber-800 dark:text-amber-200 font-medium line-clamp-1 flex-1">{c.title}</span>
                                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2 shrink-0">{c.percent}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 3: Skill Gap Analysis */}
                                    {gapCategories.length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-serif">Skill Gap Analysis</h3>
                                            <p className="text-sm text-slate-500 mb-4">You haven't explored these domains yet. Broaden your knowledge base:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {gapCategories.map(cat => {
                                                    const countInCat = courses.filter(c => c.category === cat).length
                                                    return (
                                                        <span key={cat} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors" onClick={() => router.push('/courses')}>
                                                            {cat} <span className="text-xs text-slate-400">({countInCat})</span>
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 4: Personalized Recommendations */}
                                    {topRatedNotEnrolled.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-serif">
                                                {topCategory ? `Because you study ${topCategory[0]}` : 'Recommended For You'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {(sameCategory.length > 0 ? sameCategory : topRatedNotEnrolled).map(course => (
                                                    <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push(`/courses/${course.slug}`)}>
                                                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                                            <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">Recommended</div>
                                                            {parseFloat(course.average_rating) > 0 && (
                                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">⭐ {parseFloat(course.average_rating).toFixed(1)}</div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">{course.category || course.primary_skill || 'General'}</div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm mb-2">{course.title}</h4>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-500 font-medium">{course.instructor_name || 'Instructor'}</span>
                                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{parseFloat(course.price) > 0 ? `₹${course.price}` : 'Free'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 5: Top Rated Courses You Haven't Tried */}
                                    {topRatedNotEnrolled.length > 0 && sameCategory.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-serif">Top Rated Courses You Haven't Tried</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {topRatedNotEnrolled.map(course => (
                                                    <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/courses/${course.slug}`)}>
                                                        <div className="w-20 h-20 shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                                                            <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} alt={course.title} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-sm">{course.title}</h4>
                                                            <div className="text-xs text-slate-500 mt-1">{course.category}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {parseFloat(course.average_rating) > 0 && <span className="text-xs font-bold text-amber-600">⭐ {parseFloat(course.average_rating).toFixed(1)}</span>}
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{parseFloat(course.price) > 0 ? `₹${course.price}` : 'Free'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )
                        })()}

                        {/* Continue Watching */}
                        {loadingCourses ? (
                            <section className="animate-pulse mt-12">
                                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex gap-4">
                                            <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                                            <div className="flex-1 flex flex-col justify-center space-y-3">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                                                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full mt-2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <section className="mt-12">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-serif">Continue Watching</h2>
                            {enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {enrolledCourses.slice(0, 3).map((course, idx) => {
                                        const enrollment = userEnrollments.find(e => e.course_id === course.id);
                                        const progList = enrollment?.progress?.[course.slug] || [];
                                        const totalLectures = course.lectures?.length || parseInt(course.lectures_count) || 1;
                                        const percent = Math.min(100, Math.round((progList.length / totalLectures) * 100));
                                        return (
                                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/courses/${course.slug}`)}>
                                            <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                                                <img src={course.thumbnail_url || course.image_url || course.image || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} alt={course.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 text-sm">{course.title}</h3>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <div className="text-xs text-slate-500 font-semibold">{percent}% complete</div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active courses</h3>
                                    <p className="text-slate-500 mb-4 max-w-sm">You haven't enrolled in any courses yet. Start your learning journey today!</p>
                                </div>
                            )}
                        </section>
                        )}
                    </div>
                )}

                {/* Carousels Section */}
                {loadingCourses ? (
                    <div className="space-y-16 animate-pulse">
                        {[1, 2].map(section => (
                            <div key={section} className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800"></div>
                                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800"></div>
                                    </div>
                                </div>
                                <div className="flex gap-4 overflow-hidden">
                                    {[1, 2, 3, 4].map(card => (
                                        <div key={card} className="min-w-[280px] md:min-w-[320px] rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                            <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800"></div>
                                            <div className="p-5 space-y-3">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                                                <div className="pt-4 flex justify-between items-center">
                                                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                    <CourseCarousel
                        title="New and popular"
                        courses={displayCourses.slice(0, 8)}
                        enrolledIds={enrolledIds}
                    />

                    <CourseCarousel
                        title="Trending AI Courses"
                        courses={displayCourses.filter(c => c.category === 'Data Science' || c.category === 'Software Engineering')}
                        enrolledIds={enrolledIds}
                    />

                    <CourseCarousel
                        title="Top rated in Web Development"
                        courses={displayCourses.filter(c => c.category === 'Web Development' || c.category === 'Python')}
                        enrolledIds={enrolledIds}
                    />
                </div>
                )}

                {/* Features Links */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Launch a new career</span>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Try Skillnora for Business</span>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex items-center justify-between hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer transition-colors">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Earn a degree</span>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg></div>
                    </div>
                </section>

                {/* Testimonials */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-serif">Why people choose Skillnora</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Sarah W.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', quote: '"Skillnora\'s reputation for high-quality content, paired with its flexible structure, made it possible for me to dive into data analytics while managing family, health, and everyday life."' },
                            { name: 'Noeris B.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', quote: '"Skillnora rebuilt my confidence and showed me I could dream bigger. It wasn\'t just about gaining knowledge—it was about believing in my potential again."' },
                            { name: 'Abdullahi M.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', quote: '"I now feel more prepared to take on leadership roles and have already started mentoring some of my colleagues."' }
                        ].map((t, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover" />
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t.name}</h4>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {t.quote}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-serif">Frequently asked questions</h2>
                    <div className="space-y-4 max-w-4xl">
                        {[
                            { q: 'Is Skillnora accredited, and are Skillnora certificates recognized by employers?', a: 'Yes, Skillnora partners with top-tier industry professionals and tech leaders. Our certificates provide verifiable proof of your technical proficiency and are highly regarded by hiring managers globally.' },
                            { q: 'Is a Skillnora certificate worth it?', a: 'Absolutely. Earning a certificate demonstrates your commitment to continuous learning and gives you a tangible credential to showcase on your resume, LinkedIn profile, and portfolio.' },
                            { q: 'What is Skillnora Plus, and is it worth it?', a: 'Skillnora Plus gives you unlimited access to our entire library of premium courses, guided projects, and certificate programs for a single annual fee, making it the most cost-effective way to rapidly upgrade your skills.' },
                            { q: 'Does Skillnora offer free online courses?', a: 'Yes! Skillnora offers a selection of introductory and foundational courses entirely for free. While official certificates may require a fee, the knowledge is accessible to everyone.' },
                            { q: 'What are the most popular courses on Skillnora?', a: 'Our most popular tracks currently include AI Engineering, Full-Stack Web Development, Data Science with Python, and Mobile Development with Flutter.' },
                            { q: 'How can Skillnora help me get a job or advance my career?', a: 'By providing industry-relevant curriculum, hands-on projects, and expert instruction, Skillnora equips you with the exact, practical skills that tech companies are actively hiring for right now.' },
                            { q: 'What is Skillnora for Business, and how much does it cost?', a: 'Skillnora for Business is our enterprise solution designed specifically to upskill development teams. Pricing scales based on the size of your team, offering significant discounts for group training.' }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {faq.q}
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="p-6 text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-200 dark:border-slate-800">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    )
}
