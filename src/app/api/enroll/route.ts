import { NextResponse } from 'next/server'
import supabaseServer from '../../lib/supabaseServer'

export async function POST(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1] ?? null
        if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 })

        const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token)
        if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const body = await req.json()
        const courseId = body.course_id
        if (!courseId) return NextResponse.json({ error: 'course_id required' }, { status: 400 })

        // if course is free, create enrollment immediately; otherwise expect payment flow
        const { data: course } = await supabaseServer.from('courses').select('price').eq('id', courseId).single()
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

        if (Number(course.price) === 0) {
            const { data, error } = await supabaseServer.from('enrollments').insert({ user_id: userData.user.id, course_id: courseId }).select().single()
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json({ enrollment: data })
        }

        return NextResponse.json({ message: 'Paid enrollments should be handled via payment flow' }, { status: 400 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
    }
}
