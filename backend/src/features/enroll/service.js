import { supabase } from '../../lib/supabase.js'

export async function enroll(token, course_id) {
    if (!token) throw new Error('Missing token')
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    if (!course_id) throw new Error('course_id required')
    const { data: course } = await supabase.from('courses').select('price').eq('id', course_id).single()
    if (!course) throw new Error('Course not found')
    if (Number(course.price) === 0) {
        const { data, error } = await supabase.from('enrollments').insert({ user_id: userData.user.id, course_id }).select().single()
        if (error) throw new Error(error.message)
        return data
    }
    throw new Error('Paid enrollments should be handled via payments')
}
