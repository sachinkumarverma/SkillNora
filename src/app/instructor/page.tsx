"use client"
import React, { useEffect, useState } from 'react'
import useUser from '../../lib/useUser'
import CourseList from '../../components/instructor/CourseList'
import CourseForm from '../../components/instructor/CourseForm'

export default function InstructorPage() {
    const { user, loading } = useUser()
    const [editing, setEditing] = useState<any | null>(null)

    if (loading) return <div className="mt-12">Loading...</div>
    if (!user) return <div className="mt-12">Please sign in as an instructor.</div>

    return (
        <div className="max-w-5xl mx-auto mt-8">
            <h1 className="text-2xl font-semibold">Instructor Dashboard</h1>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2">
                    <CourseList onEdit={c => setEditing(c)} />
                </div>
                <div>
                    <CourseForm editing={editing} onSaved={() => setEditing(null)} />
                </div>
            </div>
        </div>
    )
}
