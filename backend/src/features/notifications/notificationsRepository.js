import { query } from "../../config/db.js";

const insertNotification = async (payload) => {
  const { user_id, title, message, type, link } = payload;
  const sql = `
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
  const { rows } = await query(sql, [user_id, title, message, type, link]);
  return rows[0];
};

const findNotificationsByUserId = async (userId) => {
  const sql = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    `;
  const { rows } = await query(sql, [userId]);
  return rows;
};

const updateNotificationsAsRead = async (userId) => {
  const sql = `UPDATE notifications SET is_read = true WHERE user_id = $1`;
  await query(sql, [userId]);
  return true;
};

export const notificationsRepository = {
  insertNotification,
  findNotificationsByUserId,
  updateNotificationsAsRead,
};
