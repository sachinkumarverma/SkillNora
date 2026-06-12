"use client"
import React, { useEffect, useState } from 'react'
import useUser from '../../lib/useUser'

type Props = { editing?: any | null, onSaved?: () => void }

export default function CourseForm({ editing, onSaved }: Props) {
    const { user } = useUser()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editing) {
            setTitle(editing.title || '')
            setSlug(editing.slug || '')
            setDescription(editing.description || '')
            setPrice(editing.price || 0)
        }
    }, [editing])

    async function save() {
        if (!user) return alert('Sign in first')
        setLoading(true)
        try {
            const token = (await import('../../lib/supabaseClient')).supabase.auth.getSession().then(r => r.data.session?.access_token)
            const payload = { title, slug, description, price, is_published: false }
            const headers: any = { 'Content-Type': 'application/json' }
            const t = await token
            if (t) headers['Authorization'] = `Bearer ${t}`

            const API = (process.env.NEXT_PUBLIC_API_URL as string) || ''
            const endpoint = API ? `${API}/api/courses` : '/api/courses'
            const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) })
            const json = await res.json()
            if (json.error) alert(json.error)
            else {
                setTitle(''); setSlug(''); setDescription(''); setPrice(0)
                onSaved?.()
                alert('Course created')
            }
        } catch (err: any) {
            alert(err.message)
        } finally { setLoading(false) }
    }

    return (
        <div className="p-4 rounded-md border bg-white dark:bg-slate-800">
            <h3 className="font-medium">{editing ? 'Edit course' : 'Create course'}</h3>
            <div className="mt-3 space-y-2">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
                <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" className="w-full p-2 border rounded" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
                <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Price" className="w-full p-2 border rounded" />
                <div className="flex gap-2">
                    <button disabled={loading} onClick={save} className="px-4 py-2 bg-primary-500 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    )
}
