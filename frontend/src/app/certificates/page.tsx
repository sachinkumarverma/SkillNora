"use client"
import React from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'

export default function CertificatesPage() {
    return (
        <DashboardLayout title="Certificates" breadcrumbs={[{ label: 'Certificates' }]}>
            <div className="p-6 md:p-8">
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Certificates</h1>
                    </div>
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No certificates earned yet</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md text-center">Complete 100% of a course curriculum and pass all required assessments to earn your verifiable certificate.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}
