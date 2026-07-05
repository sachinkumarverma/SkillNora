"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'

export default function TestSeriesPage() {
    const [series, setSeries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [attempts, setAttempts] = useState<any[]>([])

    useEffect(() => {
        Promise.all([
            apiClient.get('/api/test-series'),
            apiClient.get('/api/attempts').catch(() => ({ data: { attempts: [] } }))
        ])
            .then(([seriesRes, attemptsRes]) => {
                setSeries(seriesRes.data.testSeries || [])
                setAttempts(attemptsRes.data.attempts || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Test Series</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Practice and evaluate your skills with our expert-crafted test series.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-pulse">
                            <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4 w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-6 w-full flex-1"></div>
                                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6 w-full"></div>
                                <div className="h-[48px] bg-slate-200 dark:bg-slate-800 rounded-xl mt-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Test Series</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Practice and evaluate your skills with our expert-crafted test series.</p>
            </div>

            {series.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Test Series Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Check back later for new test series.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {series.map(s => (
                        <div key={s.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 flex flex-col">
                            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                {s.thumbnail_url ? (
                                    <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                                        <svg className="w-12 h-12 text-blue-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                )}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-row flex-nowrap items-center justify-between overflow-hidden gap-1.5">
                                    <div className="shrink-0 bg-slate-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm flex items-center gap-1 border border-slate-700/50 whitespace-nowrap">
                                        <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        {s.total_students || 0} Students
                                    </div>
                                    <div className="shrink bg-yellow-400 dark:bg-yellow-500 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold text-yellow-950 shadow-sm whitespace-nowrap truncate min-w-0">
                                        {s.category || 'General'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-5 flex flex-col flex-1">
                                <h3 className="text-base sm:text-m font-bold text-slate-900 dark:text-white mb-4 line-clamp-2">{s.title}</h3>
                                
                                <div className="mt-auto flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 rounded-xl mb-4 w-full">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        {s.tests_count} Tests
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Free Access
                                    </div>
                                </div>
                                
                                {s.completed_tests !== undefined && (
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-1.5 text-[11px] font-bold">
                                            <span className="text-slate-700 dark:text-slate-300">{s.completed_tests}/{s.tests_count} Completed</span>
                                            <span className="text-cyan-600 dark:text-cyan-400">{Math.round(((s.completed_tests || 0) / (s.tests_count || 1)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.round(((s.completed_tests || 0) / (s.tests_count || 1)) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                
                                <Link 
                                    href={`/test-series/${s.id}`} 
                                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                                >
                                    Go To Test Series
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
