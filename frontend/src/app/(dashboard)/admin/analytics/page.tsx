"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

const data = [
    { name: 'Technology & AI', value: 400 },
    { name: 'Business & Finance', value: 300 },
    { name: 'Design & UX', value: 300 },
    { name: 'Marketing', value: 200 },
]

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']

export default function AdminAnalyticsPage() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Platform Analytics
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Deep dive into learning trends, completion rates, and user engagement.
                    </motion.p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Course Enrollments by Category</h2>
                    <div className="flex-1 w-full min-h-[300px] min-w-0">
                        {mounted && (
                            <ResponsiveContainer width="99%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'var(--tw-colors-slate-900)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Performing Instructors</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Dr. Sarah Chen', metric: '1,245 students', revenue: '₹4.5L', progress: 100 },
                            { name: 'Michael Ross', metric: '890 students', revenue: '₹2.1L', progress: 70 },
                            { name: 'James Wilson', metric: '650 students', revenue: '₹1.8L', progress: 55 },
                            { name: 'Alex Mercer', metric: '340 students', revenue: '₹95K', progress: 30 },
                        ].map((instructor, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <span>{instructor.name}</span>
                                    <span>{instructor.revenue}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${instructor.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
