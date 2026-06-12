import '../styles/globals.css'
import React from 'react'
import Navbar from '../components/Navbar'

export const metadata = {
    title: 'Skillnora — AI eLearning',
    description: 'AI-powered eLearning platform starter'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <Navbar />
                <main className="container mx-auto px-4 py-8">{children}</main>
            </body>
        </html>
    )
}
