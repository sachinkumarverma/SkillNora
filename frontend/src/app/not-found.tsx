import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function NotFound() {
    return (
        <DashboardLayout>
            <div className="min-h-[calc(100vh-10rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">404</h1>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3 font-serif">Page Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-base leading-relaxed font-medium">
                    Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                </p>
                <Link 
                    href="/dashboard" 
                    className="px-6 py-3.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return to Home
                </Link>
            </div>
        </DashboardLayout>
    )
}
