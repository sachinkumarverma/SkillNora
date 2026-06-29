"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { coursesService } from '@/services/coursesService'
import apiClient from '@/lib/apiClient'
import ConfirmDeleteModal from '@/components/views/ConfirmDeleteModal'
import AdminCourseTable from '@/components/views/AdminCourseTable'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'
import Loader from '@/components/ui/Loader'

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
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState('All')
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const data = await coursesService.getAdminAll();
            if (data) {
                const courseList = data.courses || (Array.isArray(data) ? data : []);
                const filteredList = courseList.filter((c: any) => c.is_published || c.is_archived);
                const mapped = filteredList.map((c: any) => ({
                    id: c.id,
                    title: c.title || 'Untitled Course',
                    category: c.category || 'Uncategorized',
                    instructor: c.instructor?.full_name || c.instructor?.email || 'No Instructor',
                    price: Number(c.price) > 0 ? `₹${c.price}` : <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-1 rounded">Free</span>,
                    status: c.is_published ? 'Published' : 'Archived',
                    enrollments: Number(c.enrollment_count) || 0,
                    rating: c.average_rating || 0,
                    thumbnail_url: c.thumbnail_url,
                    slug: c.slug
                }))
                setCourses(mapped)
            }
        } catch (err: any) {
            console.error("Failed to fetch courses", err);
            if (err.response) {
                const msg = err.response.data?.error || err.response.data?.details || err.message;
                setErrorMsg(`Backend Error (${err.response.status}): ${msg}`);
            } else {
                setErrorMsg(`Network/Unknown Error: ${err.message}`);
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    if (loading && courses.length === 0) return <Loader type="management-table" />

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return
        setLoading(true)

        try {
            await apiClient.post('/api/courses/delete-with-refund', { ids: [courseToDelete] });
            setCourses(courses.filter(c => c.id !== courseToDelete))
            setCourseToDelete(null)
            alert('Course deleted successfully. Active students have been partially refunded based on their remaining subscription time.')
        } catch (error: any) {
            alert('Failed to delete course: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleArchiveCourse = async (courseId: string) => {
        setLoading(true)
        try {
            await coursesService.bulkPublish([courseId], false);
            setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'Archived' } : c))
            toast.success('Course archived successfully.')
        } catch (error: any) {
            alert('Failed to archive course: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkPublish = async () => {
        if (!selectedCourses.length) return
        setLoading(true)
        try {
            await coursesService.bulkPublish(selectedCourses, true);
            setCourses(courses.map(c => selectedCourses.includes(c.id) ? { ...c, status: 'Published' } : c))
            setSelectedCourses([])
        } catch (error: any) {
            alert('Failed to publish courses: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkArchive = async () => {
        if (!selectedCourses.length) return
        setLoading(true)
        try {
            await coursesService.bulkPublish(selectedCourses, false);
            setCourses(courses.map(c => selectedCourses.includes(c.id) ? { ...c, status: 'Archived' } : c))
            toast.success(`Successfully archived ${selectedCourses.length} courses.`)
        } catch (error: any) {
            alert('Failed to archive courses: ' + error.message)
        }
        setLoading(false)
    }

    const handleBulkDelete = async () => {
        if (!selectedCourses.length) return
        if (!confirm(`Are you sure you want to delete ${selectedCourses.length} selected courses? This action cannot be undone and will trigger partial refunds.`)) return
        
        setLoading(true)
        try {
            await apiClient.post('/api/courses/delete-with-refund', { ids: selectedCourses });
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
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
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
                    className="flex items-center gap-3"
                >
                    <button 
                        onClick={fetchCourses}
                        disabled={loading}
                        className={`p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Refresh Data"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <Link href="/instructor/drafts">
                        <button className="hidden sm:flex px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm items-center gap-2 whitespace-nowrap shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Drafts
                        </button>
                    </Link>
                    <Link href="/instructor/new">
                        <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 whitespace-nowrap shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Create
                        </button>
                    </Link>
                </motion.div>
            </header>

            {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium">
                    {errorMsg}
                </div>
            )}

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
                    filteredCourses={filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                    selectedCourses={selectedCourses}
                    toggleSelect={toggleSelect}
                    toggleSelectAll={toggleSelectAll}
                    handleArchiveCourse={handleArchiveCourse}
                    setCourseToDelete={setCourseToDelete}
                    getStatusBadge={getStatusBadge}
                    editBasePath="/instructor/new"
                />

                {/* Pagination */}
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredCourses.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </motion.div>
        </div>
    )
}
