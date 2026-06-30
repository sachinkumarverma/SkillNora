import { query } from "../../config/db.js";

const getNotes = async (userId) => {
  const { rows } = await query(
    `
    SELECT n.*, c.title as "courseTitle", c.slug as "courseSlug", l.title as "lectureTitle"
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    LEFT JOIN lectures l ON n.lecture_id::text = l.id::text
    WHERE n.user_id = $1
    ORDER BY n.updated_at DESC
  `,
    [userId],
  );

  return rows.map((row) => {
    return {
      ...row,
      lectureId: row.lecture_id,
      updatedAt: row.updated_at || row.created_at,
    };
  });
};

const saveNote = async (userId, courseId, lectureId, text) => {
  const { rows } = await query(
    `
    INSERT INTO notes (user_id, course_id, lecture_id, text) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `,
    [userId, courseId, lectureId, text],
  );
  return rows[0];
};

const deleteNote = async (userId, noteId) => {
  await query(`DELETE FROM notes WHERE id = $1 AND user_id = $2`, [
    noteId,
    userId,
  ]);
};

const bulkDeleteNotes = async (userId, noteIds) => {
  if (!noteIds || noteIds.length === 0) return;
  const placeholders = noteIds.map((_, i) => `$${i + 2}`).join(",");
  await query(
    `DELETE FROM notes WHERE user_id = $1 AND id IN (${placeholders})`,
    [userId, ...noteIds],
  );
};

export const notesRepository = {
  getNotes,
  saveNote,
  deleteNote,
  bulkDeleteNotes,
};
