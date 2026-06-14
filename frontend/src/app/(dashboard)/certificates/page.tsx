"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '../../../lib/useUser'

export default function CertificatesPage() {
    const { user } = useUser()
    const router = useRouter()
    const [certs, setCerts] = useState<any[]>([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('skillnora_certificates') || '[]')
        setCerts(stored)
    }, [])

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-8">My Certificates</h1>
            
            {certs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No certificates yet</h2>
                    <p className="text-slate-500">Complete a course to earn your first certificate.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certs.map((cert, i) => (
                        <div key={i} className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center transform transition hover:-translate-y-1 hover:shadow-md overflow-hidden z-10 group">
                            {/* Watermark */}
                            <svg className="absolute -bottom-6 -right-6 w-32 h-32 text-blue-600 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:opacity-10 transition-opacity -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4 relative z-10">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{cert.courseTitle}</h3>
                            <p className="text-sm text-slate-500 mb-6">Earned on {new Date(cert.date).toLocaleDateString()}</p>
                            
                            <button onClick={() => router.push(`/certificates/${cert.id || cert.courseSlug}`)} className="w-full mt-auto bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                View Certificate
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
