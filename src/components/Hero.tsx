"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
    return (
        <section className="rounded-xl p-8 glass shadow-md">
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Learn with AI—fast, personalized, and fun.</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Skillnora combines modern UX with AI-powered learning assistants, quizzes, and recommendations to help you progress faster.</p>
                    <div className="mt-6 flex gap-3">
                        <a className="px-5 py-3 rounded-md bg-primary-500 text-white hover:opacity-95" href="#">Get started</a>
                        <a className="px-5 py-3 rounded-md border border-slate-200 dark:border-slate-700" href="#">Explore courses</a>
                    </div>
                </motion.div>

                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="w-full lg:w-1/3">
                    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg shadow-lg">
                        <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-md" />
                        <div className="mt-4">
                            <div className="text-sm text-slate-500">Featured course</div>
                            <div className="font-semibold">Mastering AI Product</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
