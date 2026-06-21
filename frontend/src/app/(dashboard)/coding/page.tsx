"use client"
import React, { useState } from 'react'
import Loader from '@/components/ui/Loader'

export default function CodingPlayground() {
    const [language, setLanguage] = useState('python')
    const [isLoaded, setIsLoaded] = useState(false)
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value)
        setIsLoaded(false)
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-6 md:p-8 max-w-[1400px] mx-auto w-full">
           <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">Code Playground</h1>
                <div className="flex gap-4">
                    <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
           </div>
           
           <div className="flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-xl relative">
               {!isLoaded && (
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                       <Loader />
                   </div>
               )}
               <iframe 
                   src={`https://onecompiler.com/embed/${language}?theme=dark&hideLanguageSelection=true&hideNew=true&hideTitle=true`} 
                   className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                   title="Code Editor"
                   allow="clipboard-write"
                   onLoad={() => setIsLoaded(true)}
               ></iframe>
           </div>
        </div>
    )
}
