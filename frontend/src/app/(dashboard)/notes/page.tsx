"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function NotesPage() {
    const [notes, setNotes] = useState<any[]>([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('skillnora_notes') || '[]')
        // Sort by newest first
        stored.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setNotes(stored)
    }, [])

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full">
           <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Notes</h1>
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
                    {notes.length} notes saved
                </span>
           </div>
           
           {notes.length === 0 ? (
               <div className="rounded-lg border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">You haven't saved any notes yet</h2>
                    <p className="text-sm font-medium text-slate-500 max-w-md text-center">While watching a lecture, use the Notes section below the video to jot down important points.</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {notes.map(note => (
                       <div key={note.id} className="flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                   {new Date(note.updatedAt).toLocaleDateString()}
                               </div>
                               <Link 
                                   href={`/courses/${note.courseSlug}/lecture/${note.lectureId}`}
                                   className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-sm flex items-center gap-1 transition-colors"
                               >
                                   Go to Video
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                               </Link>
                           </div>
                           
                           <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 text-lg">
                               {note.lectureTitle}
                           </h3>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium line-clamp-1">
                               Course: {note.courseTitle}
                           </p>
                           
                           <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/20 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap font-medium">
                               {note.text || <span className="text-slate-400 italic">Empty note</span>}
                           </div>
                       </div>
                   ))}
               </div>
           )}
        </div>
    )
}
