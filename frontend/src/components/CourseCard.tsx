"use client"
import React from 'react'

type Props = {
    title: string
    author?: string
}

export default function CourseCard({ title, author }: Props) {
    return (
        <article className='card-hover overflow-hidden rounded-[1.5rem] surface'>
            <div className='h-44 bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 p-5 text-white'>
                <div className='inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]'>Trending</div>
                <div className='mt-12 text-xl font-bold'>{title}</div>
                <div className='mt-2 text-sm opacity-80'>{author}</div>
            </div>
            <div className='space-y-4 p-5'>
                <div className='flex items-center justify-between text-sm'>
                    <span className='muted'>4.9 rating</span>
                    <span className='font-semibold text-slate-950 dark:text-white'>$49</span>
                </div>
                <div className='h-2 rounded-full bg-slate-200 dark:bg-slate-700'>
                    <div className='h-2 w-[78%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400' />
                </div>
            </div>
        </article>
    )
}
