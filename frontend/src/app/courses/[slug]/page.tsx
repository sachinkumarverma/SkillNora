"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '../../../lib/api'
import VideoPlayer from '../../../components/VideoPlayer'

export default function CourseDetailPage({ params }: any) {
    const slug = params?.slug
    const [course, setCourse] = useState<any | null>(null)

    useEffect(() => {
        if (!slug) return
        let mounted = true
        api.api(`/api/courses/${slug}`).then((d: any) => { if (mounted) setCourse(d.data ?? d) }).catch(() => { })
        return () => { mounted = false }
    }, [slug])

    if (!course) return <div>Loading...</div>

    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="p-6 rounded-xl glass">
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <p className="text-slate-600 mt-2">{course.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                            <button className="btn btn-primary">Enroll</button>
                            <button className="btn btn-outline">Preview</button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Lectures</h2>
                        <div className="space-y-4">
                            {course.lectures?.length ? course.lectures.map((l: any) => (
                                <div key={l.id} className="p-4 border rounded-md bg-white dark:bg-slate-800 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{l.title}</div>
                                        <div className="text-sm muted">{l.duration || '—'}</div>
                                    </div>
                                    <div>
                                        <a href={`/courses/${course.slug}/lecture/${l.id}`} className="btn btn-outline">Open</a>
                                    </div>
                                </div>
                            )) : <div className="text-slate-500">No lectures yet.</div>}
                        </div>
                    </div>
                </div>

                <aside>
                    <div className="p-4 rounded-xl glass">
                        <div className="text-sm muted">Instructor</div>
                        <div className="font-semibold mt-1">{course.instructor_name ?? course.instructor_id}</div>
                        <div className="mt-4 text-sm muted">Price</div>
                        <div className="font-semibold mt-1">${course.price ?? 49}</div>
                    </div>
                </aside>
            </div>
        </section>
    )
}
