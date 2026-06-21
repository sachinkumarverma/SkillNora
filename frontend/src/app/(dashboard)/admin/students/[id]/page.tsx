"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [student, setStudent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await apiClient.get('/api/admin/students')
                const found = res.data?.students?.find((s: any) => String(s.id) === String(id))
                setStudent(found)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStudent()
    }, [id])

    if (loading) return <Loader />

    if (!student) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 text-center">
                <h1 className="text-2xl font-bold">Student not found</h1>
                <Link href="/admin/students" className="text-blue-600 hover:underline">Back to Students</Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <Link href="/admin/students" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 inline-block">&larr; Back to Students</Link>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
        </div>
    )
}
