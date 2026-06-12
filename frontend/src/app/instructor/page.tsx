"use client"
import React from 'react'
import Link from 'next/link'

export default function InstructorPage() {
    return (
        <div className="max-w-5xl mx-auto mt-12">
            <div className="p-6 rounded-xl glass">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Instructor dashboard</h2>
                        <p className="muted">Create and manage your courses.</p>
                    </div>
                    <Link href="/instructor/new" className="btn btn-primary">New Course</Link>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <div className="text-sm muted">Your courses</div>
                        <div className="mt-2">No courses yet.</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                        <div className="text-sm muted">Earnings (est)</div>
                        <div className="mt-2 font-semibold">$0</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
