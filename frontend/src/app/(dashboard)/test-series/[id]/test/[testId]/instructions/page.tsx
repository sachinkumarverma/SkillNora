"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import useUser from '@/lib/useUser'
import toast from 'react-hot-toast'

export default function TestInstructionsPage() {
    const { id, testId } = useParams()
    const router = useRouter()
    const { user } = useUser()
    const [test, setTest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [existingAttempt, setExistingAttempt] = useState<any>(null)
    const [completedAttempt, setCompletedAttempt] = useState<any>(null)

    useEffect(() => {
        Promise.all([
            apiClient.get(`/api/test-series/test/${testId}`),
            apiClient.get('/api/attempts')
        ]).then(([res, attemptsRes]) => {
                setTest(res.data.test)
                
                const attempts = attemptsRes.data.attempts || []
                const inProgress = attempts.find((a: any) => a.test_id === testId && a.status === 'in_progress')
                if (inProgress) {
                    setExistingAttempt(inProgress)
                }
                const completed = attempts.find((a: any) => a.test_id === testId && a.status === 'completed')
                if (completed) {
                    setCompletedAttempt(completed)
                }

                setLoading(false)
                
                if (res.data.test?.series?.title) {
                    window.dispatchEvent(new CustomEvent('setBreadcrumbName', { detail: { id: id as string, name: res.data.test.series.title } }))
                }
                if (res.data.test?.title) {
                    window.dispatchEvent(new CustomEvent('setBreadcrumbName', { detail: { id: testId as string, name: res.data.test.title } }))
                }
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [testId])

    if (loading) {
        return (
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                    <div className="flex-1 p-8 md:p-12">
                        <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
                        <div className="flex gap-8 mb-12">
                            <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="w-64 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                        <div className="space-y-4 mb-8">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>)}
                        </div>
                        <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    </div>
                    <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
                        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                </div>
                <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
                    <div className="w-64 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-48 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            </div>
        )
    }
    if (!test) return <div className="p-8 text-center">Test not found</div>

    const handleStart = async () => {
        if (!agreed) return
        setStarting(true)
        try {
            await apiClient.post(`/api/attempts/start/${testId}`)
            router.push(`/test-series/${id}/test/${testId}/live`)
        } catch (err) {
            console.error("Failed to start test", err)
            toast.error("Failed to start test. Please try again.")
            setStarting(false)
        }
    }

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                
                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-8">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">{test.series?.title} - {test.title}</h1>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Duration: {test.duration_minutes} Mins
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Maximum Marks: {test.total_marks}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Read the following instructions carefully:
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                                <ol className="list-decimal pl-5 space-y-2 font-medium">
                                    <li>The test contains multiple sections with questions.</li>
                                    <li>Each question has 4 options out of which only one is correct.</li>
                                    <li>You have to finish the test in <strong>{test.duration_minutes}</strong> minutes.</li>
                                    {test.questions && <li>The test contains a total of <strong>{test.questions.length}</strong> questions.</li>}
                                    <li>Try not to guess the answer as there might be negative marking depending on the question.</li>
                                    <li>You can navigate between questions using the Question Palette on the right side of the screen.</li>
                                    <li>There is no negative marking for unattempted questions.</li>
                                    <li>Make sure that you complete the test before you submit the test and/or close the browser.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Question Palette Guide:</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md border-2 border-slate-300 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">1</div>
                                    <span>Not Visited</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-red-500 text-white flex items-center justify-center shrink-0">2</div>
                                    <span>Not Answered</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-green-500 text-white flex items-center justify-center shrink-0">3</div>
                                    <span>Answered</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-purple-500 text-white flex items-center justify-center shrink-0">4</div>
                                    <span>Marked for Review</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 overflow-hidden shadow-inner border-4 border-white dark:border-slate-800">
                        {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                            <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-500">
                                {(user?.user_metadata?.full_name || user?.email || 'SN').slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white capitalize text-center">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                        <svg className={`absolute w-3.5 h-3.5 text-white pointer-events-none transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        I have read and understood all instructions. I agree to abide by them.
                    </span>
                </label>
                
                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => router.back()}
                        disabled={starting}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {completedAttempt && (
                        <button 
                            onClick={() => router.push(`/test-series/${id}/test/${testId}/analysis`)}
                            disabled={starting}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Analysis
                        </button>
                    )}
                    <button 
                        onClick={handleStart}
                        disabled={!agreed || starting}
                        className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                            existingAttempt 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                    >
                        {starting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {existingAttempt ? 'Resuming...' : (completedAttempt ? 'Starting Retake...' : 'Starting...')}
                            </>
                        ) : (
                            existingAttempt ? 'Resume Test' : (completedAttempt ? 'Retake Test' : 'I am ready to begin')
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
