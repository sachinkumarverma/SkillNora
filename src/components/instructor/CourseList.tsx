"use client"
import React, { useEffect, useState } from 'react'
import useUser from '../../lib/useUser'

type Props = { onEdit?: (course: any) => void }

export default function CourseList({ onEdit }: Props) {
    const { user } = useUser()
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        async function load() {
            const API = (process.env.NEXT_PUBLIC_API_URL as string) || ''
            const endpoint = API ? `${API}/api/courses` : '/api/courses'
            const res = await fetch(endpoint)
            const json = await res.json()
            setCourses(json.courses || [])
        }
        load()
    }, [])

    return (
        <div>
            <h2 className="text-lg font-medium">Your courses</h2>
            <div className="mt-4 space-y-3">
                {courses.map(c => (
                    <div key={c.id} className="p-3 rounded-md border flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{c.title}</div>
                            <div className="text-sm text-slate-500">{c.description}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit?.(c)} className="px-3 py-1 border rounded">Edit</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
