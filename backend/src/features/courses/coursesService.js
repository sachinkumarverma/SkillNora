import { coursesRepository } from './coursesRepository.js';

const listAdminCourses = async userId => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin' && role !== 'instructor') throw new Error('Forbidden');
  
  const instructorId = role === 'instructor' ? userId : null;
  const courses = await coursesRepository.getAllAdmin(instructorId);
  const total_unique_students = await coursesRepository.getUniqueStudentsCount(instructorId);
  const recent_transactions = await coursesRepository.getInstructorTransactions(instructorId);
  
  return { courses, total_unique_students, recent_transactions };
};

const bulkPublish = async (userId, ids, status) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') {
      if (role !== 'instructor') throw new Error('Forbidden');
      for (const id of ids) {
          const instructorId = await coursesRepository.checkInstructor(id);
          if (instructorId !== userId) throw new Error('Forbidden');
      }
  }
  return await coursesRepository.updatePublishStatus(ids, status);
};

const bulkDelete = async (userId, ids) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') {
      if (role !== 'instructor') throw new Error('Forbidden');
      for (const id of ids) {
          const instructorId = await coursesRepository.checkInstructor(id);
          if (instructorId !== userId) throw new Error('Forbidden');
      }
  }
  return await coursesRepository.deleteMultiple(ids);
};

const updateLectures = async (userId, courseId, lectures) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') {
    const instructorId = await coursesRepository.checkInstructor(courseId);
    if (instructorId !== userId) throw new Error('Forbidden');
  }
  return await coursesRepository.updateLectures(courseId, lectures);
};

const listCourses = async () => {
  return await coursesRepository.getAll();
};

const getCourse = async (identifier, userId = null) => {
  const course = await coursesRepository.getBySlugOrId(identifier);
  if (!course) return null;
  let isEnrolled = false;
  if (userId) {
    isEnrolled = await coursesRepository.checkEnrollment(userId, course.id);
  }
  return {
    ...course,
    instructor_name: course.instructor?.full_name || 'Instructor',
    image: course.thumbnail_url,
    priceFormatted: `₹${course.price}`,
    isEnrolled: !!isEnrolled,
    progress: isEnrolled?.progress || {}
  };
};

const createCourse = async (userId, payload) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'instructor' && role !== 'admin') throw new Error('Only instructors can create courses');
  
  let finalInstructorId = userId;
  if (role === 'admin' && payload.instructor_id !== undefined) {
      finalInstructorId = payload.instructor_id;
  }

  return await coursesRepository.create({
    ...payload,
    instructor_id: finalInstructorId
  });
};

const updateCourse = async (userId, courseId, payload) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') {
    const instructorId = await coursesRepository.checkInstructor(courseId);
    if (instructorId !== userId) throw new Error('Forbidden');
  }
  return await coursesRepository.update(courseId, payload);
};

const deleteCourse = async (userId, courseId) => {
  const instructorId = await coursesRepository.checkInstructor(courseId);
  if (instructorId !== userId) throw new Error('Forbidden');
  return await coursesRepository.delete(courseId);
};

const completeLecture = async (userId, courseId, slug, lectureId, totalLectures, quizScore) => {
  const isCertified = await coursesRepository.checkCertificate(userId, courseId);
  let certUnlocked = isCertified;
  const enrollment = await coursesRepository.getEnrollment(userId, courseId);
  if (enrollment) {
    const prog = enrollment.progress || {};
    if (!prog[slug]) prog[slug] = [];
    if (!prog[slug].includes(String(lectureId))) {
      prog[slug].push(String(lectureId));
    }
    
    // Save quiz score if provided
    if (quizScore !== undefined && quizScore !== null) {
      if (!prog.quizScores) prog.quizScores = {};
      prog.quizScores[lectureId] = Math.max(prog.quizScores[lectureId] || 0, quizScore);
    }
    
    await coursesRepository.updateProgress(userId, courseId, prog);
    
    if (!isCertified && prog[slug].length >= totalLectures) {
      // Check if course provides certificate
      const courseCheckSql = `SELECT certificate_type FROM courses WHERE id = $1 LIMIT 1`;
      const { rows } = await (await import('../../config/db.js')).query(courseCheckSql, [courseId]);
      
      if (rows.length > 0 && rows[0].certificate_type) {
        const crypto = await import('crypto');
        await coursesRepository.issueCertificate(userId, courseId, crypto.randomUUID().slice(0, 8).toUpperCase());
        certUnlocked = true;
      }
    }
  }
  return {
    certUnlocked
  };
};

export const coursesService = {
  listAdminCourses,
  bulkPublish,
  bulkDelete,
  updateLectures,
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  completeLecture,
  addReview: async (userId, courseId, rating, reviewText) => {
    return await coursesRepository.addReview(userId, courseId, rating, reviewText);
  },
  updateReview: async (userId, reviewId, rating, reviewText) => {
    return await coursesRepository.updateReview(userId, reviewId, rating, reviewText);
  }
};