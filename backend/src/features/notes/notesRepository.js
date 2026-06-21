import { query } from '../../config/db.js';

const getNotes = async (userId) => {
  const { rows } = await query(`
    SELECT n.*, c.title as "courseTitle", c.slug as "courseSlug", c.lectures
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
  `, [userId]);
  
  return rows.map(row => {
    let lectureTitle = 'Unknown Lecture';
    if (row.lectures) {
      const lecture = row.lectures.find(l => String(l.id) === String(row.lecture_id));
      if (lecture) lectureTitle = lecture.title;
    }
    delete row.lectures;
    return {
      ...row,
      lectureId: row.lecture_id,
      updatedAt: row.updated_at || row.created_at,
      lectureTitle
    };
  });
};

const saveNote = async (userId, courseId, lectureId, text) => {
  const { rows: existing } = await query(`SELECT id FROM notes WHERE user_id = $1 AND course_id = $2 AND lecture_id = $3`, [userId, courseId, lectureId]);
  
  if (existing.length > 0) {
    const { rows } = await query(`
      UPDATE notes SET text = $1, updated_at = NOW() 
      WHERE id = $2 RETURNING *
    `, [text, existing[0].id]);
    return rows[0];
  } else {
    const { rows } = await query(`
      INSERT INTO notes (user_id, course_id, lecture_id, text) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [userId, courseId, lectureId, text]);
    return rows[0];
  }
};

const deleteNote = async (userId, noteId) => {
  await query(`DELETE FROM notes WHERE id = $1 AND user_id = $2`, [noteId, userId]);
};

export const notesRepository = {
  getNotes,
  saveNote,
  deleteNote
};
