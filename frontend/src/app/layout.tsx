import '@/styles/globals.css'
import React from 'react'

export const metadata = {
    title: 'Skillnora - AI eLearning Platform',
    description: 'A premium AI-powered eLearning platform for students, instructors, and admins',
    icons: {
        icon: '/logo.png',
    }
}

import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <body className='min-h-screen text-slate-900 dark:text-slate-100 antialiased bg-slate-50 dark:bg-slate-950'>
                {children}
                <Toaster position="top-right" />
            </body>
        </html>
    )
}
