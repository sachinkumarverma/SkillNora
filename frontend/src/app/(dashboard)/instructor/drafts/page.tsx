"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { coursesService } from '@/services/coursesService'
import Loader from '@/components/ui/Loader'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function DraftsPage() {
    const router = useRouter()
    const [dbDrafts, setDbDrafts] = useState<any[]>([])
    const [localDraft, setLocalDraft] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const data = await coursesService.getAdminAll();
                if (data) {
                    const courseList = data.courses || (Array.isArray(data) ? data : []);
                    const drafts = courseList.filter((c: any) => !c.is_published && !c.is_archived).map((c: any) => ({
                        id: c.id,
                        title: c.title || 'Untitled Course',
                        updated_at: c.updated_at || c.created_at,
                        thumbnail_url: c.thumbnail_url
                    }))
                    setDbDrafts(drafts)
                }
            } catch (err) {
                console.error("Failed to fetch drafts", err)
            }
            
            // Check local storage draft
            const savedDraftStr = localStorage.getItem('local_course_draft')
            if (savedDraftStr) {
                try {
                    const parsed = JSON.parse(savedDraftStr)
                    setLocalDraft({
                        title: parsed.courseData?.title || 'Unsaved Local Draft',
                        updated_at: parsed.lastSaved || new Date().toISOString()
                    })
                } catch (e) {}
            }
            
            setLoading(false)
        }
        
        fetchDrafts()
    }, [])

    if (loading) return <Loader />

    const timeAgo = (dateStr: string) => {
        if (!dateStr) return 'Unknown time'
        const date = new Date(dateStr)
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    return (
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Draft Courses</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Resume your course creation from where you left off.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/instructor/new">
                        <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Create New
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {localDraft && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => router.push('/instructor/new')}
                        className="group flex flex-col bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 p-6 cursor-pointer hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Local Unsaved Draft</span>
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 break-all">{localDraft.title}</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
                            Last saved: {timeAgo(localDraft.updated_at)}
                        </p>
                    </motion.div>
                )}

                {dbDrafts.map((draft: any) => (
                    <motion.div 
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => router.push(`/instructor/new?course_id=${draft.id}`)}
                        className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Cloud Draft</span>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 break-all">{draft.title}</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            Last saved: {timeAgo(draft.updated_at)}
                        </p>
                    </motion.div>
                ))}

                {!localDraft && dbDrafts.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No drafts found</h2>
                        <p className="text-slate-500">You don't have any in-progress courses. Start creating one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
