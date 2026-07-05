"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ConfirmActionModal from '@/components/views/ConfirmActionModal'

export default function InstructorTestSeriesDetails() {
    const { id } = useParams()
    const router = useRouter()
    const [series, setSeries] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [testToDelete, setTestToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
        
    
    const fetchSeries = () => {
        setLoading(true)
        apiClient.get(`/api/test-series/${id}`)
            .then(res => {
                setSeries(res.data.series)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchSeries()
    }, [id])

    

    

    const handleDelete = (testId: string) => {
        setTestToDelete(testId)
    }

    const executeDelete = async () => {
        if (!testToDelete) return
        setIsDeleting(true)
        try {
            await apiClient.delete(`/api/instructor/test-series/tests/${testToDelete}`)
            fetchSeries()
            toast.success("Test deleted successfully")
        } catch (error) {
            console.error("Error deleting", error)
            toast.error("Failed to delete")
        } finally {
            setIsDeleting(false)
            setTestToDelete(null)
        }
    }

    const togglePublish = async () => {
        try {
            await apiClient.put(`/api/instructor/test-series/${id}`, { ...series, is_published: !series.is_published })
            fetchSeries()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    if (loading) return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="mb-6">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start mb-8 shadow-sm">
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-4 w-full">
                        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="h-10 w-3/4 max-w-lg bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                    <div className="space-y-2 max-w-4xl">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
                        <div className="w-full sm:w-auto">
                            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-3"></div>
                            <div className="flex gap-4">
                                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
    if (!series) return <div className="p-8">Not Found</div>

    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <button onClick={() => router.push('/instructor/test-series')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Test Series
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start mb-8 shadow-sm relative overflow-hidden">
                {series.thumbnail_url && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <img src={series.thumbnail_url} alt="background" className="w-full h-full object-cover opacity-30 dark:opacity-30" />
                    </div>
                )}
                <div className="flex-1 relative z-10">
                    <div className="flex items-center justify-between mb-4 w-full">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-full uppercase tracking-wider">{series.category || 'General'}</span>
                        <button onClick={togglePublish} className={`px-3 py-1 font-bold text-xs rounded-full border transition-colors ${series.is_published ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                            {series.is_published ? 'Published (Click to Unpublish)' : 'Draft (Click to Publish)'}
                        </button>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{series.title}</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">{series.description}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tests inside this Series</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    
                    <Link href={`/instructor/test-series/${id}/new-test`} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Test
                    </Link>
                </div>
            </div>



            <div className="space-y-4">
                {(!series.tests || series.tests.length === 0) && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                        No tests added yet. Click "Add Test" to create one.
                    </div>
                )}
                {series.tests?.map((t: any) => (
                    <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t.title}</h3>
                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 mt-2">
                                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {t.duration_minutes} Mins</span>
                                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> {t.total_marks} Marks</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Test">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <Link href={`/instructor/test-series/${id}/manage/${t.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Questions">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmActionModal
                isOpen={!!testToDelete}
                onClose={() => !isDeleting && setTestToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Test"
                message="Are you sure you want to delete this test? This action cannot be undone."
                confirmText="Delete"
                confirmStyle="bg-red-600 hover:bg-red-700 shadow-red-500/30"
                icon={<svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                iconBg="bg-red-100 dark:bg-red-900/30"
                isLoading={isDeleting}
            />
        </div>
    )
}
