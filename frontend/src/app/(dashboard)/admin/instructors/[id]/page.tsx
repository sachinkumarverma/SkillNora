"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [instructor, setInstructor] = useState<any>(null)
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const [res, coursesRes] = await Promise.all([
                    apiClient.get('/api/admin/instructors'),
                    apiClient.get('/api/courses')
                ])
                const found = res.data?.instructors?.find((s: any) => String(s.id) === String(id))
                setInstructor(found)

                const allCourses = coursesRes.data?.courses || []
                const instructorCourses = allCourses.filter((c: any) => String(c.instructor_id) === String(id))
                setCourses(instructorCourses)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchInstructor()
    }, [id])

    if (loading) return <Loader type="admin-profile" />

    if (!instructor) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 text-center">
                <h1 className="text-2xl font-bold">Instructor not found</h1>
                <Link href="/admin/instructors" className="text-blue-600 hover:underline">Back to Instructors</Link>
            </div>
        )
    }

    return (
        <div className="w-full p-6 lg:p-8 space-y-8 pb-20">
            <Link href="/admin/instructors" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 inline-block">&larr; Back to Instructors</Link>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start overflow-hidden"
            >
                {/* Skillnora watermark */}
                <img 
                    src="/logo.png" 
                    alt="" 
                    className="absolute right-6 bottom-6 w-32 h-32 object-contain opacity-[0.06] dark:opacity-[0.04] pointer-events-none select-none"
                />

                {/* Avatar */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-5xl uppercase shrink-0">
                    {instructor.avatar_url ? (
                        <img src={instructor.avatar_url} alt={instructor.name} className="w-full h-full object-cover" />
                    ) : (
                        instructor.name?.charAt(0) || 'I'
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{instructor.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{instructor.email}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
                            <div className={`font-bold ${instructor.status === 'Approved' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{instructor.status}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</div>
                            <div className="font-bold text-slate-900 dark:text-white">{instructor.joined}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</div>
                            <div className="font-bold text-slate-900 dark:text-white">{instructor.courses}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</div>
                            <div className="font-bold text-slate-900 dark:text-white">{instructor.students}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</div>
                            <div className="font-bold text-emerald-600">{instructor.revenue}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Instructor Portfolio Section */}
            <div className="mt-8">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            Instructor Course Portfolio
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Course Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {courses.length > 0 ? (
                                    courses.map((course: any) => (
                                        <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{course.title}</td>
                                            <td className="px-6 py-4 text-slate-500">{course.category || 'Uncategorized'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${course.is_published ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                                    {course.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            <p className="font-medium">This instructor has not published any courses yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                        <Link href="/admin/courses" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2">
                            Manage Platform Courses
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
