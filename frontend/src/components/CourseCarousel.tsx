"use client"
import React, { useRef } from 'react'
import { useWishlist } from '../hooks/useWishlist'

export default function CourseCarousel({ title, courses }: { title: string, courses: any[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { isInWishlist, toggleWishlist } = useWishlist()

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
                        className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm bg-white dark:bg-slate-900"
                        aria-label="Scroll left"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={scrollRight}
                        className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm bg-white dark:bg-slate-900"
                        aria-label="Scroll right"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <a key={course.id} href={`/courses/${course.slug}`} className="min-w-[280px] max-w-[280px] snap-start group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer shrink-0 relative">
                        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.75rem]">
                                {course.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-3 truncate">
                                {course.instructor || course.instructor_name}
                            </p>
                            
                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2 text-sm">
                                        <span className="font-bold text-amber-500">{course.rating || '4.7'}</span>
                                        <div className="flex text-amber-400">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                        <span className="text-slate-400 font-medium">({course.reviews || '1,234'})</span>
                                    </div>
                                    
                                    <div className="font-black text-slate-900 dark:text-white">
                                        {course.price || '₹1,999.00'}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.preventDefault(); toggleWishlist(course.id); }}
                                    className={`p-2 rounded-full transition-colors ${isInWishlist(course.id) ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-400 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700'}`}
                                >
                                    <svg className="w-5 h-5" fill={isInWishlist(course.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </a>
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
