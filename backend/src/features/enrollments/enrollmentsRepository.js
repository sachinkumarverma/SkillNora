import { query } from '../../config/db.js';

const enroll = async (userId, courseId, expiresAt) => {
  const sql = `
            INSERT INTO enrollments (user_id, course_id, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
  const {
    rows
  } = await query(sql, [userId, courseId, expiresAt]);
  return rows[0];
};

const getCoursePrice = async courseId => {
  const sql = `SELECT price FROM courses WHERE id = $1 LIMIT 1`;
  const {
    rows
  } = await query(sql, [courseId]);
  if (rows.length === 0) throw new Error('Course not found');
  return rows[0].price;
};

const getMyEnrollments = async userId => {
  const sql = `SELECT course_id FROM enrollments WHERE user_id = $1`;
  const {
    rows
  } = await query(sql, [userId]);
  return rows;
};

export const enrollmentsRepository = {
  enroll,
  getCoursePrice,
  getMyEnrollments
};