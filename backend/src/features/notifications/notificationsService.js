import { query } from '../../config/db.js';

const addNotification = async (payload) => {
    const { user_id, title, message, type, link } = payload;
    if (!user_id) return null;
    const sql = `
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const { rows } = await query(sql, [user_id, title, message, type, link]);
    return rows[0];
};

const getMyNotifications = async (userId) => {
    const sql = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    `;
    const { rows } = await query(sql, [userId]);
    return rows;
};

const markAsRead = async (userId) => {
    const sql = `UPDATE notifications SET is_read = true WHERE user_id = $1`;
    await query(sql, [userId]);
    return true;
};

export const notificationsService = {
    addNotification,
    getMyNotifications,
    markAsRead
};
