"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/hooks/useWishlist'
import useUser from '@/lib/useUser'
import { cartService } from '@/services/cartService'
import apiClient from '@/lib/apiClient'
import Loader from '@/components/ui/Loader'
import CourseCard from '@/components/CourseCard'

export default function WishlistPage() {
    const router = useRouter()
    const { user, loading: userLoading } = useUser()
    const { wishlist, loading: wishlistLoading, toggleWishlist } = useWishlist()
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

    if (loading || isBuying || userLoading || wishlistLoading) {
        return <Loader type="courses" />
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

            const cart = await cartService.getCart()

            for (const course of savedCourses) {
                const isFree = course.is_free || course.price === '0' || course.price === 0;
                if (!isFree && !activeEnrollments.has(course.id) && !cart.some((c: any) => c.id === course.id)) {
                    await cartService.addToCart(course.id)
                }
            }

            router.push('/cart')
        } catch (error) {
            console.error(error)
            setIsBuying(false)
        }
    }

    return (
        <div className="w-full mx-auto p-6 md:p-8">
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
                            <CourseCard 
                                key={course.id}
                                course={course}
                                isEnrolled={enrolledIds.includes(course.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
