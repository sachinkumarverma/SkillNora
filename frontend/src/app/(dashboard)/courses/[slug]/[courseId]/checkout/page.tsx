"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'
import { coursesService } from '@/services/coursesService'
import { enrollmentsService } from '@/services/enrollmentsService'

export default function CheckoutPage({ params }: { params: Promise<{ slug: string, courseId: string }> }) {
    const { slug, courseId } = React.use(params)
    const { user, loading: userLoading } = useUser()
    const router = useRouter()
    const [course, setCourse] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    useEffect(() => {
        if (userLoading) return
        if (!user) {
            router.replace('/auth')
            return
        }

        let mounted = true
        const fetchCourse = async () => {
            const res = await coursesService.getOne(courseId as string)
            const data = res?.course || res
            if (mounted) {
                if (data) {
                    setCourse({
                        ...data,
                        instructor_name: data.instructor?.full_name || 'Instructor',
                        instructor_avatar: data.instructor?.avatar_url || data.instructor?.picture || data.instructor?.photoURL || null,
                        image: data.image || data.thumbnail_url || data.image_url,
                        price: `Rs. ${data.price}`
                    })
                } else {
                    setCourse(null)
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

                await enrollmentsService.createEnrollment(course.id)
            }
        } catch (e) {
            console.error(e)
        }

        setProcessing(false)
        setShowSuccessModal(true)
    };

    if (loading || userLoading) return <Loader />

    if (!course) return <div className="text-center py-20 text-xl font-bold">Course not found.</div>

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Go Back
            </button>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side: Checkout Form */}
                <div className="p-8 md:w-7/12 flex flex-col justify-center order-2 md:order-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Secure Checkout</h1>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 font-medium">Course Price</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-lg">{course.price || 'Free'}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white text-lg">Total Amount</span>
                            <span className="font-black text-blue-600 text-3xl">{course.price || 'Free'}</span>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 mb-8 space-y-3 font-medium">
                        <p className="flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Instant 1-year access to course content</p>
                        <p className="flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> 30-Day Money-Back Guarantee</p>
                        <p className="text-xs mt-6 text-slate-400">By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>

                    <button disabled={processing} onClick={handlePayment} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 transform transition hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed text-lg">
                        {processing ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                        {processing ? 'Processing Payment...' : 'Pay Securely'}
                    </button>
                </div>

                {/* Right Side: Course Details */}
                <div className="md:w-5/12 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-8 order-1 md:order-2 flex flex-col">
                    <h2 className="text-xl text-slate-900 dark:text-white font-bold mb-6 font-serif">{course.title}</h2>
                    {course.image ? (
                        <div className="w-full rounded-xl overflow-hidden shadow-sm aspect-video mb-6">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-full rounded-xl overflow-hidden shadow-sm aspect-video bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                    <div className="mt-auto">
                        <div className="text-sm text-slate-500 mb-2">Created by</div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {course.instructor_avatar ? (
                                <img src={course.instructor_avatar} alt="Instructor" className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">{course.instructor_name?.[0] || 'I'}</div>
                            )}
                            {course.instructor_name}
                        </div>
                    </div>
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
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h3>
                        <p className="text-slate-500 mb-8">Welcome to the course. You now have full 1-year access.</p>
                        <button onClick={() => router.push(`/courses/${slug}/${courseId}`)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                            Start Learning
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
