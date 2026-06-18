"use client"
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item?",
    message = "Are you completely sure you want to permanently delete this? This action cannot be undone."
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                            {message}
                        </p>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">Cancel</button>
                            <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
