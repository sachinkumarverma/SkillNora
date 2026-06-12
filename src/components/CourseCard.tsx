"use client"
import React from 'react'

type Props = {
    title: string
    author?: string
}

export default function CourseCard({ title, author }: Props) {
    return (
        <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 shadow-sm">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-3" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{author}</p>
            <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-300">4.8 ★ (1.2k)</div>
                <div className="text-sm font-semibold">$49</div>
            </div>
        </article>
    )
}
