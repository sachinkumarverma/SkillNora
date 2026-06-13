"use client"
import React from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'

export default function WishlistPage() {
    return (
        <DashboardLayout title="Wishlist" breadcrumbs={[{ label: 'Wishlist' }]}>
            <div className="p-6 md:p-8">
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Wishlist</h1>
                    </div>
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md text-center">Save courses you want to learn later by clicking the heart icon on any course card.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}
