import { NextResponse } from 'next/server'
import supabaseServer from '../../../lib/supabaseServer'

// GET: list published courses
export async function GET() {
    const { data, error } = await supabaseServer
        .from('courses')
        .select('id, title, slug, description, price, instructor_id, is_published, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ courses: data })
}

// POST: create a new course (protected — requires Bearer token and instructor role)
export async function POST(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1] ?? null
        if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 })

        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await req.json()
        const instructorId = userData.user.id

        // Check role from `users` table
        const { data: profile, error: profileErr } = await supabaseServer.from('users').select('role').eq('id', instructorId).single()
        if (profileErr || !profile) return NextResponse.json({ error: 'Instructor profile not found. Create profile first.' }, { status: 403 })
        if (profile.role !== 'instructor' && profile.role !== 'admin') return NextResponse.json({ error: 'Only instructors can create courses' }, { status: 403 })

        const insert = {
            instructor_id: instructorId,
            title: body.title,
            slug: body.slug,
            description: body.description || null,
            price: body.price ?? 0,
            is_published: body.is_published ?? false
        }

        const { data, error } = await supabaseServer.from('courses').insert(insert).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ course: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
