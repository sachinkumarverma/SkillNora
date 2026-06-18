"use client"
import React, { useEffect, useState } from 'react'
import { trendingCourses } from '../../../../lib/dummyData'
import useUser from '../../../../lib/useUser'
import { useRouter } from 'next/navigation'
import supabase from '../../../../lib/supabaseClient'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const [course, setCourse] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [inCart, setInCart] = useState(false)
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (course) {
            const cart = JSON.parse(localStorage.getItem('skillnora_cart') || '[]')
            setInCart(cart.some((c: any) => c.id === course.id))
        }
    }, [course])

    const handleEnroll = () => {
        if (!user) {
            router.push('/auth')
            return
        }
        router.push(`/courses/${slug}/checkout`)
    }

    const handlePreview = () => {
        router.push(`/courses/${slug}/preview`)
    }

    useEffect(() => {
        if (!slug) return
        let mounted = true
        const fetchCourse = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const { data } = await supabase.from('courses').select('*, instructor:users(full_name), lectures(*)').eq('slug', slug).single()
            if (mounted) {
                if (data) {
                    setCourse({
                        ...data,
                        instructor_name: data.instructor?.full_name || 'Instructor',
                        image: data.thumbnail_url,
                        price: `₹${data.price}`
                    })
                    if (user) {
                        const { data: enrollment } = await supabase.from('enrollments').select('id, expires_at').eq('user_id', user.id).eq('course_id', data.id).single()
                        if (enrollment) {
                            if (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date()) {
                                setIsEnrolled(true)
                            }
                        }
                    }
                } else {
                    // Fallback to dummy
                    const found = trendingCourses.find(c => c.slug === slug)
                    if (found) {
                        setCourse({
                            ...found,
                            instructor_name: found.instructor
                        })
                    }
                }
                setLoading(false)
            }
        }
        fetchCourse()
            
        return () => { mounted = false }
    }, [slug])

    if (loading) return (
        <div className="flex h-[60vh] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
    )

    if (!course) return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Course Not Found</h1>
            <p className="text-slate-500">The course you are looking for does not exist or has been removed.</p>
            <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
    )

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Course Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        {course.image && !imageError && (
                            <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none">
                                <img src={course.image} alt="bg" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="relative z-10">
                            <div className="text-blue-600 font-bold tracking-wide uppercase text-xs mb-3">{course.category || 'Course'}</div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-4">{course.title}</h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 font-medium whitespace-pre-wrap">{course.detailed_overview || course.description || 'Comprehensive learning material to advance your career and skills.'}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-amber-500">{course.average_rating || '0.00'}</span>
                                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="font-normal">({course.total_reviews || '0'} ratings)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    <span>Created by <strong className="text-slate-900 dark:text-white">{course.instructor_name ?? course.instructor_id ?? 'Expert Instructor'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    <span>English</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                {isEnrolled ? (
                                    <div className="w-full sm:w-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Enrolled
                                    </div>
                                ) : (
                                    <button onClick={handleEnroll} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm transform transition active:scale-95">
                                        Enroll Now
                                    </button>
                                )}
                                <button onClick={handlePreview} className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm transform transition active:scale-95">Preview Course</button>
                            </div>
                        </div>
                    </div>

                    {/* Lectures List */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Course Content</h2>
                        <div className="space-y-3">
                            {course.lectures?.length ? course.lectures.map((l: any, index: number) => (
                                <div key={l.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{l.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {l.duration || 'Video Lecture'}
                                            </div>
                                        </div>
                                    </div>
                                    <a href={`/courses/${course.slug}/lecture/${l.id}`} className="text-blue-600 font-bold text-sm hover:underline">Watch</a>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    No lectures have been added to this course yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
                        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                            {course.image && !imageError ? (
                                <img src={course.image} alt={course.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="text-3xl font-black text-slate-900 dark:text-white mb-6">
                                {course.price || 'Free'}
                            </div>
                            {isEnrolled ? (
                                <button onClick={handlePreview} className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm mb-3">
                                    Go to Course
                                </button>
                            ) : (
                                <button onClick={handleEnroll} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm mb-3">
                                    Enroll Now
                                </button>
                            )}
                            <p className="text-center text-xs text-slate-500 mb-6">{isEnrolled ? "You have full lifetime access" : "30-Day Money-Back Guarantee"}</p>
                            
                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Total Lectures</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.lectures?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Duration</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.lectures?.length ? `${Math.ceil(course.lectures.length * 1.5)} hours` : 'Flexible'}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> Certificate</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.certificate_type ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
