import { adminService } from './adminService.js';
import { logger } from '../../utils/logger.js';

const getStudents = async (req, res) => {
    try {
        const data = await adminService.getStudents();
        res.json({ students: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPayments = async (req, res) => {
    try {
        const data = await adminService.getPayments();
        res.json({ payments: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getEnrollments = async (req, res) => {
    try {
        const data = await adminService.getEnrollments();
        res.json({ enrollments: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCertificates = async (req, res) => {
    try {
        const data = await adminService.getCertificates();
        res.json({ certificates: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getInstructors = async (req, res) => {
    try {
        const instructors = await adminService.getInstructors();
        res.json({ instructors });
    } catch (err) {
        logger.error('Error in getInstructors:', err);
        res.status(500).json({ error: err.message });
    }
};

const getReviews = async (req, res) => {
    try {
        const reviews = await adminService.getReviews();
        res.json({ reviews });
    } catch (err) {
        logger.error('Error in getReviews:', err);
        res.status(500).json({ error: err.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await adminService.getNotifications();
        res.json({ notifications });
    } catch (err) {
        logger.error('Error in getNotifications:', err);
        res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await adminService.getCategories();
        res.json({ categories });
    } catch (err) {
        logger.error('Error in getCategories:', err);
        res.status(500).json({ error: err.message });
    }
};

export const adminController = {
    getStudents,
    getPayments,
    getEnrollments,
    getCertificates,
    getInstructors,
    getReviews,
    getNotifications,
    getCategories
};
