"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function EnrolledPage() {
    const router = useRouter()

    const [courses, setCourses] = React.useState<any[]>([])
    const [enrolledIds, setEnrolledIds] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        let active = true
        Promise.all([
            apiClient.get('/api/courses').then(r => r.data).catch(e => { console.error(e); return { courses: [] }; }),
            apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] }))
        ]).then(([coursesData, enrollData]) => {
            if (!active) return
            const allCourses = Array.isArray(coursesData) ? coursesData : coursesData.courses || coursesData.data || []
            setCourses(allCourses)
            setEnrolledIds(enrollData?.enrolledIds || [])
            setLoading(false)
        }).catch(console.error)
        return () => { active = false }
    }, [])

    if (loading) return <Loader />

    const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id))

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Enrolled Courses</h1>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-sm">
                        {enrolledCourses.length} active
                    </span>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">You aren't enrolled in any courses</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md text-center">Save courses you want to learn later by clicking the heart icon on any course card.</p>
                        <button
                            onClick={() => router.push('/courses')}
                            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Explore Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {enrolledCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => router.push(`/courses/${course.slug}`)}
                                className="group flex flex-col cursor-pointer transition-all duration-300"
                            >
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 mb-3">
                                    <img
                                        src={course.thumbnail_url || course.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"></div>
                                </div>

                                <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.75rem]">
                                    {course.title}
                                </h3>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium line-clamp-1">
                                    {course.instructor || (course as any).instructor_name || 'Expert Instructor'}
                                </p>

                                <div className="mt-auto flex items-end justify-between">
                                    <div>
                                        {course.rating ? (
                                            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold">
                                                <span className="text-amber-600 dark:text-amber-500">{Number(course.rating).toFixed(1)}</span>
                                                <div className="flex text-amber-500">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </div>
                                                <span className="text-slate-400 dark:text-slate-500 font-medium">({course.reviews_count || course.reviews || 0})</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold">
                                                <span className="text-slate-400">No rating</span>
                                            </div>
                                        )}
                                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Enrolled
                                        </div>
                                    </div>
                                    <button
                                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
