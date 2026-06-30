import { query, supabaseServer } from '../../config/db.js';

const getAllAdmin = async (instructorId = null) => {
  const params = [];
  let whereClause = '';
  if (instructorId) {
      whereClause = 'WHERE c.instructor_id = $1';
      params.push(instructorId);
  }
  const sql = `
    SELECT 
      c.*, 
      u.full_name as instructor_name, 
      u.email as instructor_email,
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
    FROM courses c 
    LEFT JOIN users u ON c.instructor_id = u.id 
    ${whereClause}
    ORDER BY created_at DESC
  `;
  const {
    rows
  } = await query(sql, params);
  return rows.map(r => ({
    ...r,
    instructor: {
      full_name: r.instructor_name,
      email: r.instructor_email
    }
  }));
};

const getUniqueStudentsCount = async (instructorId = null) => {
  const params = [];
  let whereClause = '';
  if (instructorId) {
      whereClause = 'WHERE c.instructor_id = $1';
      params.push(instructorId);
  }
  const sql = `
    SELECT COUNT(DISTINCT e.user_id) as count
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    ${whereClause}
  `;
  const { rows } = await query(sql, params);
  return parseInt(rows[0].count) || 0;
};

const getInstructorTransactions = async (instructorId = null) => {
  const params = [];
  let whereClause = '';
  if (instructorId) {
      whereClause = 'WHERE c.instructor_id = $1';
      params.push(instructorId);
  }
  const sql = `
      SELECT 
          o.id as id,
          o.razorpay_order_id as transaction_id,
          o.amount,
          o.status,
          o.created_at as date,
          u.full_name as user_name,
          c.title as course_title
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      JOIN courses c ON o.course_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC
  `;
  const { rows } = await query(sql, params);
  return rows.map(r => ({
      ...r,
      amount: parseInt(r.amount),
      date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  }));
};

const updatePublishStatus = async (ids, status) => {
  if (!ids || ids.length === 0) return true;
  const placeholders = ids.map((_, i) => '$' + (i + 3)).join(',');
  const sql = `UPDATE courses SET is_published = $1, is_archived = $2 WHERE id IN (${placeholders})`;
  await query(sql, [status, !status, ...ids]);
  return true;
};

