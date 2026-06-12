import { NextResponse } from 'next/server'
import supabaseServer from '../../../../lib/supabaseServer'

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params
    const { data, error } = await supabaseServer.from('courses').select('*, lectures(*)').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ course: data })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const token = req.headers.get('authorization')?.split(' ')[1] ?? null
        if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 })

        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await req.json()

        // Ensure user is instructor of the course
        const { data: course } = await supabaseServer.from('courses').select('instructor_id').eq('id', id).single()
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        if (course.instructor_id !== userData.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data, error } = await supabaseServer.from('courses').update(body).eq('id', id).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ course: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const token = req.headers.get('authorization')?.split(' ')[1] ?? null
        if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 })

        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const { data: course } = await supabaseServer.from('courses').select('instructor_id').eq('id', id).single()
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        if (course.instructor_id !== userData.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { error } = await supabaseServer.from('courses').delete().eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
