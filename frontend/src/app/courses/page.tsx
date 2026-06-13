"use client"
import React, { useEffect, useState } from 'react'
import CourseCard from '../../components/CourseCard'
import api from '../../lib/api'
import DashboardLayout from '../../components/layouts/DashboardLayout'

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        let mounted = true
        api.api('/api/courses').then((d: any) => { if (mounted) setCourses(d.data ?? d) }).catch(() => { })
        return () => { mounted = false }
    }, [])

    return (
        <DashboardLayout title="Courses" breadcrumbs={[{ label: 'Courses' }]}>
            <div className="p-6 md:p-8">
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">All Courses</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.length ? courses.map((c) => (
                            <CourseCard key={c.id} title={c.title} author={c.instructor_name ?? c.instructor_id} />
                        )) : (
                            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-12 flex flex-col items-center justify-center text-slate-500 dark:border-slate-800">
                                <p className="text-sm font-medium text-slate-500">No courses yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}
