"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

import { notesService } from '@/services/notesService'
import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'

export default function NotesPage() {
    const [notes, setNotes] = useState<any[]>([])
    const { user, loading: userLoading } = useUser()
    const [loading, setLoading] = useState(true)
    
    // Interactions state
    const [selectedNotes, setSelectedNotes] = useState<string[]>([])
    const [modalNote, setModalNote] = useState<any | null>(null)
    const [editText, setEditText] = useState("")
    const [confirmDelete, setConfirmDelete] = useState<{ id?: string, bulk?: boolean } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const loadNotes = async () => {
        setLoading(true)
        let stored = []
        if (user) {
            stored = await notesService.getNotes()
            stored.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }
        setNotes(stored)
        setLoading(false)
    }

    useEffect(() => {
        loadNotes()
    }, [user, userLoading])

    const handleDeleteNote = async (id: string) => {
        setConfirmDelete({ id });
    }

    const handleBulkDelete = async () => {
        if (selectedNotes.length === 0) return;
        setConfirmDelete({ bulk: true });
    }
    
    const executeDelete = async () => {
        if (confirmDelete?.bulk) {
            await notesService.bulkDeleteNotes(selectedNotes);
            setNotes(notes.filter(n => !selectedNotes.includes(n.id)));
            setSelectedNotes([]);
        } else if (confirmDelete?.id) {
            await notesService.deleteNote(confirmDelete.id);
            setNotes(notes.filter(n => n.id !== confirmDelete.id));
            setSelectedNotes(prev => prev.filter(nId => nId !== confirmDelete.id));
            if (modalNote?.id === confirmDelete.id) setModalNote(null);
        }
        setConfirmDelete(null);
    }

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNotes(prev => prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id])
    }

    const handleUpdateNote = async () => {
        if (!modalNote) return;
        setIsSaving(true)
        try {
            // Use the existing saveNote which acts as UPSERT
            const updated = await notesService.saveNote(modalNote.course_id, modalNote.lectureId, editText);
            
            // Optimistic UI Update
            const newNotes = notes.map(n => n.id === modalNote.id ? { ...n, text: updated.text || editText, updatedAt: new Date().toISOString() } : n)
            setNotes(newNotes.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
            setModalNote(null)
        } finally {
            setIsSaving(false)
        }
    }

    if (loading || userLoading) {
        return <Loader />
    }

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full relative">
           <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Notes</h1>
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
                        {notes.length} notes saved
                    </span>
                </div>
                
                {selectedNotes.length > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{selectedNotes.length} selected</span>
                        <button 
                            onClick={handleBulkDelete}
                            className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                        </button>
                    </div>
                )}
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
                   {notes.map(note => {
                       const isSelected = selectedNotes.includes(note.id);
                       return (
                           <div 
                                key={note.id} 
                                onClick={() => { setModalNote(note); setEditText(note.text); }}
                                className={`group flex flex-col bg-white dark:bg-slate-900 rounded-lg border ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'} p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
                           >
                               <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                   <div className="flex items-center gap-3">
                                       <div 
                                            onClick={(e) => toggleSelection(note.id, e)}
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'}`}
                                       >
                                           {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                       </div>
                                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                           {new Date(note.updatedAt).toLocaleDateString()}
                                       </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Note"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                        <Link 
                                            onClick={e => e.stopPropagation()}
                                            href={`/courses/${note.courseSlug}/lecture/${note.lectureId}`}
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-sm flex items-center gap-1 transition-colors"
                                        >
                                            Go to Video
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                   </div>
                               </div>
                               
                               <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                   {note.lectureTitle}
                               </h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium line-clamp-1">
                                   Course: {note.courseTitle}
                               </p>
                               
                               <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/20 text-slate-700 dark:text-slate-300 text-sm font-medium line-clamp-4 relative overflow-hidden">
                                   {note.text ? (
                                       <div dangerouslySetInnerHTML={{ __html: note.text }} />
                                   ) : (
                                       <span className="text-slate-400 italic">Empty note</span>
                                   )}
                                   
                                   {/* Click overlay hint */}
                                   <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 p-1.5 rounded-lg shadow-sm">
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                   </div>
                               </div>
                           </div>
                       )
                   })}
               </div>
           )}

           {/* Full View Modal */}
           {modalNote && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModalNote(null)}>
                   <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                       <button onClick={() => setModalNote(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                       
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 pr-10">{modalNote.lectureTitle}</h2>
                       <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Course: {modalNote.courseTitle}</p>
                       
                       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                           <ReactQuill 
                               theme="snow"
                               value={editText}
                               onChange={setEditText}
                               placeholder="Type your notes here..."
                               className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-10"
                           />
                       </div>

                       <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                           <button onClick={() => handleDeleteNote(modalNote.id)} className="px-5 py-2.5 font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center gap-2">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               Delete
                           </button>
                           <div className="flex-1"></div>

                           <button 
                                onClick={handleUpdateNote} 
                                disabled={isSaving}
                                className="px-6 py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-transform active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                           >
                                {isSaving ? (
                                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                                {isSaving ? 'Saving...' : 'Save'}
                           </button>
                       </div>
                   </div>
               </div>
           )}
           {confirmDelete && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmDelete(null)}>
                   <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative flex flex-col text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                       <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       </div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete {confirmDelete.bulk ? 'Notes' : 'Note'}?</h2>
                       <p className="text-slate-500 dark:text-slate-400 mb-8">
                           Are you sure you want to permanently delete {confirmDelete.bulk ? `${selectedNotes.length} selected notes` : 'this note'}? This action cannot be undone.
                       </p>
                       <div className="flex gap-3 justify-center">
                           <button onClick={() => setConfirmDelete(null)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors w-full">Cancel</button>
                           <button onClick={executeDelete} className="px-6 py-2.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-transform active:scale-95 shadow-md w-full">Yes, Delete</button>
                       </div>
                   </div>
               </div>
           )}
        </div>
    )
}
