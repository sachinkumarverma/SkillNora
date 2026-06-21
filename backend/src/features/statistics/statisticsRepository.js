import { query } from '../../config/db.js';

const getStats = async (userId, role) => {
  if (role === 'admin') {
    const { rows: users } = await query(`SELECT id FROM users WHERE role = 'student'`);
    const { rows: courses } = await query(`SELECT id FROM courses`);
    
    const { rows: orders } = await query(`
      SELECT o.id as transaction_id, o.amount, o.created_at, o.status, COALESCE(u.full_name, split_part(u.email, '@', 1)) as user_name, c.title as course_title 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN courses c ON o.course_id = c.id
      ORDER BY o.created_at DESC
    `);
    
    const { rows: enrolls } = await query(`SELECT id, enrolled_at as created_at FROM enrollments`);
    
    return {
      isAdmin: true,
      activeStudents: users.length,
      publishedCourses: courses.length,
      orders: orders || [],
      enrollments: enrolls || []
    };
  }

  const sqlCourses = `SELECT id FROM courses WHERE instructor_id = $1`;
  const { rows: courses } = await query(sqlCourses, [userId]);
  
  const sqlEnrolls = `SELECT id, enrolled_at as created_at FROM enrollments WHERE user_id = $1`;
  const { rows: enrolls } = await query(sqlEnrolls, [userId]);
  
  const sqlCerts = `SELECT id, issued_at as created_at FROM certificates WHERE user_id = $1`;
  const { rows: certs } = await query(sqlCerts, [userId]);
  
  const sqlWishlist = `SELECT id, created_at FROM wishlist_items WHERE user_id = $1`;
  const { rows: wishlist } = await query(sqlWishlist, [userId]);
  
  const sqlNotes = `SELECT id, updated_at as created_at FROM notes WHERE user_id = $1`;
  const { rows: notes } = await query(sqlNotes, [userId]);

  const activityData = {
    enrollments: enrolls.map(e => e.created_at),
    certificates: certs.map(c => c.created_at),
    wishlist: wishlist.map(w => w.created_at),
    notes: notes.map(n => n.created_at)
  };

  return {
    isAdmin: false,
    courses: courses || [],
    enrollments: enrolls || [],
    certificates: certs || [],
    wishlist: wishlist || [],
    notes: notes || [],
    activityData
  };
};

export const statisticsRepository = {
  getStats
};