"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/hooks/useWishlist'
import useUser from '@/lib/useUser'
import { enrollmentsService } from '@/services/enrollmentsService'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'

export default function WishlistPage() {
    const router = useRouter()
    const { user } = useUser()
    const { wishlist, toggleWishlist } = useWishlist()
    const [courses, setCourses] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    const [enrolledIds, setEnrolledIds] = React.useState<string[]>([])
    const [isBuying, setIsBuying] = React.useState(false)

    React.useEffect(() => {
        let active = true
        Promise.all([
            apiClient.get('/api/courses').then(r => r.data).catch(() => ({ courses: [] })),
            apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] }))
        ]).then(([coursesData, enrollData]) => {
            if (active) {
                const data = Array.isArray(coursesData) ? coursesData : coursesData.courses || coursesData.data || []
                setCourses(data)
                setEnrolledIds(enrollData?.enrolledIds || [])
                setLoading(false)
            }
        }).catch((err) => {
            console.error(err)
            if (active) setLoading(false)
        })
        return () => { active = false }
    }, [])

    if (loading || isBuying) {
        return <Loader />
    }

    const savedCourses = courses.filter(course => wishlist.includes(course.id))

    const handleBulkBuy = async () => {
        if (!user) {
            router.push('/auth')
            return
        }

        setIsBuying(true)

        try {
            const activeEnrollments = new Set(enrolledIds)

            const cartModule = await import('@/services/cartService')
            const cart = await cartModule.cartService.getCart()

            for (const course of savedCourses) {
                if (!activeEnrollments.has(course.id) && !cart.some((c: any) => c.id === course.id)) {
                    await cartModule.cartService.addToCart(course.id)
                }
            }

            router.push('/cart')
        } catch (error) {
            console.error(error)
            setIsBuying(false)
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">My Wishlist</h1>
                    <div className="flex items-center gap-4">
                        {savedCourses.length > 0 && (
                            <button onClick={handleBulkBuy} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                                Buy All
                            </button>
                        )}
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-3 py-1 rounded-full text-sm">
                            {savedCourses.length} items
                        </span>
                    </div>
                </div>

                {savedCourses.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md text-center">Save courses you want to learn later by clicking the heart icon on any course card.</p>
                        <button
                            onClick={() => router.push('/courses')}
                            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Explore Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedCourses.map((course) => (
                            <div 
                            key={course.id}
                            onClick={() => router.push(`/courses/${course.slug}`)}
                            className="group flex flex-col bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer relative"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border-b border-slate-100 dark:border-slate-800/50">
                                <img 
                                    src={course.image || course.thumbnail_url || course.image_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'} 
                                    alt={course.title} 
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight line-clamp-2 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem]">
                                    {course.title}
                                </h3>
                                
                                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                                    {course.instructor || (course as any).instructor_name || 'Expert Instructor'}
                                </p>
                                
                                <div className="mt-auto flex items-end justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2 text-[13px]">
                                            {Number(course.average_rating) > 0 ? (
                                                <>
                                                    <span className="font-bold text-amber-600 dark:text-amber-500">{Number(course.average_rating).toFixed(1)}</span>
                                                    <div className="flex text-amber-500">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    </div>
                                                    <span className="text-slate-400 font-medium">({course.review_count || 0})</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 font-medium">No rating</span>
                                            )}
                                        </div>
                                        
                                        <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                                            {enrolledIds.includes(course.id) ? (
                                                <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Enrolled
                                                </div>
                                            ) : (
                                                <>
                                                    <span>{course.price ? `₹${course.price}` : '₹1,999.00'}</span>
                                                    {(course.bestseller || course.price) && (
                                                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Popular</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(course.id); }}
                                        className="p-2.5 rounded-full transition-all duration-300 z-10 bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
