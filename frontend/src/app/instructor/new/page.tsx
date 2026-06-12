"use client"
import React, { useState } from 'react'
import api from '../../../lib/api'

export default function NewCoursePage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function create(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        try {
            const payload = { title, description }
            const res = await api.api('/api/courses', { method: 'POST', body: JSON.stringify(payload) })
            setResult(res)
        } catch (err: any) {
            setResult({ error: String(err) })
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-3xl mx-auto mt-12">
            <div className="p-6 rounded-xl glass">
                <h2 className="text-2xl font-semibold">Create a new course</h2>
                <form className="mt-4 space-y-4" onSubmit={create}>
                    <div>
                        <label className="block text-sm">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-2 p-3 rounded-md border" />
                    </div>
                    <div>
                        <label className="block text-sm">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-2 p-3 rounded-md border" rows={6} />
                    </div>
                    <div className="flex gap-3">
                        <button disabled={loading} className="btn btn-primary">Create</button>
                    </div>
                </form>

                {result && <pre className="mt-4 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>}
            </div>
        </div>
    )
}
