"use client"
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/hooks/useWishlist'
import useUser from '@/lib/useUser'

interface CourseCardProps {
    course: any;
    isEnrolled?: boolean;
    className?: string;
    variant?: 'default' | 'enrolled';
    onCancel?: (e: React.MouseEvent) => void;
}

export default function CourseCard({ course, isEnrolled, className = "", variant = 'default', onCancel }: CourseCardProps) {
    const router = useRouter()
    const { user } = useUser()
    const { isInWishlist, toggleWishlist } = useWishlist()

    const isFree = course.is_free || course.price === '0' || course.price === 0;

    const priceDisplay = (
        <div className="flex flex-col">
            {isFree ? (
                <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded">Free</span>
                    {course.bestseller && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Popular</span>
                    )}
                </div>
            ) : Number(course.discount_price) && Number(course.price) && Number(course.price) > Number(course.discount_price) ? (
                <div className="flex flex-wrap items-center gap-2 mb-0.5 mt-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white">₹{course.discount_price}</span>
                    <span className="text-sm font-semibold text-slate-400 line-through decoration-slate-400/70">₹{course.price}</span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{Math.round(((Number(course.price) - Number(course.discount_price)) / Number(course.price)) * 100)}% off</span>
                </div>
            ) : (
                <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
                    <span>₹{course.price || '1,999.00'}</span>
                    {course.bestseller && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Popular</span>
                    )}
                </div>
            )}
        </div>
    )

    return (
        <Link
            href={`/courses/${course.slug}`}
            className={`group flex flex-col bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer relative ${className}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border-b border-slate-100 dark:border-slate-800/50">
                <img
                    src={course.image || course.thumbnail_url || course.image_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isEnrolled && (
                    <div className="absolute top-3 right-3 text-emerald-500 z-10 flex items-center justify-center" title="Enrolled">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight line-clamp-2 mb-1.5 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem]" title={course.title}>
                    {course.title?.length > 100 ? `${course.title.substring(0, 100)}...` : course.title}
                </h3>

                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 line-clamp-1">
                    {course.instructor || (course as any).instructor_name || 'Expert Instructor'}
                </p>

                <div className="mt-auto flex items-end justify-between">
                    <div className="w-full">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[13px]">
                            {Number(course.average_rating || course.rating) > 0 ? (
                                <>
                                    <span className="font-bold text-amber-600 dark:text-amber-500">{Number(course.average_rating || course.rating).toFixed(1)}</span>
                                    <div className="flex text-amber-500">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                    <span className="text-slate-400 font-medium">({course.review_count || course.reviews_count || course.reviews || 0})</span>
                                </>
                            ) : (
                                <span className="text-slate-400 font-medium">No rating</span>
                            )}
                        </div>

                        {priceDisplay}
                    </div>
                    {variant !== 'enrolled' && user && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(course.id); }}
                            className={`ml-2 p-2.5 rounded-full transition-all duration-300 z-10 shrink-0 ${isInWishlist(course.id) ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400'}`}
                        >
                            <svg className="w-5 h-5" fill={isInWishlist(course.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </Link>
    )
}
