"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import useUser from '@/lib/useUser'
import toast from 'react-hot-toast'
import ConfirmActionModal from '@/components/views/ConfirmActionModal'

type QStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'marked_answered'

export default function LiveTestPage() {
    const { id, testId } = useParams()
    const router = useRouter()
    const { user } = useUser()
    
    const [test, setTest] = useState<any>(null)
    const [attempt, setAttempt] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [showExitModal, setShowExitModal] = useState(false)
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const [isWindowFocused, setIsWindowFocused] = useState(true)
    const [showPalette, setShowPalette] = useState(false)
    
    // State
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [statuses, setStatuses] = useState<Record<string, QStatus>>({})
    
    // Timer
    const [timeLeft, setTimeLeft] = useState<number>(0)
    
    const stateRef = useRef({ answers: {}, statuses: {}, timeLeft: 0 })
    
    useEffect(() => {
        stateRef.current = { answers, statuses, timeLeft }
    }, [answers, statuses, timeLeft])

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Fetch test details and attempt
        Promise.all([
            apiClient.get(`/api/test-series/test/${testId}`),
            apiClient.post(`/api/attempts/start/${testId}`)
        ]).then(([testRes, attemptRes]) => {
            const t = testRes.data.test
            const a = attemptRes.data.attempt
            
            setTest(t)
            setAttempt(a)
            setQuestions(t.questions || [])
            
            // Restore state
            const savedState = a.saved_state || {}
            setAnswers(savedState.answers || {})
            
            const initialStatuses: Record<string, QStatus> = savedState.statuses || {}
            if (t.questions && t.questions.length > 0) {
                // Ensure all questions have at least 'not_visited' status
                t.questions.forEach((q: any) => {
                    if (!initialStatuses[q.id]) {
                        initialStatuses[q.id] = 'not_visited'
                    }
                })
                // The first question becomes 'not_answered' if it was 'not_visited'
                if (initialStatuses[t.questions[0].id] === 'not_visited') {
                    initialStatuses[t.questions[0].id] = 'not_answered'
                }
            }
            setStatuses(initialStatuses)
            
            // Determine time left
            if (a.status === 'completed') {
                router.push(`/test-series/${id}`)
                return
            }
            
            let remainingSec = savedState.time_left
            
            if (remainingSec === undefined || remainingSec === null) {
                remainingSec = t.duration_minutes * 60
            }
            
            setTimeLeft(remainingSec)
            setLoading(false)
            
            if (t.series?.title) {
                window.dispatchEvent(new CustomEvent('setBreadcrumbName', { detail: { id: id as string, name: t.series.title } }))
            }
        }).catch(err => {
            console.error(err)
            toast.error("Error loading test")
            router.push(`/test-series/${id}`)
        })
    }, [testId, id, router])

    const saveProgress = useCallback(async (forceAnswers?: any, forceStatuses?: any) => {
        if (!attempt) return
        
        const currentAnswers = forceAnswers || stateRef.current.answers
        const currentStatuses = forceStatuses || stateRef.current.statuses
        const currentTime = stateRef.current.timeLeft
        
        try {
            await apiClient.put(`/api/attempts/${attempt.id}/save`, {
                state: {
                    answers: currentAnswers,
                    statuses: currentStatuses,
                    time_left: currentTime
                }
            })
        } catch (e) {
            console.error("Failed to save progress", e)
        }
    }, [attempt])

    // Timer effect
    useEffect(() => {
        if (loading || timeLeft <= 0 || showExitModal || showSubmitModal || isNavigating) return
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    submitTest(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        
        return () => clearInterval(timer)
    }, [loading, timeLeft, showExitModal, showSubmitModal, isNavigating])

    // Auto-save periodically
    useEffect(() => {
        if (loading) return
        const interval = setInterval(() => {
            saveProgress()
        }, 30000) // every 30 secs
        return () => clearInterval(interval)
    }, [loading, saveProgress])

    const submitTest = async (isTimeout = false) => {
        try {
            if (isTimeout) {
                toast("Time's Up! Auto-submitting...", { icon: '⏳', duration: 4000 })
            }
            setIsNavigating(true)
            await apiClient.post(`/api/attempts/${attempt.id}/submit`, {
                state: { 
                    answers: stateRef.current.answers, 
                    statuses: stateRef.current.statuses, 
                    time_left: isTimeout ? 0 : stateRef.current.timeLeft 
                }
            })
            if (!isTimeout) {
                toast.success("Test submitted successfully!")
            }
            router.push(`/test-series/${id}/test/${testId}/analysis`)
        } catch (e) {
            console.error("Submit failed", e)
            setIsNavigating(false)
            toast.error("Failed to submit test. Try again.")
        }
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => console.log(err))
            setIsFullScreen(true)
        } else {
            document.exitFullscreen()
            setIsFullScreen(false)
        }
    }

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', onFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])
    
    // Anti-cheat measures
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            toast.error("Right-click is disabled during the test.")
        }
        
        const handleCopyCutPaste = (e: ClipboardEvent) => {
            e.preventDefault()
            toast.error("Clipboard actions are disabled during the test.")
        }

        const handleSelectStart = (e: Event) => {
            e.preventDefault()
            toast.error("Text selection is disabled.")
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault()
                navigator.clipboard?.writeText?.('')
                toast.error("Screenshots are not allowed during the test!")
            }
            // Block Ctrl+C, Ctrl+V, Cmd+C, Cmd+V, Ctrl+P
            if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'p', 's', 'x'].includes(e.key.toLowerCase())) {
                e.preventDefault()
                toast.error("Keyboard shortcuts are disabled during the test.")
            }
        }

        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('copy', handleCopyCutPaste)
        document.addEventListener('cut', handleCopyCutPaste)
        document.addEventListener('paste', handleCopyCutPaste)
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('selectstart', handleSelectStart)

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('copy', handleCopyCutPaste)
            document.removeEventListener('cut', handleCopyCutPaste)
            document.removeEventListener('paste', handleCopyCutPaste)
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('selectstart', handleSelectStart)
        }
    }, [])

    // Focus lost listener to block Snipping Tool / backgrounding
    useEffect(() => {
        const handleBlur = () => setIsWindowFocused(false)
        const handleFocus = () => setIsWindowFocused(true)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)
        return () => {
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const handleOptionSelect = (qId: string, optIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optIdx }))
    }

    const handleClearResponse = () => {
        const qId = questions[currentIdx].id
        setAnswers(prev => {
            const next = { ...prev }
            delete next[qId]
            return next
        })
    }

    const moveToNext = (newStatuses: Record<string, QStatus>) => {
        const nextIdx = currentIdx + 1
        if (nextIdx < questions.length) {
            setCurrentIdx(nextIdx)
            const nextQId = questions[nextIdx].id
            if (newStatuses[nextQId] === 'not_visited') {
                newStatuses[nextQId] = 'not_answered'
            }
            setStatuses(newStatuses)
            saveProgress(answers, newStatuses)
        } else {
            setStatuses(newStatuses)
            saveProgress(answers, newStatuses)
            // Show submit confirmation maybe
        }
    }

    const handleSaveAndNext = () => {
        const qId = questions[currentIdx].id
        const newStatuses = { ...statuses }
        if (answers[qId] !== undefined) {
            newStatuses[qId] = 'answered'
        } else {
            newStatuses[qId] = 'not_answered'
        }
        moveToNext(newStatuses)
    }

    const handleMarkAndNext = () => {
        const qId = questions[currentIdx].id
        const newStatuses = { ...statuses }
        if (answers[qId] !== undefined) {
            newStatuses[qId] = 'marked_answered'
        } else {
            newStatuses[qId] = 'marked'
        }
        moveToNext(newStatuses)
    }

    const jumpToQuestion = (idx: number) => {
        // Save current question status if it was just visited without answering
        const qId = questions[currentIdx].id
        const newStatuses = { ...statuses }
        
        if (newStatuses[qId] === 'not_visited' || newStatuses[qId] === 'not_answered') {
             if (answers[qId] !== undefined) {
                  newStatuses[qId] = 'answered'
             } else {
                  newStatuses[qId] = 'not_answered'
             }
        }
        
        const nextQId = questions[idx].id
        if (newStatuses[nextQId] === 'not_visited') {
            newStatuses[nextQId] = 'not_answered'
        }
        
        setStatuses(newStatuses)
        setCurrentIdx(idx)
        saveProgress(answers, newStatuses)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setShowPalette(false)
        }
    }

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        const s = secs % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    if (loading) return <Loader type="live-test" />

    const q = questions[currentIdx]

    // Calculate stats
    const stats = {
        answered: Object.values(statuses).filter(s => s === 'answered').length,
        not_answered: Object.values(statuses).filter(s => s === 'not_answered').length,
        marked: Object.values(statuses).filter(s => s === 'marked').length,
        marked_answered: Object.values(statuses).filter(s => s === 'marked_answered').length,
        not_visited: Object.values(statuses).filter(s => s === 'not_visited').length,
    }

    const getStatusClass = (status: QStatus) => {
        switch (status) {
            case 'answered': return 'bg-green-500 text-white border-green-500'
            case 'not_answered': return 'bg-red-500 text-white border-red-500'
            case 'marked': return 'bg-purple-500 text-white border-purple-500'
            case 'marked_answered': return 'bg-purple-500 text-white border-purple-500 relative after:content-[""] after:absolute after:bottom-0.5 after:right-0.5 after:w-2 after:h-2 after:bg-green-400 after:rounded-full'
            default: return 'bg-white text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
        }
    }

    return (
        <div ref={containerRef} className="flex-1 w-full flex flex-col bg-white dark:bg-slate-950 font-sans h-[calc(100dvh-4rem)] select-none test-container">
            {/* Top Header */}
            <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 shadow-md">
                <div className="font-bold truncate max-w-[40%] sm:max-w-[50%] text-sm sm:text-base">{test?.title}</div>
                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-1 sm:gap-2 bg-slate-800 px-2 sm:px-4 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold shadow-inner">
                        <span className="hidden sm:inline">Time Left:</span> <span className={timeLeft < 300 ? 'text-red-500' : 'text-green-500'}>{formatTime(timeLeft)}</span>
                    </div>
                    <button onClick={toggleFullScreen} className="hidden lg:flex hover:bg-slate-800 p-2 rounded-lg transition-colors items-center gap-2 text-sm font-semibold">
                        {isFullScreen ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m5 5v-4m0 4H5m10 0l5-5m-5 5V5m0 4h4M9 15l-5 5m5-5v4m0-4H5m10 0l5 5m-5-5v4m0-4h4" /></svg> Exit</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> Full Screen</>}
                    </button>
                </div>
            </header>

            <style jsx global>{`
                footer { display: none !important; }
                #askie-bot-container { display: none !important; }
                @media print {
                    body { display: none !important; }
                }
            `}</style>

            {/* Main Area */}
            {!isWindowFocused ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white z-50 p-6 text-center">
                    <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold mb-2">Test Paused</h2>
                    <p className="text-slate-400 mb-8 max-w-md">The test is paused because the window lost focus (e.g. attempting to take a screenshot or switching apps). Please click below to resume.</p>
                    <button onClick={() => setIsWindowFocused(true)} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white transition-colors">
                        Resume Test
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Side - Question Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative">
                    
                    {/* Section Header */}
                    <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                        <div className="bg-blue-600 text-white px-4 py-1.5 text-sm font-bold rounded-t-lg">
                            {q?.section_name || 'General'}
                        </div>
                    </div>

                    {/* Question Header */}
                    <div className="p-6 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Question No. {currentIdx + 1}</h2>
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500">Marks:</span>
                                <span className="text-green-600 dark:text-green-400">+{q?.positive_marks || 1}</span>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <span className="text-red-500 dark:text-red-400">-{q?.negative_marks || 0.33}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Body */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0 relative">
                        {q ? (
                            <div className="max-w-4xl space-y-8">
                                <div className="text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                                
                                <div className="space-y-3 mt-8">
                                    {q.options?.map((opt: string, i: number) => (
                                        <label 
                                            key={i} 
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                                answers[q.id] === i 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <div className="mt-0.5 relative flex items-center justify-center">
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q.id}`} 
                                                    className="peer sr-only"
                                                    checked={answers[q.id] === i}
                                                    onChange={() => handleOptionSelect(q.id, i)}
                                                />
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-blue-500 peer-checked:bg-white flex items-center justify-center">
                                                    <div className={`w-2.5 h-2.5 rounded-full bg-blue-500 transition-transform ${answers[q.id] === i ? 'scale-100' : 'scale-0'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">
                                                {opt}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 mt-20">No questions available.</div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0">
                        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                            <button onClick={handleMarkAndNext} className="flex-1 sm:flex-none px-2 sm:px-6 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 transition-colors whitespace-nowrap text-center">
                                Mark <span className="hidden sm:inline">for Review </span>& Next
                            </button>
                            <button onClick={handleClearResponse} className="flex-1 sm:flex-none px-2 sm:px-6 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors whitespace-nowrap text-center">
                                Clear<span className="hidden sm:inline"> Response</span>
                            </button>
                        </div>
                        <button onClick={handleSaveAndNext} className="w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-center">
                            Save & Next
                        </button>
                    </div>
                </div>

                {/* Mobile Overlay */}
                {showPalette && (
                    <div className="absolute inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowPalette(false)}></div>
                )}
                
                {/* Floating Mobile Palette Toggle */}
                <button 
                    onClick={() => setShowPalette(!showPalette)} 
                    className={`lg:hidden absolute top-1/2 -translate-y-1/2 z-[60] bg-slate-800 text-white p-2 rounded-l-xl shadow-lg border-y border-l border-slate-700 transition-all duration-300 flex items-center justify-center ${showPalette ? 'right-[280px] sm:right-80' : 'right-0'}`}
                >
                    {showPalette ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    )}
                </button>
                
                {/* Right Side - Palette */}
                <div className={`absolute lg:relative inset-y-0 z-50 w-[280px] sm:w-80 bg-blue-50/95 lg:bg-blue-50/50 dark:bg-slate-950/95 lg:dark:bg-slate-900/50 backdrop-blur-md lg:backdrop-blur-none border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ${showPalette ? 'right-0' : '-right-[280px] sm:-right-80 lg:right-0'}`}>
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
                        <img src={user?.user_metadata?.avatar_url || '/logo.png'} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" alt="avatar"/>
                        <span className="font-bold text-slate-900 dark:text-white capitalize truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    </div>
                    
                    {/* Stats Legend */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-green-500 text-white">{stats.answered}</div> Answered</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-red-500 text-white">{stats.not_answered}</div> Not Answered</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600">{stats.not_visited}</div> Not Visited</div>
                            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-purple-500 text-white">{stats.marked}</div> Marked</div>
                            <div className="flex items-center gap-2 col-span-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-purple-500 text-white relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-1.5 after:h-1.5 after:bg-green-400 after:rounded-full">{stats.marked_answered}</div> Answered & Marked for Review</div>
                        </div>
                    </div>

                    {/* Section Label */}
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold text-sm px-4 py-2 uppercase tracking-wider shrink-0">
                        {q?.section_name || 'General'}
                    </div>

                    {/* Palette Grid */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-6 gap-2">
                            {questions.map((ques, idx) => (
                                <button 
                                    key={ques.id} 
                                    onClick={() => jumpToQuestion(idx)}
                                    className={`w-full aspect-square rounded-md border text-xs font-bold transition-all flex items-center justify-center ${getStatusClass(statuses[ques.id] || 'not_visited')} ${currentIdx === idx ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'hover:opacity-80'}`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Area */}
                    <div className="px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex gap-3 items-center h-20">
                        <button onClick={() => setShowExitModal(true)} className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors uppercase tracking-wider text-xs sm:text-sm">
                            Exit
                        </button>
                        <button onClick={() => setShowSubmitModal(true)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 uppercase tracking-wider text-xs sm:text-sm">
                            Submit Test
                        </button>
                    </div>
                </div>
            </div>
            )}

            <ConfirmActionModal 
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={async () => {
                    setIsNavigating(true)
                    setShowExitModal(false)
                    await saveProgress()
                    router.push(`/test-series/${id}`)
                }}
                title="Pause & Exit?"
                message="Are you sure you want to pause and exit the test? Your progress and time will be saved, and you can resume later."
                confirmText="Save & Exit"
                icon={<svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                confirmStyle="bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
            />

            <ConfirmActionModal 
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={() => {
                    setIsNavigating(true)
                    setShowSubmitModal(false)
                    submitTest()
                }}
                title="Submit Test?"
                message="Are you sure you want to finalize and submit your test? You will not be able to change your answers after submission."
                confirmText="Submit Now"
                icon={<svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            />
        </div>
    )
}
