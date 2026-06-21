"use client"
import React, { useState, useEffect } from 'react'
import useUser from '@/lib/useUser'
import { authService } from '@/services/authService'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '@/lib/apiClient'

export default function SettingsPage() {
    const { user, loading } = useUser()
    const [activeTab, setActiveTab] = useState('profile')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Form states
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    // Preferences
    const [theme, setTheme] = useState('system')
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(false)

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '')
        }
        const storedTheme = localStorage.getItem('theme') || 'system'
        setTheme(storedTheme)
    }, [user])

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme)
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else if (newTheme === 'light') {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        } else {
            // System - just check media query
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.classList.toggle('dark', systemDark)
            localStorage.removeItem('theme')
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)
        
        try {
            await authService.updateProfile({ full_name: fullName })
            setMessage({ text: 'Profile updated successfully!', type: 'success' })
        } catch (error: any) {
            setMessage({ text: error.message || 'Failed to update profile', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match.', type: 'error' })
            return
        }
        if (password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' })
            return
        }
        
        setIsSaving(true)
        setMessage(null)
        try {
            await authService.updatePassword(password)

            setPassword('')
            setConfirmPassword('')
            setMessage({ text: 'Password updated successfully!', type: 'success' })
        } catch (error: any) {
            setMessage({ text: error.message || 'Failed to update password', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsSaving(true)
        setMessage(null)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Fetch signed upload URL from our backend
            const { data } = await apiClient.post('/api/upload/url', {
                bucket: 'public',
                filePath
            })
            
            if (data.uploadUrl && data.token) {
                const supabaseModule = await import('@/lib/supabaseClient')
                const supabase = supabaseModule.default
                
                const { error: uploadError } = await supabase.storage
                    .from('public')
                    .uploadToSignedUrl(filePath, data.token, file)
                    
                if (uploadError) throw new Error('Failed to upload file to storage: ' + uploadError.message)
            } else if (data.uploadUrl) {
                // Fallback for direct upload URL
                const res = await fetch(data.uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                })
                
                if (!res.ok) {
                    throw new Error('Failed to upload file to storage')
                }
            }

            const finalAvatarUrl = data.publicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}-${Date.now()}`

            await authService.updateProfile({ avatar_url: finalAvatarUrl })
            
            setMessage({ text: 'Avatar updated successfully!', type: 'success' })
        } catch (error: any) {
            setMessage({ text: error.message || 'Failed to upload avatar', type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Public Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'security', label: 'Security & Password', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'preferences', label: 'App Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ]

    if (loading || !user) return null

    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    const initials = (user.email || 'SN').slice(0, 2).toUpperCase()

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Manage your profile, security, and app preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col space-y-2">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setMessage(null) }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                                        active 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                    </svg>
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative">
                    {/* Toast Notification */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`absolute top-0 right-0 z-50 p-4 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-3 ${
                                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300'
                                }`}
                            >
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                                {message.text}
                                <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Public Profile</h2>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-400">
                                            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                                        </div>
                                        <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                                            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-[10px] font-bold tracking-wider">CHANGE</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isSaving} />
                                        </label>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{fullName || 'Add your name'}</h3>
                                        <p className="text-slate-500 text-sm font-medium">{user.email}</p>
                                        <div className="mt-2 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 inline-block px-2 py-1 rounded-md uppercase tracking-wider">
                                            {user.user_metadata?.role || 'Student'}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security & Password</h2>
                                
                                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !password}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 shadow-blue-500/30"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>

                                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Add an extra layer of security to your account.</p>
                                    <button className="px-5 py-2.5 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">App Preferences</h2>
                                
                                <div className="space-y-8 max-w-lg">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Appearance</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { id: 'light', label: 'Light', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
                                                { id: 'dark', label: 'Dark', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
                                                { id: 'system', label: 'System', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleThemeChange(t.id)}
                                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                                        theme === t.id 
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                                                        : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                                                    }`}
                                                >
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
                                                    <span className="text-sm font-bold">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Language & Region</h3>
                                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-medium appearance-none">
                                            <option>English (United States)</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notifications</h2>
                                
                                <div className="space-y-6 max-w-lg">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Email Notifications</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Receive updates about your courses and account via email.</p>
                                        </div>
                                        <button 
                                            onClick={() => setEmailNotifs(!emailNotifs)}
                                            className={`relative w-14 h-8 rounded-full transition-colors ${emailNotifs ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Push Notifications</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Get instant alerts in your browser.</p>
                                        </div>
                                        <button 
                                            onClick={() => setPushNotifs(!pushNotifs)}
                                            className={`relative w-14 h-8 rounded-full transition-colors ${pushNotifs ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
