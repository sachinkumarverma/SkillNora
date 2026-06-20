import { query } from '../../config/db.js';

const getNotes = async (userId) => {
  const { rows } = await query(`
    SELECT n.*, c.title as course_title 
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
  `, [userId]);
  return rows;
};

const saveNote = async (userId, courseId, lectureId, text) => {
  const { rows } = await query(`
    INSERT INTO notes (user_id, course_id, lecture_id, text) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `, [userId, courseId, lectureId, text]);
  return rows[0];
};

const deleteNote = async (userId, noteId) => {
  await query(`DELETE FROM notes WHERE id = $1 AND user_id = $2`, [noteId, userId]);
};

export const notesRepository = {
  getNotes,
  saveNote,
  deleteNote
};
