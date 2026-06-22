"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'

export default function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [instructor, setInstructor] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await apiClient.get('/api/admin/instructors')
                const found = res.data?.instructors?.find((s: any) => String(s.id) === String(id))
                setInstructor(found)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchInstructor()
    }, [id])

    if (loading) return <Loader />

    if (!instructor) {
        return (
            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 text-center">
                <h1 className="text-2xl font-bold">Instructor not found</h1>
                <Link href="/admin/instructors" className="text-blue-600 hover:underline">Back to Instructors</Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <Link href="/admin/instructors" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 inline-block">&larr; Back to Instructors</Link>
            
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
        </div>
    )
}
