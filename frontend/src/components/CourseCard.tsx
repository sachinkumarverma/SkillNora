"use client"
import React from 'react'

type Props = {
    title: string
    author?: string
}

export default function CourseCard({ title, author }: Props) {
    return (
        <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 shadow-sm card-hover">
            <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-900 rounded-md mb-3 flex items-end p-3">
                <div className="bg-white/60 dark:bg-slate-700/40 px-2 py-1 rounded text-xs font-medium">Preview</div>
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm muted mt-1">{author}</p>
            <div className="mt-3 flex items-center justify-between">
                <div className="text-sm muted">4.8 ★ (1.2k)</div>
                <div className="text-sm font-semibold">$49</div>
            </div>
        </article>
    )
}
