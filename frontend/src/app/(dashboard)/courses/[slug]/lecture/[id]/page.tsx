"use client"
import React, { useEffect, useState } from 'react'
import api from '../../../../../../lib/api'
import VideoPlayer from '../../../../../../components/VideoPlayer'
import { trendingCourses } from '../../../../../../lib/dummyData'

export default function LecturePage({ params }: { params: Promise<{ slug: string, id: string }> }) {
    const { slug, id } = React.use(params)
    const [lecture, setLecture] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id || !slug) return
        let mounted = true
        api.api(`/api/courses/${slug}`).then((d: any) => {
            const course = d.data ?? d
            const l = (course.lectures || []).find((x: any) => String(x.id) === String(id))
            if (mounted) {
                setLecture(l ?? null)
                setLoading(false)
            }
        }).catch(() => {
            if (mounted) {
                // Fallback to dummy data
                const course = trendingCourses.find(c => c.slug === slug)
                if (course) {
                    const l = course.lectures?.find(x => String(x.id) === String(id))
                    if (l) {
                        setLecture(l)
                    }
                }
                setLoading(false)
            }
        })
        return () => { mounted = false }
    }, [slug, id])

    if (loading) return (
        <div className="flex h-[60vh] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
    )

    if (!lecture) return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Lecture Not Found</h1>
            <p className="text-slate-500">The lecture you are looking for does not exist or has been removed.</p>
            <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
    )

    const isYoutube = lecture.videoUrl?.includes('youtube.com') || lecture.video_url?.includes('youtube.com')

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <main className='lg:col-span-2'>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                            <span className="font-bold text-blue-600">Lecture {id}</span>
                            <span>•</span>
                            <span>{lecture.duration || 'Video'}</span>
                        </div>
                        <h1 className='text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6'>{lecture.title}</h1>
                        
                        <div className='overflow-hidden rounded-xl bg-black aspect-video relative shadow-lg'>
                            {isYoutube ? (
                                <iframe 
                                    className="absolute inset-0 w-full h-full"
                                    src={lecture.videoUrl || lecture.video_url} 
                                    title={lecture.title} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <VideoPlayer src={lecture.videoUrl || lecture.video_url} poster={lecture.poster_url} />
                            )}
                        </div>
                    </div>

                    <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm'>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this lecture</h2>
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {lecture.description || 'Watch this comprehensive lecture to master the concepts presented. Follow along with the code and practice to solidify your understanding.'}
                        </div>
                    </div>
                </main>
                <aside>
                    <div className='p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sticky top-24'>
                        <h3 className='font-bold text-lg text-slate-900 dark:text-white mb-4'>Resources</h3>
                        <ul className='space-y-3 text-sm'>
                            <li>
                                <a className='flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700' href='#'>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </div>
                                    <span className="font-bold">Download slides</span>
                                </a>
                            </li>
                            <li>
                                <a className='flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700' href='#'>
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className="font-bold">Read Transcript</span>
                                </a>
                            </li>
                            <li>
                                <a className='flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700' href='#'>
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                    </div>
                                    <span className="font-bold">Source Code</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    )
}
