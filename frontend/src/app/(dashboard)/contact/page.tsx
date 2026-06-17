export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                        Have a question, feedback, or need support? We're here to help. Reach out to our team using the form or our contact details below.
                    </p>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-1">Email Us</h3>
                            <p className="text-blue-600 dark:text-blue-400">support@skillnora.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Call Us</h3>
                            <p>+91 12345 67890</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Office Address</h3>
                            <p>123 Learning Avenue, Tech District<br />New Delhi, India 110001</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="button" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
