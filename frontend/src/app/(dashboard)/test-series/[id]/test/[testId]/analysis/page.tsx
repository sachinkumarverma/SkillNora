"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import { motion } from 'framer-motion'

export default function AnalysisPage() {
    const params = useParams()
    const { id, testId } = params
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await apiClient.get(`/api/attempts/analysis/${testId}`)
                setData(res.data.analysis)
                
                if (res.data.analysis?.test?.series?.title) {
                    window.dispatchEvent(new CustomEvent('setBreadcrumbName', { detail: { id: id as string, name: res.data.analysis.test.series.title } }))
                }
            } catch (e: any) {
                console.error(e)
                setError(e.response?.data?.error || "Failed to load analysis. Have you completed this test?")
            } finally {
                setLoading(false)
            }
        }
        fetchAnalysis()
    }, [testId])

    if (loading) return (
        <div className="w-full mx-auto p-4 sm:p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="space-y-3">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-md w-40"></div>
                </div>
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-40"></div>
            </div>

            {/* Top Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-36">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-4"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-4"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-32"></div>
                    </div>
                ))}
            </div>

            {/* Questions Breakdown Skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-48"></div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                    <div className="space-y-2 mt-4">
                                        <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
                                        <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
                                        <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
                                        <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>
    if (!data) return null

    const { attempt, test, questions, stats } = data
    const correctness = attempt.correctness_stats || { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
    const answers = attempt.saved_state?.answers || {}
    const durationSecs = (test.duration_minutes || 0) * 60
    const timeLeft = attempt.saved_state?.time_left !== undefined ? attempt.saved_state.time_left : durationSecs
    const timeSpentSecs = Math.max(0, durationSecs - timeLeft)
    const timeSpentFormatted = `${Math.floor(timeSpentSecs / 60)}m ${timeSpentSecs % 60}s`

    return (
        <div className="w-full mx-auto p-4 sm:p-8 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Performance Analysis</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{test.title} • {test.duration_minutes} Minutes</p>
                </div>
                <button 
                    onClick={() => router.push(`/test-series/${id}`)}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                    Back to Test Series
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Your Score</div>
                        <div className="text-4xl font-black">{attempt.score}</div>
                        <div className="text-blue-100 mt-2 text-xs font-semibold">Total Max: {questions.reduce((a:any,b:any) => a + Number(b.positive_marks), 0)}</div>
                    </div>
                    <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Rank</div>
                        <div className="text-4xl font-black">#{stats.rank}</div>
                        <div className="text-emerald-100 mt-2 text-xs font-semibold">Out of {stats.totalStudents} students</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-purple-100 text-sm font-bold uppercase tracking-wider mb-1">Percentile</div>
                        <div className="text-4xl font-black">{stats.percentile}%</div>
                        <div className="text-purple-100 mt-2 text-xs font-semibold">Ahead of {stats.percentile}% students</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-amber-100 text-sm font-bold uppercase tracking-wider mb-3">Attempt Stats</div>
                        <div className="flex flex-col gap-2.5 mt-1">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-white">Correct</span>
                                <span className="text-amber-700 bg-white min-w-[2.5rem] text-center px-2 py-0.5 rounded-md shadow-sm">{correctness.correct}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-white">Wrong</span>
                                <span className="text-amber-700 bg-white min-w-[2.5rem] text-center px-2 py-0.5 rounded-md shadow-sm">{correctness.incorrect}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-white">Skipped</span>
                                <span className="text-amber-700 bg-white min-w-[2.5rem] text-center px-2 py-0.5 rounded-md shadow-sm">{correctness.unattempted}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-rose-100 text-sm font-bold uppercase tracking-wider mb-1">Accuracy</div>
                        <div className="text-4xl font-black mt-1">
                            {correctness.total > 0 ? Math.round((correctness.correct / (correctness.correct + correctness.incorrect)) * 100) || 0 : 0}%
                        </div>
                        <div className="text-rose-100 mt-2 text-xs font-semibold">Of attempted questions</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Time Spent</div>
                        <div className="text-3xl lg:text-4xl font-black mt-1">{timeSpentFormatted}</div>
                        <div className="text-indigo-100 mt-2 text-xs font-semibold">Out of {test.duration_minutes} minutes</div>
                    </div>
                </div>
            </div>

            {/* Questions Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Question Breakdown</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {questions.map((q: any, idx: number) => {
                        const userAns = answers[q.id]
                        const isAttempted = userAns !== undefined && userAns !== null
                        const isCorrect = isAttempted && Number(userAns) === Number(q.correct_option_index)
                        
                        return (
                            <div key={q.id} className="p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                                        !isAttempted ? 'bg-slate-400' : (isCorrect ? 'bg-emerald-500' : 'bg-red-500')
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {!isAttempted ? (
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">Unattempted</span>
                                            ) : isCorrect ? (
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md">Correct (+{q.positive_marks})</span>
                                            ) : (
                                                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-md">Incorrect (-{q.negative_marks})</span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.question_text}</h3>
                                        
                                        <div className="grid gap-2">
                                            {q.options.map((opt: string, optIdx: number) => {
                                                const isUserSelection = isAttempted && Number(userAns) === optIdx
                                                const isActualCorrect = Number(q.correct_option_index) === optIdx
                                                
                                                let itemClass = "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                                                if (isActualCorrect) {
                                                    itemClass = "border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-500"
                                                } else if (isUserSelection && !isCorrect) {
                                                    itemClass = "border border-red-500 bg-red-50/50 dark:bg-red-900/20 ring-1 ring-inset ring-red-500"
                                                }

                                                return (
                                                    <div key={optIdx} className={`p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${itemClass}`}>
                                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                            <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                                                isActualCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 
                                                                (isUserSelection && !isCorrect ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 dark:border-slate-600')
                                                            }`}>
                                                                {isActualCorrect && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                                {isUserSelection && !isCorrect && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                                                            </div>
                                                            <span className={`text-sm font-medium leading-snug break-words flex-1 ${isActualCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : (isUserSelection && !isCorrect ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-300')}`}>
                                                                {opt}
                                                            </span>
                                                        </div>
                                                        {(isActualCorrect || isUserSelection) && (
                                                            <div className="flex items-center flex-wrap gap-2 shrink-0 ml-9 sm:ml-auto">
                                                                {isActualCorrect && !isUserSelection && <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded uppercase">Correct Answer</span>}
                                                                {isUserSelection && !isCorrect && <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded uppercase">Your Answer</span>}
                                                                {isUserSelection && isCorrect && (
                                                                    <>
                                                                        <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded uppercase">Correct Answer</span>
                                                                        <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-200 dark:bg-emerald-800/60 px-2 py-0.5 rounded uppercase">Your Answer</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        
                                        {q.explanation && (
                                            <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Explanation</div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}
