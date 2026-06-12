"use client"
import React, { useEffect, useState } from 'react'
import CourseCard from '../../components/CourseCard'
import api from '../../lib/api'

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        let mounted = true
        api.api('/api/courses').then((d: any) => { if (mounted) setCourses(d.data ?? d) }).catch(() => { })
        return () => { mounted = false }
    }, [])

    return (
        <section>
            <h1 className="text-3xl font-bold mb-6">All Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length ? courses.map((c) => <CourseCard key={c.id} title={c.title} author={c.instructor_name ?? c.instructor_id} />) : (
                    <div className="text-slate-500">No courses yet.</div>
                )}
            </div>
        </section>
    )
}
