import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-8">
            <div className="container mx-auto px-4 pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm muted">© {new Date().getFullYear()} Skillnora — Learn with AI.</div>
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="text-sm">Courses</Link>
                    <Link href="/auth" className="text-sm">Sign in</Link>
                    <a className="text-sm" href="#">Privacy</a>
                </div>
            </div>
        </footer>
    )
}
