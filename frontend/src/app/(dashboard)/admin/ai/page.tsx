"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminAIPage() {
    const [activeTab, setActiveTab] = useState('Course Description')
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [output, setOutput] = useState('')

    const tabs = ['Course Description', 'Quiz Generator', 'Lesson Summary', 'Thumbnail Prompt']

    const handleGenerate = () => {
        setIsGenerating(true)
        setOutput('')
        // Simulate AI generation delay
        setTimeout(() => {
            if (activeTab === 'Course Description') {
                setOutput(`🚀 **Mastering Agentic AI: The Future of Automation**\n\nWelcome to the ultimate guide on Agentic AI! In this comprehensive course, you will learn how to build autonomous AI systems that don't just chat, but *do*.\n\n**What you'll learn:**\n- Fundamentals of LLM orchestration\n- Building autonomous reasoning loops\n- Integrating tools and APIs for real-world actions\n- Deploying production-ready agents.\n\nAre you ready to build the next generation of software?`)
            } else if (activeTab === 'Quiz Generator') {
                setOutput(`**Quiz: Introduction to LLMs**\n\n1. What does 'LLM' stand for?\n   A) Large Linear Model\n   B) Large Language Model\n   C) Local Language Machine\n   *Answer: B*\n\n2. Which of the following is an example of an Agentic framework?\n   A) React.js\n   B) LangChain\n   C) Tailwind CSS\n   *Answer: B*`)
            } else if (activeTab === 'Thumbnail Prompt') {
                setOutput(`**Midjourney Prompt:**\nA futuristic glowing robotic brain connected to glowing neon nodes representing neural networks, highly detailed, cinematic lighting, 8k resolution, unreal engine 5 render, deep purple and cyan color palette, --ar 16:9 --v 6.0`)
            } else {
                setOutput(`Generated summary for your lesson: "This lesson covers the core architecture of Transformers, explaining the self-attention mechanism and how multi-head attention allows models to focus on different parts of the input sequence simultaneously."`)
            }
            setIsGenerating(false)
        }, 1500)
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">AI Studio</span>
                        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 font-medium mt-2"
                    >
                        Generate course content, quizzes, and metadata instantly using SkillNora AI.
                    </motion.p>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col lg:flex-row min-h-[500px]"
            >
                {/* Sidebar */}
                <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-4">
                    <div className="space-y-1">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Generate {activeTab}</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Prompt / Context
                            </label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`E.g. "Create a 5-question multiple choice quiz about React Hooks..."`}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[120px] resize-y"
                            />
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className={`px-6 py-2.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${
                                    isGenerating || !prompt.trim() 
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25'
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {output && (
                        <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Generated Output</h3>
                                <button className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">Copy to clipboard</button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                {output}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
