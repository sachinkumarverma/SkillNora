"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import supabase from '../lib/supabaseClient'

type Message = {
    id: string
    sender: 'user' | 'askie'
    text: string
    courseRecommend?: any
}

export default function AskieBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'askie', text: "Hi! I'm Askie 🤖 your personal AI learning assistant. Ask me anything about your studies or tell me what you want to learn!" }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const processAIResponse = async (userText: string) => {
        const text = userText.toLowerCase()
        let replyText = "I'm having trouble connecting to my brain right now. Please try again later!"
        let recommendedCourse: any = null

        // 1. Fetch courses from DB to see if we have a match locally
        const { data: courses } = await supabase.from('courses').select('*').eq('is_published', true)
        if (courses && courses.length > 0) {
            const match = courses.find(c => text.includes(c.title.toLowerCase()) || text.includes((c.category || '').toLowerCase()) || text.includes((c.primary_skill || '').toLowerCase()))
            if (match) {
                recommendedCourse = match
            } else if (text.includes('recommend') || text.includes('course') || text.includes('learn')) {
                recommendedCourse = courses[0]
            }
        }

        // 2. Call the real Generative AI backend
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
            const conversationHistory = messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
            conversationHistory.push({ role: 'user', content: userText })
            
            const res = await fetch(`${apiUrl}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            })
            if (res.ok) {
                const data = await res.json()
                replyText = data.reply
            }
        } catch (e) {
            console.error("AI chat error:", e)
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'askie',
            text: replyText,
            courseRecommend: recommendedCourse
        }])
        setIsTyping(false)
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)
        
        processAIResponse(input)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] w-16 h-16">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl w-[calc(100vw-3rem)] sm:w-[380px] h-[75vh] sm:h-[600px] flex flex-col overflow-hidden origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                        <img src="/askie-avatar.jpg" alt="Askie" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">Askie AI</h3>
                                    <p className="text-blue-100 text-xs font-medium">Always here to help</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg px-4 py-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'}`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        
                                        {/* Render Course Preview inside Askie's message if recommended */}
                                        {msg.courseRecommend && (
                                            <div className="mt-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                                                <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative">
                                                    {msg.courseRecommend.thumbnail_url ? (
                                                        <img src={msg.courseRecommend.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Preview</div>
                                                    )}
                                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">Recommended</div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">{msg.courseRecommend.title}</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{msg.courseRecommend.description}</p>
                                                    <Link href={`/courses/${msg.courseRecommend.slug}`} onClick={() => setIsOpen(false)} className="block text-center w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 py-2 rounded-lg text-xs font-bold transition-colors">
                                                        View Course
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question or find a course..."
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-5 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-500"
                                />
                                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white rounded-full transition-colors">
                                    <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-slate-400 font-medium">Powered by Skillnora Advanced AI</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-3xl group z-50 border-4 border-white dark:border-slate-950"
                    >
                        <img src="/askie-avatar.jpg" alt="Askie" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
