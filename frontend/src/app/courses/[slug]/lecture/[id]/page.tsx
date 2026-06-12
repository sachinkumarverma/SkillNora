"use client"
import React, { useEffect, useState } from 'react'
import api from '../../../../lib/api'
import VideoPlayer from '../../../../components/VideoPlayer'

export default function LecturePage({ params }: any) {
    const { slug, id } = params
    const [lecture, setLecture] = useState<any | null>(null)

    useEffect(() => {
        if (!id) return
        let mounted = true
        api.api(`/api/courses/${slug}`).then((d: any) => {
            const course = d.data ?? d
            const l = (course.lectures || []).find((x: any) => String(x.id) === String(id))
            if (mounted) setLecture(l ?? null)
        }).catch(() => { })
        return () => { mounted = false }
    }, [slug, id])

    if (!lecture) return <div>Loading...</div>

    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <main className="lg:col-span-2">
                    <h1 className="text-2xl font-semibold mb-4">{lecture.title}</h1>
                    <div className="rounded-lg overflow-hidden shadow-md">
                        <VideoPlayer src={lecture.video_url} poster={lecture.poster_url} />
                    </div>
                    <div className="mt-4 p-4 rounded-md bg-white dark:bg-slate-800">{lecture.description}</div>
                </main>
                <aside>
                    <div className="p-4 rounded-xl glass">
                        <div className="text-sm muted">Resources</div>
                        <ul className="mt-2 space-y-2 text-sm">
                            <li><a className="text-primary-600" href="#">Download slides</a></li>
                            <li><a className="text-primary-600" href="#">Transcript</a></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    )
}
