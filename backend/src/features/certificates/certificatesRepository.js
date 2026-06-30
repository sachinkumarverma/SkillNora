import { query } from '../../config/db.js';

const getCertificatesByUserId = async userId => {
  const sql = `
            SELECT c.id as db_id, c.issued_at, c.verification_code, c.course_id,
                   co.title as course_title, co.slug as course_slug,
                   u.full_name as student_name
            FROM certificates c
            LEFT JOIN courses co ON c.course_id = co.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.user_id = $1
        `;

  const { rows } = await query(sql, [userId]);

  return rows.map(r => ({
    id: r.db_id,
    date: r.issued_at,
    issued_at: r.issued_at,
    verification_code: r.verification_code,
    course_id: r.course_id,
    courseTitle: r.course_title,
    studentName: r.student_name,
    courses: {
      title: r.course_title,
      slug: r.course_slug
    }
  }));
};

const getCertificateByCode = async code => {
  const sql = `
            SELECT c.id as db_id, c.issued_at, c.verification_code, c.course_id,
                   co.title as course_title, co.slug as course_slug,
                   u.full_name, u.email
            FROM certificates c
            LEFT JOIN courses co ON c.course_id = co.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.verification_code = $1
            LIMIT 1
        `;
        
  const { rows } = await query(sql, [code]);

  if (rows.length === 0) return null;
  
  const r = rows[0];
  return {
    id: r.db_id,
    issued_at: r.issued_at,
    verification_code: r.verification_code,
    course_id: r.course_id,
    courses: {
      title: r.course_title,
      slug: r.course_slug
    },
    users: {
      full_name: r.full_name,
      email: r.email
    }
  };
};

export const certificatesRepository = {
  getCertificatesByUserId,
  getCertificateByCode
};