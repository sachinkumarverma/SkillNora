"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [student, setStudent] = useState<any>(null)
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const [res, coursesRes] = await Promise.all([
                    apiClient.get('/api/admin/students'),
                    apiClient.get('/api/courses')
                ])
                const found = res.data?.students?.find((s: any) => String(s.id) === String(id))
                setStudent(found)

                // Temporary simulation: Map global courses to this student's enrollment count to populate the UI table
                const allCourses = coursesRes.data?.courses || []
                const numEnrolled = found?.enrolled || 0
                if (numEnrolled > 0 && allCourses.length > 0) {
                    setEnrolledCourses(allCourses.slice(0, numEnrolled))
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStudent()
    }, [id])

    if (loading) return <Loader type="admin-profile" />

    if (!student) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 text-center">
                <h1 className="text-2xl font-bold">Student not found</h1>
                <Link href="/admin/students" className="text-blue-600 hover:underline">Back to Students</Link>
            </div>
        )
    }

    return (
        <div className="w-full p-6 lg:p-8 space-y-8 pb-20">
            <Link href="/admin/students" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 inline-block">&larr; Back to Students</Link>
            
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
                <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-5xl uppercase shrink-0">
                    {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        student.name?.charAt(0) || 'S'
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{student.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{student.email}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
                            <div className={`font-bold ${student.status === 'Active' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{student.status}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</div>
                            <div className="font-bold text-slate-900 dark:text-white">{student.joined}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrollments</div>
                            <div className="font-bold text-slate-900 dark:text-white">{student.enrolled}</div>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificates</div>
                            <div className="font-bold text-slate-900 dark:text-white">{student.completed}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enrolled Courses Section */}
            <div className="mt-8">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            Enrolled Courses
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Course Title</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {enrolledCourses.length > 0 ? (
                                    enrolledCourses.map((course: any, idx: number) => {
                                        const isCompleted = idx < (student.completed || 0);
                                        const progress = isCompleted ? 100 : Math.floor(Math.random() * 60) + 10;
                                        return (
                                            <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{course.title}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${isCompleted ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                                                        {isCompleted ? 'Completed' : 'In Progress'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            <p className="font-medium">This student is not enrolled in any courses yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                        <Link href="/admin/payments" className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2">
                            View Platform Enrollments
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
