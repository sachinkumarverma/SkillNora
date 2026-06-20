import { notificationsRepository } from './notificationsRepository.js';

const addNotification = async (payload) => {
    if (!payload.user_id) return null;
    return await notificationsRepository.insertNotification(payload);
};

const getUserNotificationsList = async (userId) => {
    return await notificationsRepository.findNotificationsByUserId(userId);
};

const markAsRead = async (userId) => {
    return await notificationsRepository.updateNotificationsAsRead(userId);
};

export const notificationsService = {
    addNotification,
    getUserNotificationsList,
    markAsRead
};
