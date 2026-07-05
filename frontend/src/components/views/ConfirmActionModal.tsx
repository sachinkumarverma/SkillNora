"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmStyle = "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
    icon = (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    iconBg = "bg-blue-100 dark:bg-blue-900/30",
    isLoading = false
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    confirmStyle?: string
    icon?: React.ReactNode
    iconBg?: string
    isLoading?: boolean
}) {
    const [mounted, setMounted] = useState(false);
    const [target, setTarget] = useState<HTMLElement | null>(null);
    
    useEffect(() => {
        setMounted(true);
        const updateTarget = () => {
            setTarget(document.fullscreenElement as HTMLElement || document.getElementById('modal-root') || document.body);
        };
        updateTarget();
        document.addEventListener('fullscreenchange', updateTarget);
        return () => document.removeEventListener('fullscreenchange', updateTarget);
    }, []);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 pointer-events-auto">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                    >
                        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                            {icon}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                            {message}
                        </p>
                        <div className="flex gap-4">
                            <button disabled={isLoading} onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{cancelText}</button>
                            <button disabled={isLoading} onClick={onConfirm} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${confirmStyle}`}>
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (!mounted || !target) return null;
    
    return createPortal(modalContent, target);
}
