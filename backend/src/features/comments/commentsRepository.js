import { query } from '../../config/db.js';

const getCommentsByLecture = async (slug, lectureId) => {
  const sql = `
            SELECT * FROM lecture_comments
            WHERE course_slug = $1 AND lecture_id = $2
            ORDER BY created_at ASC
        `;
  const {
    rows
  } = await query(sql, [slug, String(lectureId)]);
  return rows;
};

const insertComment = async payload => {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
            INSERT INTO lecture_comments (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;
  const {
    rows
  } = await query(sql, values);
  return rows[0];
};

const deleteComment = async (id, userId) => {
  const sql = `DELETE FROM lecture_comments WHERE id = $1 AND user_id = $2`;
  await query(sql, [id, userId]);
  return true;
};

const getCommentById = async (id) => {
  const sql = `SELECT * FROM lecture_comments WHERE id = $1`;
  const { rows } = await query(sql, [id]);
  return rows[0];
};

export const commentsRepository = {
  getCommentsByLecture,
  insertComment,
  deleteComment,
  getCommentById
};