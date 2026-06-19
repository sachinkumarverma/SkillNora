"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/lib/useUser'
import { coursesService } from '@/services/coursesService'
import { enrollmentsService } from '@/services/enrollmentsService'

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const { user, loading: userLoading } = useUser()
    const router = useRouter()
    const [course, setCourse] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (userLoading) return
        if (!user) {
            router.replace('/auth')
            return
        }

        let mounted = true
        const fetchCourse = async () => {
            const data = await coursesService.getOne(slug as string)
            if (mounted) {
                if (data) {
                    setCourse({
                        ...data,
                        instructor_name: data.instructor?.full_name || 'Instructor',
                        image: data.thumbnail_url,
                        price: `₹${data.price}`
                    })
                } else {
                    const found = trendingCourses.find(c => c.slug === slug)
                    if (found) setCourse(found)
                }
                setLoading(false)
            }
        }
        fetchCourse()

        return () => { mounted = false }
    }, [slug, user, userLoading, router])

    const handlePayment = async () => {
        setProcessing(true)
        try {
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Insert enrollment
            if (user && course && course.id) {
                const expiryDate = new Date()
                expiryDate.setFullYear(expiryDate.getFullYear() + 1)

                await enrollmentsService.enroll(course.id)
                if (error) {
                    console.error("Enrollment error:", error)
                }
            }
        } catch (e) {
            console.error(e)
        }

        setProcessing(false)
        alert("Payment successful! Welcome to the course!");
        router.push(`/courses/${slug}`);
    };

    if (loading || userLoading) return (
        <div className="flex h-[60vh] w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
    )

    if (!course) return <div className="text-center py-20 text-xl font-bold">Course not found.</div>

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Go Back
            </button>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {course.image && (
                    <div className="md:w-5/12 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-800">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-8 md:w-7/12 flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Checkout</h1>
                    <h2 className="text-xl text-slate-700 dark:text-slate-300 font-serif mb-6">{course.title}</h2>

                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500">Course Price</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{course.price || 'Free'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500">Taxes</span>
                            <span className="text-slate-500 text-sm">Included</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white text-lg">Total Amount</span>
                            <span className="font-black text-blue-600 text-2xl">{course.price || 'Free'}</span>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 mb-8 space-y-2">
                        <p>✓ Instant lifetime access to course content</p>
                        <p>✓ 30-Day Money-Back Guarantee</p>
                        <p className="text-xs mt-4">By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>

                    <button disabled={processing} onClick={handlePayment} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 transform transition hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed">
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                        {processing ? 'Processing Payment...' : 'Pay Securely with Razorpay'}
                    </button>
                </div>
            </div>
            {processing && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <img src="/logo.png" className="w-8 h-8 animate-pulse" alt="logo" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Simulating Razorpay...</h3>
                        <p className="text-sm text-slate-500 mb-6">Connecting to secure gateway.</p>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-full animate-pulse origin-left"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
