import { supabase } from '../../lib/supabase.js'
import { query } from '../../config/db.js'

const enroll = async (token, course_id) => {
    if (!token) throw new Error('Missing token')
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    if (!course_id) throw new Error('course_id required')
    const courseRes = await query('SELECT price FROM courses WHERE id = $1', [course_id])
    if (courseRes.rows.length === 0) throw new Error('Course not found')
    const course = courseRes.rows[0]
    if (Number(course.price) === 0) {
        const enrollRes = await query(
            'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
            [userData.user.id, course_id]
        )
        return enrollRes.rows[0]
    }
    throw new Error('Paid enrollments should be handled via payments')
}

export { enroll };
