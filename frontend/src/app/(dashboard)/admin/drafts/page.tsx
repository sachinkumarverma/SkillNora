"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { coursesService } from '@/services/coursesService'
import Loader from '@/components/ui/Loader'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from '@/components/views/ConfirmDeleteModal'

export default function AdminDraftsPage() {
    const router = useRouter()
    const [dbDrafts, setDbDrafts] = useState<any[]>([])
    const [localDraft, setLocalDraft] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })

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

    if (loading) return <Loader type="draft-courses" />

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

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => {
        const allIds = new Set<string>()
        if (localDraft) allIds.add('__local__')
        dbDrafts.forEach(d => allIds.add(d.id))
        setSelectedIds(allIds)
    }

    const deselectAll = () => setSelectedIds(new Set())

    const totalItems = dbDrafts.length + (localDraft ? 1 : 0)
    const allSelected = selectedIds.size === totalItems && totalItems > 0

    const deleteLocalDraft = () => {
        localStorage.removeItem('local_course_draft')
        setLocalDraft(null)
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.delete('__local__')
            return next
        })
    }

    const deleteCloudDraft = async (id: string) => {
        try {
            await coursesService.bulkDelete([id])
            setDbDrafts(prev => prev.filter(d => d.id !== id))
            setSelectedIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        } catch (err) {
            console.error("Failed to delete draft", err)
            throw err
        }
    }

    const handleDeleteSingle = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setConfirmModal({
            isOpen: true,
            title: id === '__local__' ? 'Discard Local Draft?' : 'Delete Draft?',
            message: id === '__local__' ? 'This will remove your unsaved local draft. This cannot be undone.' : 'This draft will be permanently deleted. This action cannot be undone.',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
                try {
                    if (id === '__local__') {
                        deleteLocalDraft()
                        toast.success('Local draft discarded')
                    } else {
                        await deleteCloudDraft(id)
                        toast.success('Draft deleted')
                    }
                } catch {
                    toast.error('Failed to delete draft')
                }
            }
        })
    }

    const triggerBulkDelete = () => {
        if (selectedIds.size === 0) return
        setConfirmModal({
            isOpen: true,
            title: `Delete ${selectedIds.size} Draft${selectedIds.size > 1 ? 's' : ''}?`,
            message: `This will permanently delete ${selectedIds.size} draft${selectedIds.size > 1 ? 's' : ''}. This action cannot be undone.`,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
                executeBulkDelete()
            }
        })
    }

    const executeBulkDelete = async () => {

        setIsDeleting(true)
        try {
            if (selectedIds.has('__local__')) {
                deleteLocalDraft()
            }

            const cloudIds = [...selectedIds].filter(id => id !== '__local__')
            if (cloudIds.length > 0) {
                await coursesService.bulkDelete(cloudIds)
                setDbDrafts(prev => prev.filter(d => !cloudIds.includes(d.id)))
            }

            setSelectedIds(new Set())
            toast.success(`${selectedIds.size} draft${selectedIds.size > 1 ? 's' : ''} deleted`)
        } catch (err) {
            console.error("Bulk delete failed", err)
            toast.error('Failed to delete some drafts')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Draft Courses</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Resume your course creation from where you left off.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={triggerBulkDelete}
                        disabled={selectedIds.size === 0 || isDeleting}
                        className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 ${selectedIds.size === 0 ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        {isDeleting ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Deleting...</>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                <span className="hidden sm:inline">Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</span>
                            </>
                        )}
                    </button>
                    <Link href="/admin/courses/new">
                        <button className="px-4 sm:px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            <span className="hidden sm:inline">Create New</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Local Draft Card */}
                {localDraft && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`group relative flex flex-col bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-2 p-6 cursor-pointer hover:shadow-lg transition-all ${selectedIds.has('__local__') ? 'border-amber-400 dark:border-amber-500 shadow-md' : 'border-amber-200 dark:border-amber-800/50'}`}
                        onClick={() => router.push('/admin/courses/new')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Local Unsaved Draft</span>
                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleSelect('__local__') }}
                                className="p-1 z-10"
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${selectedIds.has('__local__') ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 opacity-50 group-hover:opacity-100'}`}>
                                    {selectedIds.has('__local__') && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </div>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 break-all">{localDraft.title}</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
                            Last saved: {timeAgo(localDraft.updated_at)}
                        </p>
                    </motion.div>
                )}

                {/* Cloud Draft Cards */}
                {dbDrafts.map((draft: any) => (
                    <motion.div 
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border p-6 cursor-pointer hover:shadow-lg transition-all ${selectedIds.has(draft.id) ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
                        onClick={() => router.push(`/admin/courses/new?course_id=${draft.id}`)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Cloud Draft</span>
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleSelect(draft.id) }}
                                className="p-1 z-10"
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${selectedIds.has(draft.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 opacity-50 group-hover:opacity-100'}`}>
                                    {selectedIds.has(draft.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </div>
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
            <ConfirmDeleteModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    )
}
