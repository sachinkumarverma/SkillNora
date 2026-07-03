"use client"
import { useEffect, useState, Suspense } from 'react'
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

        const categoryFilter = searchParams.get('category')
        const roleFilter = searchParams.get('role')
        const skillFilter = searchParams.get('skill')
        const exactCertFilter = searchParams.get('certificate_type')

        const normalize = (str: string | undefined | null) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

        if (categoryFilter) {
            const normFilter = normalize(categoryFilter);
            filtered = filtered.filter(c => normalize(c.category) === normFilter)
        }
        if (roleFilter) {
            const normFilter = normalize(roleFilter);
            filtered = filtered.filter(c => normalize(c.target_role) === normFilter)
        }
        if (skillFilter) {
            const normFilter = normalize(skillFilter);
            filtered = filtered.filter(c => normalize(c.primary_skill) === normFilter)
        }
        if (exactCertFilter) {
            const normFilter = normalize(exactCertFilter);
            filtered = filtered.filter(c => normalize(c.certificate_type) === normFilter)
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
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">All Courses</h1>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {showFilters && (
                            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                                {(searchParams.get('price') || searchParams.get('certificate') || searchParams.get('search') || searchParams.get('category')) && (
                                    <button 
                                        onClick={() => router.push('/courses')}
                                        className="text-sm font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors mr-2"
                                    >
                                        Clear
                                    </button>
                                )}
                                <div className="w-[160px]">
                                    <CustomDropdown 
                                        value={searchParams.get('price') || ''} 
                                        onChange={(val) => updateFilters('price', val)}
                                        placeholder="Price"
                                        hidePlaceholderOption={true}
                                        options={[
                                            { label: "Free Courses", value: "free" },
                                            { label: "Paid Courses", value: "paid" }
                                        ]}
                                    />
                                </div>
                                <div className="w-[160px]">
                                    <CustomDropdown 
                                        value={searchParams.get('certificate') || ''} 
                                        onChange={(val) => updateFilters('certificate', val)}
                                        placeholder="Certificate"
                                        hidePlaceholderOption={true}
                                        options={[
                                            { label: "Included", value: "yes" },
                                            { label: "Not Included", value: "no" }
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold border shrink-0 ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            {showFilters ? 'Hide Filters' : 'Filter Courses'}
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard 
                            key={course.id || course.slug}
                            course={course}
                            isEnrolled={enrolledIds.includes(course.id)}
                        />
                    ))}
                    
                    {courses.length === 0 && !loadingCourses && (
                        <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-20 px-6 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Courses Found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">We couldn't find any courses matching your selected filters or category. Try adjusting your search criteria.</p>
                            <div className="flex gap-4">
                                <button onClick={() => router.push('/courses')} className="px-6 py-3 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm">View All Courses</button>
                            </div>
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
