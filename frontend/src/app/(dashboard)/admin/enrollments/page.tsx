"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function PlaceholderPage() {
    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20 flex items-center justify-center min-h-[60vh]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center max-w-lg"
            >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Module Under Construction</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">We are actively building this feature for the next phase. Stay tuned!</p>
            </motion.div>
        </div>
    )
}
