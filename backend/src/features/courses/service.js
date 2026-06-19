import { supabase } from '../../lib/supabase.js'
import { query } from '../../config/db.js'

const listPublished = async () => {
    const res = await query(`
        SELECT id, title, slug, description, price, instructor_id, is_published, created_at 
        FROM courses 
        WHERE is_published = true 
        ORDER BY created_at DESC 
        LIMIT 50
    `);
    return res.rows;
}

const listAdmin = async (token) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const profileRes = await query('SELECT role FROM users WHERE id = $1', [userData.user.id])
    if (profileRes.rows.length === 0) throw new Error('Unauthorized')
    const profile = profileRes.rows[0]
    if (profile.role !== 'admin' && profile.role !== 'instructor') throw new Error('Unauthorized')

    let sql = 'SELECT id, title, slug, description, price, instructor_id, is_published, created_at FROM courses'
    let params = []
    if (profile.role === 'instructor') {
        sql += ' WHERE instructor_id = $1'
        params.push(userData.user.id)
    }
    sql += ' ORDER BY created_at DESC'
    
    const res = await query(sql, params)
    return res.rows
}

const createCourse = async (token, body) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    const instructorId = userData.user.id
    
    const profileRes = await query('SELECT role FROM users WHERE id = $1', [instructorId])
    if (profileRes.rows.length === 0) throw new Error('Instructor profile not found')
    const profile = profileRes.rows[0]
    if (profile.role !== 'instructor' && profile.role !== 'admin') throw new Error('Only instructors can create courses')

    const res = await query(`
        INSERT INTO courses (instructor_id, title, slug, description, price, is_published) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
    `, [instructorId, body.title, body.slug, body.description || null, body.price ?? 0, body.is_published ?? false])
    
    return res.rows[0]
}

const getCourse = async (id) => {
    const res = await query('SELECT * FROM courses WHERE id = $1', [id])
    if (res.rows.length === 0) throw new Error('Course not found')
    const course = res.rows[0]
    
    const lecRes = await query('SELECT * FROM lectures WHERE course_id = $1 ORDER BY "order" ASC', [id])
    course.lectures = lecRes.rows
    return course
}

const updateCourse = async (token, id, body) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [id])
    if (courseRes.rows.length === 0) throw new Error('Course not found')
    if (courseRes.rows[0].instructor_id !== userData.user.id) throw new Error('Forbidden')

    const updates = []
    const params = []
    let i = 1
    for (const [key, value] of Object.entries(body)) {
        updates.push(`"${key}" = $${i}`)
        params.push(value)
        i++
    }
    params.push(id)
    
    if (updates.length > 0) {
        const updateSql = `UPDATE courses SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`
        const updatedRes = await query(updateSql, params)
        return updatedRes.rows[0]
    }
    
    return await getCourse(id)
}

const deleteCourse = async (token, id) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [id])
    if (courseRes.rows.length === 0) throw new Error('Course not found')
    if (courseRes.rows[0].instructor_id !== userData.user.id) throw new Error('Forbidden')

    await query('DELETE FROM courses WHERE id = $1', [id])
    return true
}

const bulkDelete = async (token, ids) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const profileRes = await query('SELECT role FROM users WHERE id = $1', [userData.user.id])
    if (profileRes.rows.length === 0) throw new Error('Unauthorized')
    const profile = profileRes.rows[0]
    if (profile.role !== 'admin' && profile.role !== 'instructor') throw new Error('Unauthorized')

    if (ids.length === 0) return true

    if (profile.role === 'instructor') {
        const placeholders = ids.map((_, i) => `$${i + 2}`).join(', ')
        await query(`DELETE FROM courses WHERE instructor_id = $1 AND id IN (${placeholders})`, [userData.user.id, ...ids])
    } else {
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
        await query(`DELETE FROM courses WHERE id IN (${placeholders})`, [...ids])
    }
    return true
}

const bulkPublish = async (token, ids, status) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const profileRes = await query('SELECT role FROM users WHERE id = $1', [userData.user.id])
    if (profileRes.rows.length === 0) throw new Error('Unauthorized')
    const profile = profileRes.rows[0]
    if (profile.role !== 'admin' && profile.role !== 'instructor') throw new Error('Unauthorized')

    if (ids.length === 0) return true

    if (profile.role === 'instructor') {
        const placeholders = ids.map((_, i) => `$${i + 3}`).join(', ')
        await query(`UPDATE courses SET is_published = $1 WHERE instructor_id = $2 AND id IN (${placeholders})`, [status, userData.user.id, ...ids])
    } else {
        const placeholders = ids.map((_, i) => `$${i + 2}`).join(', ')
        await query(`UPDATE courses SET is_published = $1 WHERE id IN (${placeholders})`, [status, ...ids])
    }
    return true
}

const updateLectures = async (token, courseId, lectures) => {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) throw new Error('Invalid token')
    
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId])
    if (courseRes.rows.length === 0) throw new Error('Course not found')
    if (courseRes.rows[0].instructor_id !== userData.user.id) throw new Error('Forbidden')

    await query('DELETE FROM lectures WHERE course_id = $1', [courseId])
    
    if (lectures && lectures.length > 0) {
        for (const l of lectures) {
            await query(`
                INSERT INTO lectures (course_id, title, description, video_url, "order", is_preview)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [courseId, l.title, l.description, l.video_url, l.order, l.is_preview])
        }
    }
    return true
}

export { listPublished, listAdmin, createCourse, getCourse, updateCourse, deleteCourse, bulkDelete, bulkPublish, updateLectures };
