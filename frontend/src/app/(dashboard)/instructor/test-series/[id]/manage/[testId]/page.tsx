"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function InstructorTestQuestions() {
    const { id, testId } = useParams()
    const router = useRouter()
    const [test, setTest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    
    // Question Form State
    const [sectionName, setSectionName] = useState('General')
    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState(['', '', '', ''])
    const [correctOption, setCorrectOption] = useState(0)
    const [positiveMarks, setPositiveMarks] = useState(1)
    const [negativeMarks, setNegativeMarks] = useState(0.33)

    const fetchTest = () => {
        setLoading(true)
        apiClient.get(`/api/test-series/test/${testId}`)
            .then(res => {
                setTest(res.data.test)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchTest()
    }, [testId])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation
        if (options.some(o => !o.trim())) {
            toast.error("All 4 options must be filled.")
            return
        }

        setIsSaving(true)
        const data = {
            section_name: sectionName,
            question_text: questionText,
            options: options.map(o => o.trim()),
            correct_option_index: correctOption,
            positive_marks: positiveMarks,
            negative_marks: negativeMarks
        }

        try {
            if (editingId) {
                await apiClient.put(`/api/instructor/test-series/tests/${testId}/questions/${editingId}`, data)
                toast.success("Question updated successfully!")
            } else {
                await apiClient.post(`/api/instructor/test-series/tests/${testId}/questions`, data)
                toast.success("Question created successfully!")
            }
            setIsCreating(false)
            setEditingId(null)
            // Reset form
            setSectionName('General')
            setQuestionText('')
            setOptions(['', '', '', ''])
            setCorrectOption(0)
            setPositiveMarks(1)
            setNegativeMarks(0.33)
            fetchTest()
        } catch (error) {
            console.error("Error saving question", error)
            toast.error("Failed to save Question")
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (q: any) => {
        setSectionName(q.section_name || 'General')
        setQuestionText(q.question_text)
        setOptions(q.options)
        setCorrectOption(q.correct_option_index)
        setPositiveMarks(q.positive_marks || 1)
        setNegativeMarks(q.negative_marks || 0.33)
        setEditingId(q.id)
        setIsCreating(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (qId: string) => {
        if (!confirm("Are you sure you want to delete this Question?")) return
        try {
            await apiClient.delete(`/api/instructor/test-series/tests/${testId}/questions/${qId}`)
            fetchTest()
        } catch (error) {
            console.error("Error deleting", error)
            toast.error("Failed to delete")
        }
    }

    if (loading) return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
            <div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2"></div>
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            </div>

            <div className="space-y-6 mt-8">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                            </div>
                        </div>
                        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
    if (!test) return <div className="p-8">Not Found</div>

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <button onClick={() => router.push(`/instructor/test-series/${id}`)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Test
                </button>
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{test.title} - Questions</h1>
                        <p className="text-slate-500 font-medium">Manage questions for this test.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => {
                            setEditingId(null)
                            setSectionName('General')
                            setQuestionText('')
                            setOptions(['', '', '', ''])
                            setCorrectOption(0)
                            setPositiveMarks(1)
                            setNegativeMarks(0.33)
                            setIsCreating(true)
                        }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Question
                        </button>
                    </div>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 dark:text-white">{editingId ? 'Edit Question' : 'New Question'}</h3>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Section Name</label>
                                <input required type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Positive Marks</label>
                                <input required type="number" step="0.1" value={positiveMarks} onChange={e => setPositiveMarks(Number(e.target.value))} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Negative Marks</label>
                                <input required type="number" step="0.01" value={negativeMarks} onChange={e => setNegativeMarks(Number(e.target.value))} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Question Text (HTML allowed)</label>
                            <textarea required rows={3} value={questionText} onChange={e => setQuestionText(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Options</label>
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <input 
                                        type="radio" 
                                        name="correctOpt" 
                                        checked={correctOption === i} 
                                        onChange={() => setCorrectOption(i)} 
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                                        title="Mark as correct answer"
                                    />
                                    <input 
                                        required 
                                        type="text" 
                                        value={opt} 
                                        onChange={e => {
                                            const newOpts = [...options];
                                            newOpts[i] = e.target.value;
                                            setOptions(newOpts);
                                        }} 
                                        placeholder={`Option ${i + 1}`}
                                        className={`flex-1 h-11 rounded-xl border bg-transparent px-4 dark:text-white focus:ring-1 ${correctOption === i ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'}`} 
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" disabled={isSaving} onClick={() => { setIsCreating(false); setEditingId(null); }} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                                        Saving...
                                    </>
                                ) : (
                                    editingId ? 'Save Changes' : 'Add Question'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {(!test.questions || test.questions.length === 0) && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                        No questions added yet.
                    </div>
                )}
                {test.questions?.map((q: any, idx: number) => (
                    <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative group">
                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Question">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Question">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4 pr-24">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg uppercase tracking-wider">{q.section_name}</span>
                            <span className="text-sm font-bold text-slate-500">Q{idx + 1}</span>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="text-green-600">+{q.positive_marks}</span>
                                <span className="text-red-500">-{q.negative_marks}</span>
                            </div>
                        </div>

                        <div className="text-slate-900 dark:text-white font-medium mb-6" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                        
                        <div className="space-y-2">
                            {q.options.map((opt: string, i: number) => (
                                <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${q.correct_option_index === i ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 text-green-900 dark:text-green-100 font-semibold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    {q.correct_option_index === i ? <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                                    <span className="flex-1">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
