import { enrollmentsRepository } from './enrollmentsRepository.js';

const enrollUser = async (userId, courseId) => {
  const price = await enrollmentsRepository.getCoursePrice(courseId);
  if (Number(price) !== 0) throw new Error('Paid enrollments should use payments flow');
  return await enrollmentsRepository.enroll(userId, courseId);
};

const forceEnroll = async (userId, courseId) => {
  return await enrollmentsRepository.enroll(userId, courseId);
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