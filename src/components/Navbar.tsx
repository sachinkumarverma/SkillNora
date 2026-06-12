"use client"
import React, { useEffect, useState } from 'react'

export default function Navbar() {
    const [dark, setDark] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        if (stored === 'dark') {
            document.documentElement.classList.add('dark')
            setDark(true)
        }
    }, [])

    function toggle() {
        const next = !dark
        setDark(next)
        if (next) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    return (
        <header className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">SN</div>
                    <span className="font-semibold">Skillnora</span>
                </div>
                <nav className="flex items-center gap-4">
                    <a className="text-sm hover:underline" href="#">Courses</a>
                    <a className="text-sm hover:underline" href="#">Pricing</a>
                    <button onClick={toggle} className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800">{dark ? 'Light' : 'Dark'}</button>
                </nav>
            </div>
        </header>
    )
}
