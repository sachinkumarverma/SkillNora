"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import supabase from '../../../../lib/supabaseClient'
import ConfirmDeleteModal from '../../../../components/views/ConfirmDeleteModal'
import AdminCourseTable from '../../../../components/views/AdminCourseTable'

const CustomDropdown = ({ value, options, onChange }: { value: string, options: {value: string, label: string}[], onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...'
    return (
        <div className="relative w-full sm:w-48">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
            >
                <span>{selectedLabel}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {options.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false) }}
                                    className={`px-4 py-2 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

export default function AdminCourseManagement() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState('All')
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await supabase.from('courses').select('*, instructor:users(full_name, email)')
            if (data) {
                const mapped = data.map((c: any) => ({
                    id: c.id,
                    title: c.title || 'Untitled Course',
                    category: c.category || 'Uncategorized',
                    instructor: c.instructor?.full_name || c.instructor?.email || 'No Instructor',
                    price: `₹${c.price || 0}`,
                    status: c.is_published ? 'Published' : 'Draft',
                    enrollments: 0,
                    rating: c.average_rating || 0,
                    thumbnail_url: c.thumbnail_url,
                    slug: c.slug
                }))
                setCourses(mapped)
            }
            setLoading(false)
        }
        fetchCourses()
    }, [])

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return
        setLoading(true)

        try {
            // Find active enrollments to issue partial refunds
            const { data: activeEnrollments } = await supabase.from('enrollments')
                .select('user_id, expires_at')
                .eq('course_id', courseToDelete)
                .gte('expires_at', new Date().toISOString())

            if (activeEnrollments && activeEnrollments.length > 0) {
                // Get the course price
                const { data: courseData } = await supabase.from('courses').select('price').eq('id', courseToDelete).single()
                const coursePrice = courseData?.price || 0
                
                // Calculate refund amount based on remaining duration (assuming 1 year total)
                const refundsToInsert = activeEnrollments.map(enr => {
                    const expiresAt = new Date(enr.expires_at).getTime()
                    const now = new Date().getTime()
                    const remainingMs = expiresAt - now
                    const msInYear = 365 * 24 * 60 * 60 * 1000
                    const percentRemaining = Math.max(0, Math.min(1, remainingMs / msInYear))
                    const refundAmount = Math.round(coursePrice * percentRemaining * 100) / 100

                    return {
                        user_id: enr.user_id,
                        course_id: courseToDelete,
                        amount: refundAmount,
                        reason: 'Course deleted by admin',
                        status: 'processed'
                    }
                }).filter(r => r.amount > 0)

                if (refundsToInsert.length > 0) {
                    await supabase.from('refunds').insert(refundsToInsert)
                }
            }

            const { error } = await supabase.from('courses').delete().eq('id', courseToDelete)
            if (!error) {
                setCourses(courses.filter(c => c.id !== courseToDelete))
                setCourseToDelete(null)
                alert('Course deleted successfully. Active students have been partially refunded based on their remaining subscription time.')
            } else {
                throw error
            }
        } catch (error: any) {
            alert('Failed to delete course: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleArchiveCourse = async (courseId: string) => {
        setLoading(true)
        const { error } = await supabase.from('courses').update({ is_published: false }).eq('id', courseId)
        if (!error) {
            setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'Draft' } : c))
        } else {
            alert('Failed to archive course: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkPublish = async () => {
        if (!selectedCourses.length) return
        setLoading(true)
        const { error } = await supabase.from('courses').update({ is_published: true }).in('id', selectedCourses)
        if (!error) {
            setCourses(courses.map(c => selectedCourses.includes(c.id) ? { ...c, status: 'Published' } : c))
            setSelectedCourses([])
        } else {
            alert('Failed to publish courses: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkArchive = async () => {
        if (!selectedCourses.length) return
        setLoading(true)
        const { error } = await supabase.from('courses').update({ is_published: false }).in('id', selectedCourses)
        if (!error) {
            setCourses(courses.map(c => selectedCourses.includes(c.id) ? { ...c, status: 'Draft' } : c))
            setSelectedCourses([])
        } else {
            alert('Failed to archive courses: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkDelete = async () => {
        if (!selectedCourses.length) return
        if (!confirm(`Are you sure you want to delete ${selectedCourses.length} selected courses? This action cannot be undone and will trigger partial refunds.`)) return
        
        setLoading(true)
        try {
            for (const id of selectedCourses) {
                const { data: activeEnrollments } = await supabase.from('enrollments')
                    .select('user_id, expires_at')
                    .eq('course_id', id)
                    .gte('expires_at', new Date().toISOString())

                if (activeEnrollments && activeEnrollments.length > 0) {
                    const { data: courseData } = await supabase.from('courses').select('price').eq('id', id).single()
                    const coursePrice = courseData?.price || 0
                    
                    const refundsToInsert = activeEnrollments.map(enr => {
                        const expiresAt = new Date(enr.expires_at).getTime()
                        const now = new Date().getTime()
                        const remainingMs = expiresAt - now
                        const msInYear = 365 * 24 * 60 * 60 * 1000
                        const percentRemaining = Math.max(0, Math.min(1, remainingMs / msInYear))
                        const refundAmount = Math.round(coursePrice * percentRemaining * 100) / 100

                        return {
                            user_id: enr.user_id,
                            course_id: id,
                            amount: refundAmount,
                            reason: 'Course bulk deleted by admin',
                            status: 'processed'
                        }
                    }).filter(r => r.amount > 0)

                    if (refundsToInsert.length > 0) {
                        await supabase.from('refunds').insert(refundsToInsert)
                    }
                }
                await supabase.from('courses').delete().eq('id', id)
            }
            
            setCourses(courses.filter(c => !selectedCourses.includes(c.id)))
            setSelectedCourses([])
            alert(`Successfully deleted ${selectedCourses.length} courses and issued partial refunds.`)
        } catch (error: any) {
            alert('Failed to bulk delete courses: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const toggleSelectAll = () => {
        if (selectedCourses.length === filteredCourses.length) {
            setSelectedCourses([])
        } else {
            setSelectedCourses(filteredCourses.map(c => c.id))
        }
    }

    const toggleSelect = (id: string) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(cid => cid !== id))
        } else {
            setSelectedCourses([...selectedCourses, id])
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Published': return <span className="px-3 py-1 rounded-md w-fit text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Published</span>
            case 'Draft': return <span className="px-3 py-1 rounded-md w-fit text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Draft</span>
            case 'Pending Approval': return <span className="px-3 py-1 rounded-md w-fit text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending</span>
            case 'Archived': return <span className="px-3 py-1 rounded-md w-fit text-xs font-bold bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Archived</span>
            default: return null
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <ConfirmDeleteModal 
                isOpen={!!courseToDelete}
                onClose={() => setCourseToDelete(null)}
                onConfirm={confirmDeleteCourse}
                title="Delete Course?"
                message="Are you completely sure you want to permanently delete this course? This action cannot be undone and all enrollments will be lost."
            />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Course Management
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Create, edit, and manage all courses across the platform.
                    </motion.p>
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3"
                >
                    <Link href="/instructor/new">
                        <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Create Course
                        </button>
                    </Link>
                </motion.div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
                {/* Advanced Filters & Actions Bar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                placeholder="Search by title or instructor..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all"
                            />
                        </div>
                        <CustomDropdown 
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Published', label: 'Published' },
                                { value: 'Draft', label: 'Drafts' },
                                { value: 'Pending Approval', label: 'Pending Approval' },
                                { value: 'Archived', label: 'Archived' }
                            ]}
                        />
                    </div>

                    {selectedCourses.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 animate-in fade-in zoom-in duration-200">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{selectedCourses.length} selected</span>
                            <div className="h-4 w-px bg-blue-200 dark:bg-blue-800 mx-2"></div>
                            <button onClick={handleBulkPublish} className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Publish</button>
                            <button onClick={handleBulkArchive} className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-2">Archive</button>
                            <button onClick={handleBulkDelete} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors ml-2">Delete</button>
                        </div>
                    )}
                </div>

                {/* Data Table */}
                <AdminCourseTable
                    loading={loading}
                    filteredCourses={filteredCourses}
                    selectedCourses={selectedCourses}
                    toggleSelect={toggleSelect}
                    toggleSelectAll={toggleSelectAll}
                    handleArchiveCourse={handleArchiveCourse}
                    setCourseToDelete={setCourseToDelete}
                    getStatusBadge={getStatusBadge}
                />

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-slate-500">
                    <div>Showing 1 to {filteredCourses.length} of {filteredCourses.length} entries</div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">1</button>
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
