import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-8">
            <div className="container mx-auto px-4 pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm muted">© {new Date().getFullYear()} Skillnora — Learn with AI.</div>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
                    <Link href="/contact" className="text-sm hover:text-blue-500 transition-colors">Contact Us</Link>
                    <Link href="/terms" className="text-sm hover:text-blue-500 transition-colors">Terms & Conditions</Link>
                    <Link href="/privacy-policy" className="text-sm hover:text-blue-500 transition-colors">Privacy Policy</Link>
                    <Link href="/refund-policy" className="text-sm hover:text-blue-500 transition-colors">Refund & Cancellation Policy</Link>
                </div>
            </div>
        </footer>
    )
}
