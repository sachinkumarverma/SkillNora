"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import apiClient from '@/lib/apiClient'

const CustomDropdown = ({ value, options, onChange }: { value: string, options: {value: string, label: string}[], onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...'
    return (
        <div className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-medium cursor-pointer transition-colors"
            >
                <span>{selectedLabel}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {options.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false) }}
                                    className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

const TEMPLATES = {
    newsletter: [
        { id: 'nl-classic', name: 'Classic Blue', gradient: 'from-blue-900 to-blue-500', css: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' },
        { id: 'nl-minimal', name: 'Clean Slate', gradient: 'from-slate-800 to-slate-500', css: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)' },
        { id: 'nl-indigo', name: 'Deep Indigo', gradient: 'from-indigo-900 to-violet-700', css: 'linear-gradient(135deg, #312e81 0%, #6d28d9 100%)' }
    ],
    offer: [
        { id: 'off-fire', name: 'Flash Sale', gradient: 'from-rose-600 to-orange-500', css: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)' },
        { id: 'off-gold', name: 'Premium VIP', gradient: 'from-amber-600 to-yellow-400', css: 'linear-gradient(135deg, #d97706 0%, #facc15 100%)' },
        { id: 'off-neon', name: 'Cyber Neon', gradient: 'from-fuchsia-600 to-purple-600', css: 'linear-gradient(135deg, #c026d3 0%, #9333ea 100%)' }
    ],
    announcement: [
        { id: 'ann-trust', name: 'Trusted Green', gradient: 'from-emerald-700 to-teal-500', css: 'linear-gradient(135deg, #047857 0%, #14b8a6 100%)' },
        { id: 'ann-alert', name: 'Important Red', gradient: 'from-red-700 to-rose-500', css: 'linear-gradient(135deg, #b91c1c 0%, #f43f5e 100%)' },
        { id: 'ann-tech', name: 'Tech Cyan', gradient: 'from-cyan-700 to-blue-500', css: 'linear-gradient(135deg, #0e7490 0%, #3b82f6 100%)' }
    ]
}

export default function PromotionalEmailsPage() {
    const [targetGroup, setTargetGroup] = useState('students')
    const [templateCategory, setTemplateCategory] = useState<keyof typeof TEMPLATES>('newsletter')
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES['newsletter'][0])
    
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCategoryChange = (val: string) => {
        const cat = val as keyof typeof TEMPLATES;
        setTemplateCategory(cat);
        setSelectedTemplate(TEMPLATES[cat][0]);
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !description) {
            toast.error('Title and description are required.')
            return
        }

        setLoading(true)
        try {
            await apiClient.post('/api/users/promotional-email', {
                targetGroup,
                template: selectedTemplate.id,
                cssGradient: selectedTemplate.css,
                title,
                description
            })
            toast.success('Promotional emails have been sent successfully.')
            setTitle('')
            setDescription('')
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || 'Failed to send emails.')
        }
        setLoading(false)
    }

    return (
        <div className="w-full mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                        Promotional Emails
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Send announcements, newsletters, and promotional offers to users.
                    </motion.p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Preview Side */}
                <div className="order-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Live Preview
                    </h3>
                    
                    <div className="flex-1 bg-[#f8fafc] rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col items-center p-4 sm:p-8 relative">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className={`bg-gradient-to-br ${selectedTemplate.gradient} p-8 text-center transition-colors duration-500`}>
                                <div className="w-14 h-14 bg-white rounded-2xl mx-auto mb-4 p-2 shadow-md">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white">{title || 'Your Email Title'}</h2>
                            </div>
                            <div className="p-6 sm:p-8 text-slate-700 text-[15px] leading-relaxed space-y-4">
                                {description ? (
                                    description.split('\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic">Your email body content will appear here. Start typing in the description box to see the preview.</p>
                                )}
                                
                                <div className="mt-8 text-center pt-4">
                                    <span className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-md">
                                        Visit Skillnora
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="order-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Group</label>
                                <CustomDropdown
                                    value={targetGroup}
                                    onChange={(val) => setTargetGroup(val)}
                                    options={[
                                        { value: 'students', label: 'Students Only' },
                                        { value: 'instructors', label: 'Instructors Only' },
                                        { value: 'all', label: 'All Users' }
                                    ]}
                                />
                                <p className="text-[11px] text-slate-500 mt-2 font-medium">Only opted-in users will receive this.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                <CustomDropdown
                                    value={templateCategory}
                                    onChange={handleCategoryChange}
                                    options={[
                                        { value: 'newsletter', label: 'Monthly Newsletter' },
                                        { value: 'offer', label: 'Special Offer' },
                                        { value: 'announcement', label: 'Announcement' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Design</label>
                            <div className="grid grid-cols-3 gap-3">
                                {TEMPLATES[templateCategory].map((t) => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${selectedTemplate.id === t.id ? 'border-blue-600 shadow-md ring-2 ring-blue-600/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    >
                                        <div className={`h-16 w-full bg-gradient-to-br ${t.gradient}`}></div>
                                        <div className="p-2 text-center bg-white dark:bg-slate-800">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block truncate">{t.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Title (Subject Line)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Huge 50% Off Summer Sale!"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-medium focus:ring-2 focus:ring-blue-500 transition-shadow"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Description (Body)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                                placeholder="Write your email content here..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-medium resize-y focus:ring-2 focus:ring-blue-500 transition-shadow"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                )}
                                Send Campaign
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
