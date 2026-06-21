import { query } from '../../config/db.js';

const getAllAdmin = async () => {
  const sql = `SELECT c.*, u.full_name as instructor_name, u.email as instructor_email FROM courses c LEFT JOIN users u ON c.instructor_id = u.id ORDER BY created_at DESC`;
  const {
    rows
  } = await query(sql);
  return rows.map(r => ({
    ...r,
    instructor: {
      full_name: r.instructor_name,
      email: r.instructor_email
    }
  }));
};

const updatePublishStatus = async (ids, status) => {
  if (!ids || ids.length === 0) return true;
  const placeholders = ids.map((_, i) => '$' + (i + 2)).join(',');
  const sql = `UPDATE courses SET is_published = $1 WHERE id IN (${placeholders})`;
  await query(sql, [status, ...ids]);
  return true;
};

const getAllPublished = async () => {
  const sql = `
            SELECT 
                c.id, c.title, c.slug, c.description, c.price, c.instructor_id, c.is_published, c.created_at, c.thumbnail_url, c.category, c.target_role, c.primary_skill,
                u.full_name as instructor_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE c.is_published = true
            GROUP BY c.id, u.full_name
            ORDER BY c.created_at DESC
            LIMIT 50
        `;
  const {
    rows
  } = await query(sql);
  return rows;
};

const getBySlugOrId = async identifier => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
  const courseSql = isUuid 
    ? `SELECT c.*, u.full_name as instructor_name, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count FROM courses c LEFT JOIN users u ON c.instructor_id = u.id LEFT JOIN reviews r ON c.id = r.course_id WHERE c.id = $1 GROUP BY c.id, u.full_name LIMIT 1` 
    : `SELECT c.*, u.full_name as instructor_name, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count FROM courses c LEFT JOIN users u ON c.instructor_id = u.id LEFT JOIN reviews r ON c.id = r.course_id WHERE c.slug = $1 GROUP BY c.id, u.full_name LIMIT 1`;
  const {
    rows: cRows
  } = await query(courseSql, [identifier]);
  if (cRows.length === 0) return null;
  const course = cRows[0];
  const lecSql = `SELECT * FROM lectures WHERE course_id = $1 ORDER BY id ASC`;
  const {
    rows: lRows
  } = await query(lecSql, [course.id]);
  course.lectures = lRows;
  course.instructor = {
    full_name: course.instructor_name
  };
  return course;
};

const checkEnrollment = async (userId, courseId) => {
  if (!userId || !courseId) return false;
  const sql = `SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1`;
  const {
    rows
  } = await query(sql, [userId, courseId]);
  return rows[0] || null;
};

const create = async payload => {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO courses (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const {
    rows
  } = await query(sql, values);
  return rows[0];
};

const update = async (id, payload) => {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const sql = `UPDATE courses SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`;
  const {
    rows
  } = await query(sql, [...values, id]);
  return rows[0];
};

const removeCourse = async id => {
  const sql = `DELETE FROM courses WHERE id = $1`;
  await query(sql, [id]);
  return true;
};

const checkInstructor = async courseId => {
  const sql = `SELECT instructor_id FROM courses WHERE id = $1 LIMIT 1`;
  const {
    rows
  } = await query(sql, [courseId]);
  if (rows.length === 0) throw new Error('Course not found');
  return rows[0].instructor_id;
};

const getUserRole = async userId => {
  const sql = `SELECT role FROM users WHERE id = $1 LIMIT 1`;
  const {
    rows
  } = await query(sql, [userId]);
  if (rows.length === 0) return 'student';
  return rows[0].role;
};

const updateProgress = async (userId, courseId, progressObj) => {
  const sql = `UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3`;
  await query(sql, [progressObj, userId, courseId]);
  return true;
};

const issueCertificate = async (userId, courseId, code) => {
  const sql = `INSERT INTO certificates (user_id, course_id, verification_code) VALUES ($1, $2, $3)`;
  await query(sql, [userId, courseId, code]);
  return true;
};

const getEnrollment = async (userId, courseId) => {
  const sql = `SELECT id, progress FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1`;
  const {
    rows
  } = await query(sql, [userId, courseId]);
  if (rows.length === 0) return null;
  return rows[0];
};

const checkCertificate = async (userId, courseId) => {
  const sql = `SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2 LIMIT 1`;
  const {
    rows
  } = await query(sql, [userId, courseId]);
  return rows.length > 0;
};

const deleteMultiple = async ids => {
  if (!ids || ids.length === 0) return true;
  const placeholders = ids.map((_, i) => '$' + (i + 1)).join(',');
  const sql = `DELETE FROM courses WHERE id IN (${placeholders})`;
  await query(sql, ids);
  return true;
};

const updateLectures = async (courseId, lectures) => {
  await query(`DELETE FROM lectures WHERE course_id = $1`, [courseId]);
  if (lectures && lectures.length > 0) {
    for (const lec of lectures) {
      const sql = `INSERT INTO lectures (course_id, title, description, video_url, duration, "order") VALUES ($1, $2, $3, $4, $5, $6)`;
      await query(sql, [courseId, lec.title, lec.description, lec.video_url, lec.duration, lec.order]);
    }
  }
  return true;
};

const getAll = async () => {
  const sql = `
            SELECT 
                c.id, c.title, c.slug, c.description, c.price, c.instructor_id, c.is_published, c.created_at, c.thumbnail_url, c.category, c.target_role, c.primary_skill,
                u.full_name as instructor_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            LEFT JOIN reviews r ON c.id = r.course_id
            WHERE c.is_published = true
            GROUP BY c.id, u.full_name
            ORDER BY c.created_at DESC
            LIMIT 50
        `;
  const {
    rows
  } = await query(sql);
  return rows;
};


const getActiveEnrollments = async (courseId) => {
    const { rows } = await query('SELECT user_id, expires_at FROM enrollments WHERE course_id = $1 AND expires_at >= NOW()', [courseId]);
    return rows;
};

const getCoursePrice = async (courseId) => {
    const { rows } = await query('SELECT price FROM courses WHERE id = $1', [courseId]);
    return rows.length > 0 ? rows[0].price : 0;
};

const issueRefund = async (userId, courseId, amount) => {
    await query('INSERT INTO refunds (user_id, course_id, amount, reason, status) VALUES ($1, $2, $3, $4, $5)', [userId, courseId, amount, 'Course deleted by admin', 'processed']);
    return true;
};

export const coursesRepository = {
  getAllAdmin,
  updatePublishStatus,
  getAllPublished,
  getBySlugOrId,
  checkEnrollment,
  getActiveEnrollments,
  getCoursePrice,
  issueRefund,
  create,
  update,
  removeCourse,
  checkInstructor,
  getUserRole,
  updateProgress,
  issueCertificate,
  getEnrollment,
  checkCertificate,
  deleteMultiple,
  updateLectures,
  getAll
};