const getAllPublished = async () => {
  const sql = `
            SELECT 
                c.id, c.title, c.slug, c.description, c.price, c.discount_price, c.instructor_id, c.is_published, c.created_at, c.thumbnail_url, c.category, c.target_role, c.primary_skill, c.is_free, c.certificate_type, c.provide_certificate,
                u.full_name as instructor_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                (SELECT COUNT(*) FROM lectures l WHERE l.course_id = c.id) as lectures_count,
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
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

  const sorted = [...rows].sort((a, b) => parseInt(b.enrollment_count || 0) - parseInt(a.enrollment_count || 0));
  const topIds = sorted.slice(0, 3).filter(c => parseInt(c.enrollment_count || 0) > 0).map(c => c.id);

  return rows.map(r => ({
    ...r,
    bestseller: topIds.includes(r.id)
  }));
};

const getBySlugOrId = async identifier => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
  const courseSql = isUuid 
    ? `SELECT c.*, u.full_name as instructor_name, u.avatar_url as instructor_avatar, COALESCE(AVG(r.rating), 0) as average_rating FROM courses c LEFT JOIN users u ON c.instructor_id = u.id LEFT JOIN reviews r ON c.id = r.course_id WHERE c.id = $1 GROUP BY c.id, u.full_name, u.avatar_url LIMIT 1` 
    : `SELECT c.*, u.full_name as instructor_name, u.avatar_url as instructor_avatar, COALESCE(AVG(r.rating), 0) as average_rating FROM courses c LEFT JOIN users u ON c.instructor_id = u.id LEFT JOIN reviews r ON c.id = r.course_id WHERE c.slug = $1 GROUP BY c.id, u.full_name, u.avatar_url LIMIT 1`;
  const {
    rows: cRows
  } = await query(courseSql, [identifier]);
  if (cRows.length === 0) return null;
  const course = cRows[0];
  const lecSql = `SELECT * FROM lectures WHERE course_id = $1 ORDER BY position ASC NULLS LAST, id ASC`;
  const {
    rows: lRows
  } = await query(lecSql, [course.id]);
  course.lectures = lRows;

  // Generate fresh signed URLs for Supabase-hosted videos (private bucket)
  for (const lec of course.lectures) {
    if (lec.video_url && lec.video_url.includes('/storage/v1/object/')) {
      try {
        // Extract the bucket and file path from the stored public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        const match = lec.video_url.match(/\/storage\/v1\/object\/(?:public\/)?([^/]+)\/(.+)/);
        if (match) {
          const bucket = match[1];
          const filePath = match[2];
          const { data: signedData, error: signedError } = await supabaseServer.storage
            .from(bucket)
            .createSignedUrl(filePath, 60 * 60 * 6); // 6 hour expiry
          if (!signedError && signedData?.signedUrl) {
            lec.video_url = signedData.signedUrl;
          }
        }
      } catch (e) {
        console.warn('Failed to generate signed video URL:', e.message);
      }
    }
  }
  
  const reviewsSql = `SELECT r.*, u.full_name, u.email FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1 ORDER BY r.created_at DESC`;
  const { rows: rRows } = await query(reviewsSql, [course.id]);
  course.reviews = rRows;
  
  course.instructor = {
    full_name: course.instructor_name,
    avatar_url: course.instructor_avatar
  };

  if (!course.instructor.avatar_url && course.instructor_id) {
    try {
      const { data: userData } = await supabaseServer.auth.admin.getUserById(course.instructor_id);
      if (userData?.user?.user_metadata) {
        course.instructor.avatar_url = userData.user.user_metadata.avatar_url || userData.user.user_metadata.picture || null;
      }
    } catch (e) {
      console.warn('Failed to fetch user metadata for instructor avatar', e);
    }
  }
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
  if (payload.attachments) payload.attachments = JSON.stringify(payload.attachments);
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
  if (payload.attachments) payload.attachments = JSON.stringify(payload.attachments);
  payload.updated_at = new Date().toISOString();
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
  const existingLecturesSql = `SELECT id FROM lectures WHERE course_id = $1`;
  const { rows: existingRows } = await query(existingLecturesSql, [courseId]);
  const existingIds = existingRows.map(r => r.id);
  
  const incomingIds = lectures.filter(l => l.id).map(l => l.id);
  
  // Delete lectures that are no longer present
  const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
  if (idsToDelete.length > 0) {
    const placeholders = idsToDelete.map((_, i) => '$' + (i + 1)).join(',');
    await query(`DELETE FROM lectures WHERE id IN (${placeholders})`, idsToDelete);
  }
  
  // Insert or Update remaining
  if (lectures && lectures.length > 0) {
    for (const lec of lectures) {
      if (lec.id && existingIds.includes(lec.id)) {
        const sql = `UPDATE lectures SET title = $1, video_url = $2, thumbnail_url = $3, position = $4, mcqs = $5, attachments = $6 WHERE id = $7 AND course_id = $8`;
        await query(sql, [lec.title, lec.video_url, lec.thumbnail_url, lec.position, JSON.stringify(lec.mcqs || []), JSON.stringify(lec.attachments || []), lec.id, courseId]);
      } else {
        const sql = `INSERT INTO lectures (course_id, title, video_url, thumbnail_url, position, mcqs, attachments) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        await query(sql, [courseId, lec.title, lec.video_url, lec.thumbnail_url, lec.position, JSON.stringify(lec.mcqs || []), JSON.stringify(lec.attachments || [])]);
      }
    }
  }
  return true;
};

const getAll = async () => {
  const sql = `
            SELECT 
                c.id, c.title, c.slug, c.description, c.price, c.discount_price, c.instructor_id, c.is_published, c.created_at, c.thumbnail_url, c.category, c.target_role, c.primary_skill, c.is_free, c.certificate_type, c.provide_certificate,
                u.full_name as instructor_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                (SELECT COUNT(*) FROM lectures l WHERE l.course_id = c.id) as lectures_count
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

const addReview = async (userId, courseId, rating, reviewText) => {
  const sql = `INSERT INTO reviews (user_id, course_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *`;
  const { rows } = await query(sql, [userId, courseId, rating, reviewText]);
  return rows[0];
};

const updateReview = async (userId, reviewId, rating, reviewText) => {
  const sql = `UPDATE reviews SET rating = $1, review_text = $2 WHERE id = $3 AND user_id = $4 RETURNING *`;
  const { rows } = await query(sql, [rating, reviewText, reviewId, userId]);
  return rows[0];
};

export const coursesRepository = {
  getAllAdmin,
  getUniqueStudentsCount,
  getInstructorTransactions,
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
  getAll,
  addReview,
  updateReview
};