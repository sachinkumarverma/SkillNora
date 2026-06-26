"use client"
import React, { useEffect, useState } from 'react'

import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { coursesService } from '@/services/coursesService'
import apiClient from '@/lib/apiClient'
import { toast } from 'react-hot-toast'

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const [course, setCourse] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [inCart, setInCart] = useState(false)
    const { user } = useUser()
    const router = useRouter()

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [isEditingReview, setIsEditingReview] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        if (course && user) {
            import('@/services/cartService').then(({ cartService }) => {
                cartService.getCart().then(cart => {
                    setInCart(cart.some((c: any) => c.id === course.id || c.course_id === course.id))
                }).catch(() => setInCart(false))
            })
        } else {
            setInCart(false)
        }
    }, [course, user])

    const handleEnroll = () => {
        if (!user) {
            router.push('/auth')
            return
        }
        router.push(`/courses/${slug}/checkout`)
    }

    const handlePreview = () => {
        router.push(`/courses/${slug}/preview`)
    }

    useEffect(() => {
        if (!slug) return
        let mounted = true
        const fetchCourse = async () => {
            const res = await coursesService.getOne(slug as string)
            const data = res?.course || res
            if (mounted) {
                if (data) {
                    setCourse({
                        ...data,
                        instructor_name: data.instructor?.full_name || 'Instructor',
                        lectures: data.lectures || []
                    })
                    if (data.isEnrolled) {
                        setIsEnrolled(true)
                    }
                    if (user && data.reviews) {
                        const myReview = data.reviews.find((r: any) => r.user_id === user.id)
                        if (myReview) {
                            setRating(myReview.rating)
                            setReviewText(myReview.review_text || '')
                        }
                    }
                } else {
                    setCourse(null)
                }
                setLoading(false)
            }
        }
        fetchCourse()

        return () => { mounted = false }
    }, [slug, user])

    const submitReview = async () => {
        if (!rating) return alert('Please select a rating')
        setSubmittingReview(true)
        try {
            const myReview = course?.reviews?.find((r: any) => r.user_id === user?.id)
            if (myReview) {
                await apiClient.put(`/api/courses/${course.id}/reviews/${myReview.id}`, { rating, review_text: reviewText })
            } else {
                await apiClient.post(`/api/courses/${course.id}/reviews`, { rating, review_text: reviewText })
            }
            const res = await coursesService.getOne(slug as string)
            const data = res?.course || res
            if (data) {
                setCourse({
                    ...data,
                    instructor_name: data.instructor?.full_name || 'Instructor',
                    lectures: data.lectures || []
                })
            }
            setIsEditingReview(false)
        } catch (e) {
            console.error('Failed to submit review', e)
            alert('Failed to submit review')
        }
        setSubmittingReview(false)
    }

    const handleCancel = async () => {
        try {
            setIsCancelling(true);
            const res = await apiClient.post('/api/enrollments/cancel', { course_id: course.id });
            toast.success(`Enrollment cancelled successfully.\nRefund amount: ₹${res.data.refundAmount?.toFixed(2)}`, { duration: 5000 });
            toast.success("A receipt has been sent to your email.");
            setIsEnrolled(false);
            setShowCancelModal(false);
        } catch (err: any) {
            console.error(err);
            toast.error(`Failed to cancel: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) return <Loader type="course-detail" />

    if (!course) return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Course Not Found</h1>
            <p className="text-slate-500">The course you are looking for does not exist or has been removed.</p>
            <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
    )

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Course Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        {course.image && !imageError && (
                            <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none">
                                <img src={course.image} alt="bg" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {isEnrolled && (
                            <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1" title="Enrolled">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Enrolled
                            </div>
                        )}
                        <div className="relative z-10">
                            <div className="text-blue-600 font-bold tracking-wide uppercase text-xs mb-3">{course.category || 'Course'}</div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-4">{course.title}</h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 font-medium whitespace-pre-wrap">{course.description || 'Comprehensive learning material to advance your career and skills.'}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-amber-500">{Number(course.average_rating || 0).toFixed(1)}</span>
                                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="font-normal">({course.reviews?.length || 0} ratings)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    <span>Created by <strong className="text-slate-900 dark:text-white">{course.instructor_name ?? course.instructor_id ?? 'Expert Instructor'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    <span>English</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                {!isEnrolled && (
                                    <button onClick={handleEnroll} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm transform transition active:scale-95">
                                        Enroll Now
                                    </button>
                                )}
                                <button onClick={handlePreview} className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm transform transition active:scale-95">Preview Course</button>
                            </div>
                        </div>
                    </div>

                    {/* Lectures List */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Course Content</h2>
                        <div className="space-y-3">
                            {course.lectures?.length ? course.lectures.map((l: any, index: number) => (
                                <div key={l.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{l.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Video Lecture
                                                </span>
                                                {l.mcqs && (typeof l.mcqs === 'string' ? JSON.parse(l.mcqs) : l.mcqs).length > 0 && (
                                                    <span className="flex items-center gap-1 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                                        + Quiz ({(typeof l.mcqs === 'string' ? JSON.parse(l.mcqs) : l.mcqs).length} Qs)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/courses/${course.slug}/lecture/${l.id}`} className="text-blue-600 font-bold text-sm hover:underline shrink-0">Watch</Link>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    No lectures have been added to this course yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Student Reviews</h2>
                        
                        {/* Add Review Form */}
                        {isEnrolled && (
                            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                                    {course?.reviews?.find((r: any) => r.user_id === user?.id) && !isEditingReview ? "Your Review" : "Write a Review"}
                                </h3>
                                
                                {course?.reviews?.find((r: any) => r.user_id === user?.id) && !isEditingReview ? (
                                    <div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg key={star} className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{reviewText}</p>
                                        <button onClick={() => setIsEditingReview(true)} className="text-sm font-bold text-blue-600 hover:text-blue-700">Edit Review</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                >
                                                    <svg className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="What did you think of the course?"
                                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={submitReview} disabled={submittingReview || !rating} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            {isEditingReview && (
                                                <button onClick={() => { setIsEditingReview(false); const myRev = course?.reviews?.find((r: any) => r.user_id === user?.id); if (myRev) { setRating(myRev.rating); setReviewText(myRev.review_text || ''); } }} className="text-slate-500 hover:text-slate-700 font-bold text-sm">Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Existing Reviews */}
                        <div className="space-y-6">
                            {course.reviews && course.reviews.length > 0 ? course.reviews.map((review: any) => (
                                <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-slate-900 dark:text-white">{review.full_name || 'Anonymous Student'}</div>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-800'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{review.review_text}</p>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-sm italic">No reviews yet. Be the first to review!</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                            {course.image && !imageError ? (
                                <img src={course.image} alt={course.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="text-3xl font-black text-slate-900 dark:text-white mb-6">
                                {course.price ? `Rs. ${course.price}` : 'Free'}
                            </div>
                            
                            {/* AI Matrix Recommendation */}
                            {isEnrolled && course?.progress?.quizScores && (() => {
                                const scores = Object.values(course.progress.quizScores);
                                const avg = scores.length ? Number(scores.reduce((a: any, b: any) => Number(a) + Number(b), 0)) / scores.length : 100;
                                if (avg < 75) {
                                    return (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                                            <div className="font-bold flex items-center gap-2 mb-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                AI Learning Recommendation
                                            </div>
                                            Your average quiz score is {Math.round(avg)}%. We highly recommend retaking this course to strengthen your foundational knowledge!
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {isEnrolled ? (
                                <>
                                    <button onClick={handlePreview} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm mb-3 hover:bg-blue-700">
                                        Go to Course
                                    </button>
                                    <button 
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full bg-transparent border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:hover:bg-red-900/20 py-3 rounded-xl font-bold transition-colors shadow-sm mb-3 text-sm"
                                    >
                                        Cancel Enrollment (within 30 days)
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleEnroll} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm mb-3">
                                    Enroll Now
                                </button>
                            )}
                            <p className="text-center text-xs text-slate-500 mb-6">{isEnrolled ? "Partial refund available within 30 days" : "30-Day Money-Back Guarantee"}</p>

                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> Total Lectures</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.lectures?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Quizzes</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.quizzes_exist ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> Certificate</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{course.certificate_type ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancel Enrollment</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to cancel your enrollment? You will only get a partial refund calculated dynamically based on days consumed, provided it is within 30 days.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Never mind
                            </button>
                            <button 
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCancelling ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Cancelling...
                                    </>
                                ) : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
