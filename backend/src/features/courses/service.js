import { supabase } from '../../lib/supabase.js'

export async function listPublished() {
    const { data, error } = await supabase.from('courses').select('id, title, slug, description, price, instructor_id, is_published, created_at').eq('is_published', true).order('created_at', { ascending: false }).limit(50)
    if (error) throw new Error(error.message)
    return data
}

export async function createCourse(token, body) {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    const instructorId = userData.user.id
    const { data: profile, error: profileErr } = await supabase.from('users').select('role').eq('id', instructorId).single()
    if (profileErr || !profile) throw new Error('Instructor profile not found')
    if (profile.role !== 'instructor' && profile.role !== 'admin') throw new Error('Only instructors can create courses')

    const insert = { instructor_id: instructorId, title: body.title, slug: body.slug, description: body.description || null, price: body.price ?? 0, is_published: body.is_published ?? false }
    const { data, error } = await supabase.from('courses').insert(insert).select().single()
    if (error) throw new Error(error.message)
    return data
}

export async function getCourse(id) {
    const { data, error } = await supabase.from('courses').select('*, lectures(*)').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
}

export async function updateCourse(token, id, body) {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', id).single()
    if (!course) throw new Error('Course not found')
    if (course.instructor_id !== userData.user.id) throw new Error('Forbidden')
    const { data, error } = await supabase.from('courses').update(body).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
}

export async function deleteCourse(token, id) {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', id).single()
    if (!course) throw new Error('Course not found')
    if (course.instructor_id !== userData.user.id) throw new Error('Forbidden')
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return true
}
