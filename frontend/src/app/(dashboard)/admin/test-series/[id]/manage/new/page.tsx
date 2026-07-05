"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import toast from 'react-hot-toast'

const extractAndParseJSON = (str: string, expectArray = false) => {
    try {
        const match = str.match(/```json\n([\s\S]*?)\n```/i) || str.match(/```\n([\s\S]*?)\n```/i);
        if (match) return JSON.parse(match[1]);
        const fallbackMatch = expectArray ? str.match(/\[[\s\S]*\]/) : str.match(/\{[\s\S]*\}/);
        if (fallbackMatch) return JSON.parse(fallbackMatch[0]);
        return JSON.parse(str);
    } catch (e) {
        throw new Error("Failed to parse JSON");
    }
};

export default function CreateTestPage() {
    const { id } = useParams()
    const router = useRouter()
    
    const [series, setSeries] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    
    const [formData, setFormData] = useState({ title: '', duration_minutes: '20', total_marks: '100' })
    const [questions, setQuestions] = useState<any[]>([])

    useEffect(() => {
        apiClient.get(`/api/test-series/${id}`)
            .then(res => {
                setSeries(res.data.series)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id])

    const generateMCQs = async () => {
        if (!formData.title) {
            toast.error('Please enter a Test Title first to generate relevant questions.');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const res = await apiClient.post('/api/ai/chat', {
                messages: [
                    { role: 'user', content: `Generate 30 MCQs for the test: "${formData.title}" in the category: "${series?.category || 'General'}"` }
                ],
                options: {
                    systemPromptOverride: 'You are an instructional designer. Return a JSON object with a "questions" key containing exactly 30 multiple-choice questions for the given test topic. Each object must have: "question" (string), "options" (an array of exactly 4 string options), and "correctIndex" (integer 0-3 indicating the correct option). Return ONLY valid JSON.',
                    maxTokens: 4000,
                    useJsonFormat: true,
                    model: 'llama-3.3-70b-versatile'
                }
            });
            let reply = res.data?.reply || '';
            
            let generated = null;
            try {
                if (typeof reply === 'string') {
                    generated = extractAndParseJSON(reply, false);
                } else {
                    generated = reply;
                }
                generated = generated.questions || generated.mcqs || generated.data || null;
            } catch (err1) {
                console.error("Parse error", err1);
            }

            if (Array.isArray(generated)) {
                setQuestions([...questions, ...generated]);
                toast.success('Successfully generated questions with AI!');
            } else {
                throw new Error("Invalid format received");
            }
        } catch (e) {
            console.error('Error generating questions', e);
            toast.error('Failed to generate questions via AI. Please try again.');
        } finally {
            setIsGeneratingAI(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.duration_minutes || !formData.total_marks) {
            toast.error("Please provide duration and total marks.");
            return;
        }
        
        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question?.trim() || q.options?.some((opt: string) => !opt.trim())) {
                toast.error(`Please complete Question ${i + 1} and all its options.`);
                return;
            }
        }

        setIsSaving(true)
        try {
            await apiClient.post(`/api/admin/test-series/${id}/tests`, {
                ...formData,
                duration_minutes: Number(formData.duration_minutes),
                total_marks: Number(formData.total_marks),
                instructions: '<p>Default instructions generated dynamically.</p>',
                questions: questions
            })
            toast.success("Test created successfully!")
            router.push(`/admin/test-series/${id}`)
        } catch (error) {
            console.error("Error creating test", error)
            toast.error("Failed to create Test")
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return <Loader />
    if (!series) return <div className="p-8">Not Found</div>

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Link href={`/admin/test-series/${id}`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Series Details
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create New Test</h1>
                <p className="text-slate-500 font-medium">Add a new test to <span className="font-bold text-slate-700 dark:text-slate-300">{series.title}</span></p>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
                {/* Manual Creation Form */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Test Title <span className="text-red-500">*</span></label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. JavaScript Fundamentals Exam" className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Duration (Minutes) <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Marks <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: e.target.value})} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Test Questions (MCQs)</h3>
                            <p className="text-xs text-slate-500 mt-1">Add questions to test student knowledge.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={generateMCQs} disabled={isGeneratingAI} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                                {isGeneratingAI ? (
                                    <>
                                        <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> AI Generate Quiz
                                    </>
                                )}
                            </button>
                            <button type="button" onClick={() => {
                                setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
                            }} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors">+ Add Question</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {questions.map((mcq, qIdx) => (
                            <div key={qIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                                <button type="button" onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions.splice(qIdx, 1);
                                    setQuestions(newQuestions);
                                }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-full p-1 shadow-sm transition-colors z-10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

                                <div className="p-4 pt-6">
                                    <input type="text" value={mcq.question} onChange={e => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIdx].question = e.target.value;
                                        setQuestions(newQuestions);
                                    }} placeholder="Question text..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm mb-4 font-bold text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none" />

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-500 mb-2">Select the correct answer below:</p>
                                        {mcq.options.map((opt: string, optIdx: number) => (
                                            <div key={optIdx} className="flex items-center gap-3">
                                                <input type="radio" name={`correct-${qIdx}`} checked={mcq.correctIndex === optIdx} onChange={() => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIdx].correctIndex = optIdx;
                                                    setQuestions(newQuestions);
                                                }} className="w-4 h-4 text-emerald-500 cursor-pointer" title="Set as correct answer" />
                                                <input type="text" value={opt} onChange={e => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIdx].options[optIdx] = e.target.value;
                                                    setQuestions(newQuestions);
                                                }} placeholder={`Option ${optIdx + 1}`} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none" />
                                                {mcq.correctIndex === optIdx && <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium bg-white dark:bg-slate-900">
                                No questions added yet. Click "+ Add Question" or "AI Generate Quiz" to start.
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <Link href={`/admin/test-series/${id}`} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</Link>
                    <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {isSaving ? 'Creating...' : 'Create Test'}
                    </button>
                </div>
            </form>
        </div>
    )
}
