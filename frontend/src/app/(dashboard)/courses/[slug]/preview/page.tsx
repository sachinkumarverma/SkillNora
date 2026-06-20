"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { coursesService } from '@/services/coursesService'

export default function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const router = useRouter()
    const [course, setCourse] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        const fetchCourse = async () => {
            const res = await coursesService.getOne(slug as string)
            const data = res?.course || res
            if (mounted) {
                if (data) {
                    setCourse({
                        ...data,
                        instructor_name: data.instructor?.full_name || 'Instructor',
                        image: data.thumbnail_url,
                        price: `₹${data.price}`
                    })
                } else {
                    setCourse(null)
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

    if (!course) return <div className="text-center py-20 text-xl font-bold">Course not found.</div>

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Course
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                {course.image && (
                    <div className="w-full relative min-h-[400px] md:min-h-[500px] flex flex-col justify-end">
                        <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        <div className="relative z-10 p-8 md:p-12 w-full">
                            {course.provide_certificate && (
                                <span className="w-max mb-4 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                    Includes Certificate
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight break-words">{course.title}</h1>
                            <p className="text-base md:text-lg text-slate-200 max-w-4xl line-clamp-6">{course.description || 'Master the concepts and skills you need to advance your career in this comprehensive guide.'}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {course.detailed_overview && (
                        <section className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Why to Choose this Course</h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {course.detailed_overview}
                            </div>
                        </section>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Course Features</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{course.lectures?.length || 0} lectures of on-demand video</span>
                            </div>

                            {course.attachments && course.attachments.length > 0 && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span>{course.attachments.length} downloadable resource{course.attachments.length > 1 ? 's' : ''}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                <span>Full lifetime access</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <span>Access on mobile and TV</span>
                            </div>
                            {course.provide_certificate && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                    <span>Certificate of completion</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-xs">What You Will Learn</h3>
                        <ul className="grid grid-cols-1 gap-3">
                            {[
                                "Master the core fundamentals and advanced concepts",
                                "Build real-world projects to add to your portfolio",
                                "Learn best practices and industry standards",
                                "Gain problem-solving skills for complex scenarios",
                                "Understand the architecture and underlying principles",
                                "Access exclusive resources and reference materials"
                            ].map((feature, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
