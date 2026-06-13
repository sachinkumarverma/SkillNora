"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const MotionDiv = motion.div as React.ComponentType<any>

const metrics = [
    { label: 'Active learners', value: '48K+' },
    { label: 'Live cohorts', value: '320' },
    { label: 'Completion rate', value: '92%' },
]

export default function Hero() {
    return (
        <section className='overflow-hidden rounded-[2rem] glass'>
            <div className='grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10'>
                <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className='space-y-6'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300'>
                        AI-powered learning platform
                    </div>
                    <div className='space-y-4'>
                        <h1 className='max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl'>
                            Futuristic eLearning for students, instructors, and admins.
                        </h1>
                        <p className='max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg'>
                            Skillnora blends course delivery, AI tutoring, analytics, payments, and community tools into a premium SaaS learning experience.
                        </p>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        <Link href='/auth' className='btn btn-primary px-6 py-3'>Start learning</Link>
                        <Link href='/admin' className='btn btn-outline px-6 py-3'>Open admin console</Link>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-3'>
                        {metrics.map((metric) => (
                            <div key={metric.label} className='surface rounded-2xl p-4'>
                                <div className='text-2xl font-black text-slate-950 dark:text-white'>{metric.value}</div>
                                <div className='text-sm muted'>{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.1 }} className='space-y-4'>
                    <div className='surface rounded-[1.75rem] p-5 shadow-2xl shadow-slate-950/10'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm font-semibold uppercase tracking-[0.25em] text-slate-500'>Learning hub</div>
                                <h2 className='mt-2 text-2xl font-bold text-slate-950 dark:text-white'>AI Product Strategy</h2>
                            </div>
                            <div className='rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300'>Live</div>
                        </div>
                        <div className='mt-5 grid grid-cols-2 gap-3 text-sm'>
                            {['Roadmaps', 'Quizzes', 'Certificates', 'Mentorship'].map((item) => (
                                <div key={item} className='rounded-2xl bg-slate-100 px-4 py-3 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200'>{item}</div>
                            ))}
                        </div>
                        <div className='mt-5 rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 p-5 text-white'>
                            <div className='text-sm/6 opacity-80'>Continue watching</div>
                            <div className='mt-2 text-xl font-bold'>Designing a premium AI dashboard</div>
                            <div className='mt-5 h-2 rounded-full bg-white/20'>
                                <div className='h-2 w-[72%] rounded-full bg-white' />
                            </div>
                            <div className='mt-3 flex items-center justify-between text-sm opacity-85'>
                                <span>72% complete</span>
                                <span>14 min left</span>
                            </div>
                        </div>
                    </div>
                    <div className='surface rounded-[1.5rem] p-5'>
                        <div className='text-sm font-semibold uppercase tracking-[0.25em] text-slate-500'>Popular now</div>
                        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                            {['AI for product teams', 'Leadership with systems'].map((course) => (
                                <div key={course} className='rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'>
                                    <div className='text-sm font-semibold text-slate-950 dark:text-white'>{course}</div>
                                    <div className='mt-2 text-xs muted'>Live cohort, community, and certificate path</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </section>
    )
}
