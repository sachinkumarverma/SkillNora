"use client"
import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '../../../lib/api'

import { trendingCourses } from '../../../lib/dummyData'
import { useWishlist } from '../../../hooks/useWishlist'
import useUser from '../../../lib/useUser'

function CoursesContent() {
    const router = useRouter()
    const { user } = useUser()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const searchParams = useSearchParams()
    
    const [allCourses, setAllCourses] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loadingCourses, setLoadingCourses] = useState(true)

    // Load initial data
    useEffect(() => {
        let mounted = true
        api.api('/api/courses').then((d: any) => { 
            if (mounted) {
                const apiCourses = Array.isArray(d) ? d : d.data ?? []
                const combined = [...apiCourses, ...trendingCourses]
                setAllCourses(combined)
            }
        }).catch(() => { 
            if (mounted) setAllCourses(trendingCourses)
        }).finally(() => {
            if (mounted) setLoadingCourses(false)
        })
        return () => { mounted = false }
    }, [])

    // Apply smart filters
    useEffect(() => {
        if (loadingCourses && allCourses.length === 0) return;
        
        let filtered = [...allCourses]
        const search = searchParams.get('search')?.toLowerCase()
        const category = searchParams.get('category')?.toLowerCase()
        const role = searchParams.get('role')?.toLowerCase()
        const skill = searchParams.get('skill')?.toLowerCase()

        if (search) {
            filtered = filtered.filter(c => 
                c.title?.toLowerCase().includes(search) ||
                (c.instructor || c.instructor_name || '').toLowerCase().includes(search) ||
                (c.category || '').toLowerCase().includes(search) ||
                (c.role || '').toLowerCase().includes(search) ||
                (c.skill || '').toLowerCase().includes(search)
            )
        }
        
        if (category) {
            filtered = filtered.filter(c => (c.category || '').toLowerCase().includes(category))
        }

        if (role) {
            filtered = filtered.filter(c => (c.role || '').toLowerCase().includes(role))
        }

        if (skill) {
            filtered = filtered.filter(c => (c.skill || '').toLowerCase().includes(skill))
        }

        setCourses(filtered)
    }, [allCourses, loadingCourses, searchParams])

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Courses</h1>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <div 
                            key={course.id || course.slug} 
                            onClick={() => router.push(`/courses/${course.slug}`)}
                            className="group flex flex-col cursor-pointer transition-all duration-300"
                        >
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 mb-3">
                                <img 
                                    src={course.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'} 
                                    alt={course.title} 
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"></div>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {course.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium line-clamp-1">
                                {course.instructor || (course as any).instructor_name || 'Expert Instructor'}
                            </p>
                            
                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold">
                                        <span className="text-amber-600 dark:text-amber-500">{course.rating || '4.5'}</span>
                                        <div className="flex text-amber-500">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                        <span className="text-slate-400 dark:text-slate-500 font-medium">({course.reviews || '1,234'})</span>
                                    </div>
                                    
                                     <div className="font-black text-slate-900 dark:text-white text-lg">
                                        {course.price || '₹1,999.00'}
                                    </div>
                                </div>
                                {user && (
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(course.id); }}
                                        className={`p-2 rounded-full transition-colors z-10 ${isInWishlist(course.id) ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-400 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700'}`}
                                    >
                                        <svg className="w-5 h-5" fill={isInWishlist(course.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            {(course.bestseller || course.price) && (
                                <div className="mt-2">
                                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Popular</span>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {courses.length === 0 && !loadingCourses && (
                        <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-12 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800">
                            <p className="text-sm font-medium text-slate-500">No courses yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div className="flex h-[60vh] w-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div></div>}>
            <CoursesContent />
        </Suspense>
    )
}
