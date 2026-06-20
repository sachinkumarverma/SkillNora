import { enrollmentsRepository } from './enrollmentsRepository.js';

const createEnrollment = async (userId, courseId) => {
  const price = await enrollmentsRepository.getCoursePrice(courseId);
  if (Number(price) !== 0) throw new Error('Paid enrollments should use payments flow');
  return await enrollmentsRepository.insertEnrollment(userId, courseId);
};

const forceCreateEnrollment = async (userId, courseId) => {
  return await enrollmentsRepository.insertEnrollment(userId, courseId);
};

const getUserEnrollmentsList = async userId => {
  const enrollments = await enrollmentsRepository.findEnrollmentsByUserId(userId);
  return enrollments.map(e => e.course_id);
};

export const enrollmentsService = {
  createEnrollment,
  forceCreateEnrollment,
  getUserEnrollmentsList
};