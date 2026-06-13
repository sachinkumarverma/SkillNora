"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function InstructorCourseBuilder() {
    return (
        <>
            <div className="p-6 md:p-8">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-6">
                    
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Course Title</label>
                                <input type="text" defaultValue="Modern CSS" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Short Description</label>
                                <textarea rows={2} defaultValue="Learn advanced CSS layout techniques including Grid, Flexbox, and modern pseudo-selectors." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Video Upload</label>
                                <div className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10">
                                    <svg className="mb-3 h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag and drop video</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Dynamics</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white">Add Module</h4>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Define your curriculum.</p>
                                    <button className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Add Module</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}
