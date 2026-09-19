"use client"
import { useRef, useState, useEffect, useCallback } from 'react'
import CourseCard from '@/components/CourseCard'
import { useWishlist } from '@/hooks/useWishlist'

export default function CourseCarousel({ title, courses, enrolledIds = [] }: { title: string, courses: any[], enrolledIds?: string[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 2)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
        }
    }, [])

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return

        checkScroll()
        el.addEventListener('scroll', checkScroll, { passive: true })
        window.addEventListener('resize', checkScroll)

        return () => {
            el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll, courses])

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
        }
    }

    if (!courses || courses.length === 0) return null;

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{title}</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-sm bg-white dark:bg-slate-900 ${
                            canScrollLeft 
                                ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300' 
                                : 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
                        }`}
                        aria-label="Scroll left"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-sm bg-white dark:bg-slate-900 ${
                            canScrollRight 
                                ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300' 
                                : 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
                        }`}
                        aria-label="Scroll right"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {courses.map(course => (
                    <CourseCard 
                        key={course.id}
                        course={course}
                        isEnrolled={enrolledIds.includes(course.id)}
                        className="min-w-[300px] max-w-[300px] snap-start shrink-0"
                    />
                ))}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    )
}
