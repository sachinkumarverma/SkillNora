import { adminRepository } from "./adminRepository.js";

const getStudents = async () => adminRepository.getStudents();
const getPayments = async () => adminRepository.getPayments();
const getEnrollments = async () => adminRepository.getEnrollments();
const getCertificates = async () => adminRepository.getCertificates();
const getInstructors = async () => adminRepository.getInstructors();
const getReviews = async () => adminRepository.getReviews();
const getNotifications = async () => adminRepository.getNotifications();
const getCategories = async () => adminRepository.getCategories();
const getAuditLogs = async () => adminRepository.getAuditLogs();

export const adminService = {
  getStudents,
  getPayments,
  getEnrollments,
  getCertificates,
  getInstructors,
  getReviews,
  getNotifications,
  getCategories,
  getAuditLogs,
};
