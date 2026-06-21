import { statisticsRepository } from './statisticsRepository.js';

const getDashboardStats = async (userId, role) => {
  const raw = await statisticsRepository.getStats(userId, role);
  return {
    totalEnrolled: raw.enrollments.length,
    completedCourses: raw.certificates.length,
    createdCourses: raw.courses.length,
    totalWishlisted: raw.wishlist.length,
    totalNotes: raw.notes.length,
    activityData: {
      enrollments: raw.enrollments.map(e => e.created_at),
      certificates: raw.certificates.map(c => c.created_at),
      wishlist: raw.wishlist.map(w => w.created_at),
      notes: raw.notes.map(n => n.created_at)
    }
  };
};

export const statisticsService = {
  getDashboardStats
};