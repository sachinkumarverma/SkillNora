import { statisticsRepository } from "./statisticsRepository.js";

const getDashboardStats = async (userId, role) => {
  const raw = await statisticsRepository.getStats(userId, role);

  if (raw.isAdmin) {
    const totalRevenue = raw.orders.reduce(
      (sum, order) => {
        const amount = Number(order.amount || 0);
        if (['paid', 'success', 'captured'].includes(order.status)) {
          return sum + amount;
        }
        if (order.status === 'refunded') {
          return sum - amount;
        }
        return sum;
      },
      0
    );
    return {
      isAdmin: true,
      totalRevenue,
      activeStudents: raw.activeStudents,
      publishedCourses: raw.publishedCourses,
      recentTransactions: raw.orders.slice(0, 10), // Give up to 10 recent
      activityData: {
        revenue: raw.orders.map((o) => ({
          amount: o.amount,
          status: o.status,
          created_at: o.created_at,
        })),
        enrollments: raw.enrollments.map((e) => e.created_at),
      },
    };
  }

  return {
    isAdmin: false,
    totalEnrolled: raw.enrollments.length,
    completedCourses: raw.certificates.length,
    createdCourses: raw.courses.length,
    totalWishlisted: raw.wishlist.length,
    totalNotes: raw.notes.length,
    totalTests: raw.testAttempts?.length || 0,
    quizScores: raw.quizScores,
    testAttempts: raw.testAttempts,
    activityData: {
      enrollments: raw.enrollments.map((e) => e.created_at),
      certificates: raw.certificates.map((c) => c.created_at),
      wishlist: raw.wishlist.map((w) => w.created_at),
      notes: raw.notes.map((n) => n.created_at),
      tests: raw.testAttempts?.map((a) => a.created_at) || [],
    },
  };
};

export const statisticsService = {
  getDashboardStats,
};
