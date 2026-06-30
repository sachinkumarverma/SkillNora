"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CustomDropdown = ({ label, value, options, onChange, required, placeholder }: { label?: string, value: string, options: {value: string, label: string}[], onChange: (val: string) => void, required?: boolean, placeholder?: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedLabel = options.find(o => o.value === value)?.label || placeholder || 'Select...'
    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
            )}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer transition-colors ${!value ? 'text-slate-500' : ''}`}
            >
                <span className="truncate">{selectedLabel}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full py-2">
                                {placeholder && (
                                    <div 
                                        onClick={() => { onChange(''); setIsOpen(false) }}
                                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${!value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {placeholder}
                                    </div>
                                )}
                                {options.map(opt => (
                                    <div 
                                        key={opt.value}
                                        onClick={() => { onChange(opt.value); setIsOpen(false) }}
                                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CustomDropdown;
