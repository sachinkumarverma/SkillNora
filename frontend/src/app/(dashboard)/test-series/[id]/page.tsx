"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import { useParams, useRouter } from 'next/navigation'

export default function TestSeriesDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [series, setSeries] = useState<any>(null)
    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            apiClient.get(`/api/test-series/${id}`),
            apiClient.get('/api/attempts')
        ]).then(([seriesRes, attemptsRes]) => {
            setSeries(seriesRes.data.series)
            setAttempts(attemptsRes.data.attempts || [])
            setLoading(false)
            
            if (seriesRes.data.series?.title) {
                window.dispatchEvent(new CustomEvent('setBreadcrumbName', { detail: { id: id as string, name: seriesRes.data.series.title } }))
            }
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [id])

    if (loading) {
        return (
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-64 aspect-video md:aspect-square shrink-0 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="flex-1 w-full">
                        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
                        <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                        <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                        <div className="flex gap-4">
                            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0"></div>
                                    <div>
                                        <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                                        <div className="flex gap-4">
                                            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-40 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    if (!series) return <div className="p-8 text-center">Test Series not found</div>

    const getTestAttemptInfo = (testId: string) => {
        const testAttempts = attempts.filter(a => a.test_id === testId)
        if (testAttempts.length === 0) return null
        // Find if any is completed
        const completed = testAttempts.find(a => a.status === 'completed')
        if (completed) return completed
        // Return latest in_progress
        return testAttempts[0]
    }

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-64 aspect-video md:aspect-square shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
                    {series.thumbnail_url ? (
                        <img src={series.thumbnail_url} alt={series.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="inline-flex px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-full mb-4 uppercase tracking-wider">
                        {series.category || 'General'}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{series.title}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{series.description}</p>
                    <div className="flex items-center gap-6 text-sm font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {series.tests?.length || 0} Tests
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Included Tests</h2>
                <div className="space-y-4">
                    {(!series.tests || series.tests.length === 0) && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center text-slate-500">
                            No tests available in this series yet.
                        </div>
                    )}
                    
                    {series.tests?.map((test: any, index: number) => {
                        const attemptInfo = getTestAttemptInfo(test.id)
                        const isCompleted = attemptInfo?.status === 'completed'
                        const isInProgress = attemptInfo?.status === 'in_progress'

                        return (
                            <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center sm:justify-between hover:border-blue-300 transition-colors group">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold ${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                        {isCompleted ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{test.title}</h3>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {test.duration_minutes} Mins</span>
                                            <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {test.total_marks} Marks</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                    {isCompleted && attemptInfo && (
                                        <div className="text-right mr-2">
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score</div>
                                            <div className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{attemptInfo.score} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {test.total_marks}</span></div>
                                        </div>
                                    )}
                                    {isCompleted && (
                                        <button 
                                            onClick={() => router.push(`/test-series/${id}/test/${test.id}/analysis`)}
                                            className="px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                            Analysis
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => router.push(`/test-series/${id}/test/${test.id}/instructions`)}
                                        className={`w-36 justify-center px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
                                            isCompleted 
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20' 
                                                : isInProgress
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                                        }`}
                                    >
                                        {isCompleted ? 'Retake Test' : isInProgress ? 'Resume Test' : 'Start Test'}
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
