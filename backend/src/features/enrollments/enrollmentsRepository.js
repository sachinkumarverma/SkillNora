import { query } from '../../config/db.js';

const insertEnrollment = async (userId, courseId) => {
  // Check if already enrolled to avoid duplicates since there's no unique constraint
  const checkSql = `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1`;
  const checkResult = await query(checkSql, [userId, courseId]);
  if (checkResult.rows.length > 0) return checkResult.rows[0];

  const sql = `
            INSERT INTO enrollments (user_id, course_id)
            VALUES ($1, $2)
            RETURNING *
        `;
  const {
    rows
  } = await query(sql, [userId, courseId]);
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

const findEnrollmentsByUserId = async userId => {
  const sql = `SELECT course_id FROM enrollments WHERE user_id = $1`;
  const {
    rows
  } = await query(sql, [userId]);
  return rows;
};

export const enrollmentsRepository = {
  insertEnrollment,
  getCoursePrice,
  findEnrollmentsByUserId
};