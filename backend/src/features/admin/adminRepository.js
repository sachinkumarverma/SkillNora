import { query } from '../../config/db.js';

const getStudents = async () => {
    const sql = `
        SELECT 
            u.id, 
            u.full_name as name, 
            u.email, 
            u.created_at as joined,
            (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) as enrolled,
            (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as completed,
            COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture', au.raw_user_meta_data->>'photoURL') as avatar_url
        FROM users u
        LEFT JOIN auth.users au ON u.id = au.id
        WHERE u.role = 'student'
        ORDER BY u.created_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        status: 'Active',
        joined: new Date(r.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
        enrolled: parseInt(r.enrolled) || 0,
        completed: parseInt(r.completed) || 0
    }));
};

const getPayments = async () => {
    const sql = `
        SELECT 
            o.id as id,
            o.razorpay_order_id as transaction_id,
            o.amount,
            o.status,
            o.created_at as date,
            u.full_name as user_name,
            c.title as course_title
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN courses c ON o.course_id = c.id
        ORDER BY o.created_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        amount: parseInt(r.amount),
        date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }));
};

const getEnrollments = async () => {
    const sql = `
        SELECT 
            e.id,
            e.enrolled_at as date,
            e.progress,
            u.full_name as user_name,
            u.email as user_email,
            c.title as course_title
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }));
};

const getCertificates = async () => {
    const sql = `
        SELECT 
            c.id,
            c.issued_at as date,
            u.full_name as user_name,
            crs.title as course_title
        FROM certificates c
        JOIN users u ON c.user_id = u.id
        JOIN courses crs ON c.course_id = crs.id
        ORDER BY c.issued_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }));
};

const getInstructors = async () => {
    const sql = `
        SELECT 
            u.id, 
            u.full_name as name, 
            u.email, 
            u.created_at as joined,
            (SELECT COUNT(*) FROM courses WHERE instructor_id = u.id) as courses,
            (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = u.id) as students,
            (SELECT COALESCE(SUM(amount), 0) FROM orders o JOIN courses c ON o.course_id = c.id WHERE c.instructor_id = u.id AND o.status IN ('created', 'paid')) as revenue
        FROM users u
        WHERE u.role = 'instructor'
        ORDER BY u.created_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        status: 'Approved',
        joined: new Date(r.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
        courses: parseInt(r.courses) || 0,
        students: parseInt(r.students) || 0,
        revenue: `Rs. ${parseInt(r.revenue)}`
    }));
};

const getReviews = async () => {
    const sql = `
        SELECT 
            r.id,
            r.rating,
            r.review_text,
            r.created_at as date,
            u.full_name as user_name,
            c.title as course_title,
            COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture', au.raw_user_meta_data->>'photoURL') as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN auth.users au ON u.id = au.id
        JOIN courses c ON r.course_id = c.id
        ORDER BY r.created_at DESC
    `;
    const { rows } = await query(sql);
    return rows.map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }));
};

const getNotifications = async () => {
    // Assuming notifications table exists
    const sql = `
        SELECT n.*, u.full_name as user_name 
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
        LIMIT 100
    `;
    try {
        const { rows } = await query(sql);
        return rows.map(r => ({
            ...r,
            date: new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
        }));
    } catch (e) {
        // Table might not exist in some environments
        return [];
    }
};

const getCategories = async () => {
    // We group by category column in courses if categories table doesn't exist
    const sql = `
        SELECT 
            category as name,
            COUNT(*) as courses_count,
            SUM(total_reviews) as total_reviews
        FROM courses
        WHERE category IS NOT NULL
        GROUP BY category
    `;
    const { rows } = await query(sql);
    return rows.map((r, i) => ({
        id: i.toString(),
        name: r.name,
        courses_count: parseInt(r.courses_count) || 0,
        total_reviews: parseInt(r.total_reviews) || 0
    }));
};

export const adminRepository = {
    getStudents,
    getPayments,
    getEnrollments,
    getCertificates,
    getInstructors,
    getReviews,
    getNotifications,
    getCategories
};
