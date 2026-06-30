"use client"
import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import { useWishlist } from '@/hooks/useWishlist'
import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'
import CourseCard from '@/components/CourseCard'
import CustomDropdown from '@/components/ui/CustomDropdown'

function CoursesContent() {
    const router = useRouter()
    const { user } = useUser()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const searchParams = useSearchParams()
    
    const [allCourses, setAllCourses] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [enrolledIds, setEnrolledIds] = useState<string[]>([])
    const [loadingCourses, setLoadingCourses] = useState(true)

    // Load initial data
    useEffect(() => {
        let mounted = true
        Promise.all([
            apiClient.get('/api/courses').then(r => r.data).catch(() => ({ courses: [] })),
            apiClient.get('/api/enrollments/user').then(r => r.data).catch(() => ({ enrolledIds: [] }))
        ]).then(([coursesRes, enrollRes]: any) => { 
            if (mounted) {
                const apiCourses = coursesRes.courses || (Array.isArray(coursesRes) ? coursesRes : coursesRes.data) || []
                setAllCourses(apiCourses)
                setEnrolledIds(enrollRes.enrolledIds || [])
            }
        }).catch(() => { 
            if (mounted) setAllCourses([])
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
        const priceFilter = searchParams.get('price')?.toLowerCase()
        const certFilter = searchParams.get('certificate')?.toLowerCase()

        if (search) {
            filtered = filtered.filter(c => 
                c.title?.toLowerCase().includes(search) ||
                (c.instructor || c.instructor_name || '').toLowerCase().includes(search)
            )
        }
        
        if (priceFilter === 'free') {
            filtered = filtered.filter(c => c.is_free || !c.price || Number(c.price) === 0)
        } else if (priceFilter === 'paid') {
            filtered = filtered.filter(c => !c.is_free && Number(c.price) > 0)
        }

        if (certFilter === 'yes') {
            filtered = filtered.filter(c => c.certificate_type || c.provide_certificate || c.has_certificate)
        } else if (certFilter === 'no') {
            filtered = filtered.filter(c => !c.certificate_type && !c.provide_certificate && !c.has_certificate)
        }

        setCourses(filtered)
    }, [allCourses, loadingCourses, searchParams])

    const [showFilters, setShowFilters] = useState(false)

    const updateFilters = (key: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()))
        if (value) current.set(key, value)
        else current.delete(key)
        router.push(`/courses?${current.toString()}`)
    }

    if (loadingCourses) return <Loader type="courses" />

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <section>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Courses</h1>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold border ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Filter Courses
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-8 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price</label>
                            <CustomDropdown 
                                value={searchParams.get('price') || ''} 
                                onChange={(val) => updateFilters('price', val)}
                                placeholder="All Prices"
                                options={[
                                    { label: "Free Courses", value: "free" },
                                    { label: "Paid Courses", value: "paid" }
                                ]}
                            />
                        </div>
                        
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Certificate</label>
                            <CustomDropdown 
                                value={searchParams.get('certificate') || ''} 
                                onChange={(val) => updateFilters('certificate', val)}
                                placeholder="Any"
                                options={[
                                    { label: "Certificate Included", value: "yes" },
                                    { label: "No Certificate", value: "no" }
                                ]}
                            />
                        </div>

                        {(searchParams.get('price') || searchParams.get('certificate') || searchParams.get('search')) && (
                            <button 
                                onClick={() => router.push('/courses')}
                                className="mt-6 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard 
                            key={course.id || course.slug}
                            course={course}
                            isEnrolled={enrolledIds.includes(course.id)}
                        />
                    ))}
                    
                    {courses.length === 0 && !loadingCourses && (
                        <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800">
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
        <Suspense fallback={<Loader type="courses" />}>
            <CoursesContent />
        </Suspense>
    )
}
