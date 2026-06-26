"use client"
import React, { useRef } from 'react'
import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'

export default function CourseCarousel({ title, courses, enrolledIds = [] }: { title: string, courses: any[], enrolledIds?: string[] }) {
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
                    <Link key={course.id} href={`/courses/${course.slug}`} className="min-w-[300px] max-w-[300px] snap-start group flex flex-col bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer shrink-0 relative">
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            <img src={course.image || course.thumbnail_url || course.image_url || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {enrolledIds.includes(course.id) && (
                                <div className="absolute top-3 right-3 text-emerald-500 z-10 flex items-center justify-center" title="Enrolled">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-900">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                                {course.title}
                            </h3>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-4 truncate">
                                {course.instructor || course.instructor_name}
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
                                    
                                    {Number(course.discount_price) && Number(course.discount_price) < Number(course.price) ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">₹{course.discount_price}</span>
                                            <span className="text-sm font-semibold text-slate-400 relative inline-block after:absolute after:left-0 after:w-full after:h-[1px] after:bg-slate-400 after:top-1/2 after:-translate-y-1/2">₹{course.price}</span>
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                                {Math.round(((Number(course.price) - Number(course.discount_price)) / Number(course.price)) * 100)}% off
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                                            <span>{course.price ? `₹${course.price}` : 'Free'}</span>
                                            {(course.bestseller || course.price) && (
                                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Popular</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={(e) => { e.preventDefault(); toggleWishlist(course.id); }}
                                    className={`p-2.5 rounded-full transition-all duration-300 ${isInWishlist(course.id) ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400'}`}
                                >
                                    <svg className="w-5 h-5" fill={isInWishlist(course.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </Link>
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
