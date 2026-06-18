"use client"
import React from 'react'
import Link from 'next/link'

const stats = [
    { label: 'Published courses', value: '8' },
    { label: 'Drafts', value: '3' },
    { label: 'Students reached', value: '2.4k' },
    { label: 'Revenue', value: '$18.2k' },
]

export default function InstructorPage() {
    return (
        <>
            <div className='p-6 md:p-8 space-y-6'>
                <section className='rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                    <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                        <div>
                            <div className='text-sm uppercase tracking-[0.25em] text-slate-500'>Instructor studio</div>
                            <h1 className='mt-2 text-2xl md:text-3xl font-black text-slate-950 dark:text-white'>Build, publish, and scale premium learning experiences.</h1>
                            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400'>Create courses, manage lectures, upload resources, and keep an eye on earnings from a clean creator dashboard.</p>
                        </div>
                        <Link href='/instructor/new' className='rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 whitespace-nowrap transition text-center w-full md:w-auto mt-4 md:mt-0'>Create course</Link>
                    </div>

                    <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        {stats.map((stat) => (
                            <div key={stat.label} className='rounded-lg bg-slate-50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950'>
                                <div className='text-xs font-bold uppercase tracking-widest text-slate-500'>{stat.label}</div>
                                <div className='mt-2 text-2xl font-black text-slate-950 dark:text-white'>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
                    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white'>Course pipeline</h2>
                        <div className='mt-5 space-y-4'>
                            {[
                                ['UX systems for SaaS', 'Draft'],
                                ['AI for product managers', 'Review'],
                                ['Growth design sprint', 'Published'],
                            ].map(([title, status]) => (
                                <div key={title} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
                                    <div>
                                        <div className='font-semibold text-slate-950 dark:text-white'>{title}</div>
                                        <div className='text-xs text-slate-500 mt-1'>Sections, lectures, media, and quizzes</div>
                                    </div>
                                    <div className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : status === 'Review' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                        <h2 className='text-sm font-bold uppercase tracking-wide text-slate-950 dark:text-white'>Upcoming tools</h2>
                        <div className='mt-5 grid gap-3'>
                            {['Drag-and-drop lecture ordering', 'Rich text editor', 'Video/resource uploads', 'Course publishing workflow'].map((item) => (
                                <div key={item} className='rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'>{item}</div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
