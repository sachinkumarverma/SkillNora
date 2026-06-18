export default function PricingPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-4xl font-bold mb-8">Pricing</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Simple, transparent pricing for everyone. Choose the plan that works best for you.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-2">Basic Plan</h3>
                    <div className="text-4xl font-black mb-6">Free</div>
                    <ul className="space-y-4 mb-8">
                        <li>✓ Access to free courses</li>
                        <li>✓ Community support</li>
                        <li>✓ Basic progress tracking</li>
                    </ul>
                    <button className="w-full py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors">Current Plan</button>
                </div>
                <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-8 shadow-md relative">
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Popular</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                    <div className="text-4xl font-black mb-6">₹999<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                    <ul className="space-y-4 mb-8">
                        <li>✓ Unlimited access to all courses</li>
                        <li>✓ Verified certificates</li>
                        <li>✓ 1-on-1 Mentorship</li>
                        <li>✓ Priority support</li>
                    </ul>
                    <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm">Upgrade to Pro</button>
                </div>
            </div>
        </div>
    )
}
