"use client"
import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import { useWishlist } from '@/hooks/useWishlist'
import useUser from '@/lib/useUser'
import Loader from '@/components/ui/Loader'
import CourseCard from '@/components/CourseCard'

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

    if (loadingCourses) return <Loader type="courses" />

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Courses</h1>
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
