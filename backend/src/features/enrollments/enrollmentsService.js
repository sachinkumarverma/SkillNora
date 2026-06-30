import { enrollmentsRepository } from "./enrollmentsRepository.js";
import { query } from "../../config/db.js";

const createEnrollment = async (userId, courseId) => {
  const price = await enrollmentsRepository.getCoursePrice(courseId);
  if (Number(price) !== 0)
    throw new Error("Paid enrollments should use payments flow");
  return await enrollmentsRepository.insertEnrollment(userId, courseId);
};

const forceCreateEnrollment = async (userId, courseId) => {
  return await enrollmentsRepository.insertEnrollment(userId, courseId);
};

const getUserEnrollmentsList = async (userId) => {
  const enrollments =
    await enrollmentsRepository.findEnrollmentsByUserId(userId);
  const { rows } = await query(
    `SELECT COUNT(*) FROM certificates WHERE user_id = $1`,
    [userId],
  );
  return {
    enrolledIds: enrollments.map((e) => e.course_id),
    enrollments,
    certificatesCount: parseInt(rows[0].count, 10),
  };
};

export const enrollmentsService = {
  createEnrollment,
  forceCreateEnrollment,
  getUserEnrollmentsList,
};
