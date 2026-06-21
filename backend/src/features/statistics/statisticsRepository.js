import { query } from '../../config/db.js';

const getStats = async (userId, role) => {
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