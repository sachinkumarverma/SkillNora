import { statisticsRepository } from './statisticsRepository.js';

const getDashboardStats = async (userId, role) => {
  const raw = await statisticsRepository.getStats(userId, role);
  return {
    totalEnrolled: raw.enrollments.length,
    completedCourses: raw.certificates.length,
    createdCourses: raw.courses.length
  };
};

export const statisticsService = {
  getDashboardStats
};