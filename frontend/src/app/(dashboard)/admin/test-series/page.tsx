"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import CustomDropdown from '@/components/ui/CustomDropdown'
import toast from 'react-hot-toast'
import ConfirmActionModal from '@/components/views/ConfirmActionModal'

export default function InstructorTestSeries() {
    const [series, setSeries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', category: '', thumbnail_url: '' })
    const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'unsplash'>('upload')
    const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchSeries = () => {
        setLoading(true)
        apiClient.get('/api/admin/test-series')
            .then(res => {
                setSeries(res.data.testSeries || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchSeries()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await apiClient.post('/api/admin/test-series', formData)
            setIsCreating(false)
            setFormData({ title: '', description: '', category: '', thumbnail_url: '' })
            fetchSeries()
        } catch (error) {
            console.error("Error creating test series", error)
            toast.error("Failed to create Test Series")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = (id: string) => {
        setSeriesToDelete(id)
    }

    const executeDelete = async () => {
        if (!seriesToDelete) return
        setIsDeleting(true)
        try {
            await apiClient.delete(`/api/admin/test-series/${seriesToDelete}`)
            fetchSeries()
            toast.success("Test Series deleted successfully")
        } catch (error) {
            console.error("Error deleting", error)
            toast.error("Failed to delete Test Series")
        } finally {
            setIsDeleting(false)
            setSeriesToDelete(null)
        }
    }


    return (
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Test Series</h1>
                    <p className="text-slate-500 font-medium">Manage your test series and exams.</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Create New
                </button>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">New Test Series</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <CustomDropdown
                                    label="Category"
                                    value={formData.category}
                                    onChange={val => setFormData({...formData, category: val})}
                                    options={[
                                        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                                        { value: 'Business', label: 'Business' },
                                        { value: 'Data Science', label: 'Data Science' },
                                        { value: 'Information Technology', label: 'Information Technology' },
                                        { value: 'Healthcare', label: 'Healthcare' },
                                        { value: 'Web Development', label: 'Web Development' },
                                        { value: 'Digital Marketing', label: 'Digital Marketing' },
                                        { value: 'Cloud Computing', label: 'Cloud Computing' },
                                        { value: 'Graphic Design', label: 'Graphic Design' },
                                        { value: 'Finance & Accounting', label: 'Finance & Accounting' }
                                    ]}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-4 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thumbnail URL</label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button type="button" onClick={() => setThumbnailMode('upload')} className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'upload' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload</button>
                                    <button type="button" onClick={() => setThumbnailMode('unsplash')} className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${thumbnailMode === 'unsplash' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Link</button>
                                </div>
                            </div>
                            {thumbnailMode === 'upload' ? (
                                <div className="flex min-h-[140px] relative overflow-hidden cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 transition hover:border-blue-400 dark:hover:border-blue-500">
                                    <input
                                        key="file-input"
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            let loadingToastId;
                                            try {
                                                loadingToastId = toast.loading('Uploading image...');
                                                const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                                const { data } = await apiClient.post('/api/upload/url', { bucket: 'course-thumbnails', filePath });
                                                if (!data.uploadUrl) throw new Error("Could not get upload url");
                                                const res = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
                                                if (!res.ok) throw new Error("Failed to upload to storage");
                                                setFormData({ ...formData, thumbnail_url: data.publicUrl });
                                                toast.success('Uploaded successfully!', { id: loadingToastId });
                                            } catch (err: any) {
                                                if (loadingToastId) toast.error('Failed to upload image', { id: loadingToastId });
                                                else toast.error('Failed to upload image');
                                            }
                                        }}
                                    />
                                    {formData.thumbnail_url && !formData.thumbnail_url.includes('unsplash.com') ? (
                                        <div className="absolute inset-0 z-0">
                                            <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                                <span className="text-sm font-bold text-white flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg backdrop-blur-sm"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Replace Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Click or drag image to upload</span>
                                            <span className="text-xs font-medium text-slate-400 mt-1">16:9 ratio recommended</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input key="url-input" type="url" value={formData.thumbnail_url || ''} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-all" />
                                    {formData.thumbnail_url && (
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm mt-2 shrink-0">
                                            <img src={formData.thumbnail_url} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" disabled={isSaving} onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                                        Saving...
                                    </>
                                ) : (
                                    'Save Series'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-pulse">
                            <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0"></div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                </div>
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <div className="h-[44px] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                    <div className="h-[44px] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : series.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Test Series Found</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Get started by creating your first test series to evaluate students' performance.</p>
                    <button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                        Create Test Series
                    </button>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {series.map(s => (
                    <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                            {s.thumbnail_url ? (
                                <img src={s.thumbnail_url} alt={s.title} className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            )}
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold z-20 ${s.is_published ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {s.is_published ? 'Published' : 'Draft'}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate w-full block">{s.title}</h3>
                            <div className="flex items-center justify-between mb-6 w-full gap-2">
                                <span className="text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-md shrink-0">{s.tests_count} Tests</span>
                                <span className="text-xs font-medium text-slate-500 truncate">{s.category || 'General'}</span>
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button onClick={() => handleDelete(s.id)} className="flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete
                                </button>
                                <Link href={`/admin/test-series/${s.id}`} className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors">
                                    Manage <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}

            <ConfirmActionModal
                isOpen={!!seriesToDelete}
                onClose={() => !isDeleting && setSeriesToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Test Series"
                message="Are you sure you want to delete this entire Test Series? All tests and progress within it will be permanently deleted. This action cannot be undone."
                confirmText="Delete Series"
                confirmStyle="bg-red-600 hover:bg-red-700 shadow-red-500/30"
                icon={<svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                iconBg="bg-red-100 dark:bg-red-900/30"
                isLoading={isDeleting}
            />
        </div>
    )
}
