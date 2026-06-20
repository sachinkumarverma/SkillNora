import { coursesRepository } from './coursesRepository.js';

const listAdminCourses = async userId => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') throw new Error('Forbidden');
  return await coursesRepository.getAllAdmin();
};

const bulkPublish = async (userId, ids, status) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') throw new Error('Forbidden');
  return await coursesRepository.updatePublishStatus(ids, status);
};

const bulkDelete = async (userId, ids) => {
  const role = await coursesRepository.getUserRole(userId);
  if (role !== 'admin') throw new Error('Forbidden');
  return await coursesRepository.deleteMultiple(ids);
};

const updateLectures = async (userId, courseId, lectures) => {
  const instructorId = await coursesRepository.checkInstructor(courseId);
  if (instructorId !== userId) throw new Error('Forbidden');
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
  return await coursesRepository.create({
    ...payload,
    instructor_id: userId
  });
};

const updateCourse = async (userId, courseId, payload) => {
  const instructorId = await coursesRepository.checkInstructor(courseId);
  if (instructorId !== userId) throw new Error('Forbidden');
  return await coursesRepository.update(courseId, payload);
};

const deleteCourse = async (userId, courseId) => {
  const instructorId = await coursesRepository.checkInstructor(courseId);
  if (instructorId !== userId) throw new Error('Forbidden');
  return await coursesRepository.delete(courseId);
};

const completeLecture = async (userId, courseId, slug, lectureId, totalLectures) => {
  const isCertified = await coursesRepository.checkCertificate(userId, courseId);
  let certUnlocked = isCertified;
  const enrollment = await coursesRepository.getEnrollment(userId, courseId);
  if (enrollment) {
    const prog = enrollment.progress || {};
    if (!prog[slug]) prog[slug] = [];
    if (!prog[slug].includes(String(lectureId))) {
      prog[slug].push(String(lectureId));
      await coursesRepository.updateProgress(userId, courseId, prog);
    }
    if (!isCertified && prog[slug].length >= totalLectures) {
      const crypto = await import('crypto');
      await coursesRepository.issueCertificate(userId, courseId, crypto.randomUUID().slice(0, 8).toUpperCase());
      certUnlocked = true;
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
  completeLecture
};