import { enrollmentsRepository } from './enrollmentsRepository.js';

const enrollUser = async (userId, courseId) => {
  const price = await enrollmentsRepository.getCoursePrice(courseId);
  if (Number(price) !== 0) throw new Error('Paid enrollments should use payments flow');
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return await enrollmentsRepository.enroll(userId, courseId, expiryDate.toISOString());
};

const forceEnroll = async (userId, courseId) => {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return await enrollmentsRepository.enroll(userId, courseId, expiryDate.toISOString());
};

const getMyEnrollments = async userId => {
  const enrollments = await enrollmentsRepository.getMyEnrollments(userId);
  return enrollments.map(e => e.course_id);
};

export const enrollmentsService = {
  enrollUser,
  forceEnroll,
  getMyEnrollments
};