import { query } from '../../config/db.js';

const getStats = async (userId, role) => {
  const sqlCourses = `SELECT id FROM courses WHERE instructor_id = $1`;
  const {
    rows: courses
  } = await query(sqlCourses, [userId]);
  const sqlEnrolls = `SELECT id FROM enrollments WHERE user_id = $1`;
  const {
    rows: enrolls
  } = await query(sqlEnrolls, [userId]);
  const sqlCerts = `SELECT id FROM certificates WHERE user_id = $1`;
  const {
    rows: certs
  } = await query(sqlCerts, [userId]);
  return {
    courses: courses || [],
    enrollments: enrolls || [],
    certificates: certs || []
  };
};

export const statisticsRepository = {
  getStats
};