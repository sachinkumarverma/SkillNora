"use client"
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '@/lib/apiClient'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !email || !subject || !message) {
            toast.error('All fields are required.')
            return
        }

        setLoading(true)
        
        try {
            await apiClient.post('/api/support', { name, email, subject, message })
            toast.success("Message sent successfully! We'll get back to you soon.")
            setName('')
            setEmail('')
            setSubject('')
            setMessage('')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send message.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-[1300px] mx-auto py-12 px-6 lg:px-10">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                        Have a question, feedback, or need support? We're here to help. Reach out to our team using the form or our contact details below.
                    </p>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-1">Email Us</h3>
                            <p className="text-blue-600 dark:text-blue-400">support@skillnora.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Call Us</h3>
                            <p>+91 12345 67890</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Office Address</h3>
                            <p>123 Learning Avenue, Tech District<br />New Delhi, India 110001</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)} type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="E.g., Payment Issue, Bug Report" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 resize-y custom-scrollbar" placeholder="How can we help?"></textarea>
                        </div>
                        <button disabled={loading} type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
