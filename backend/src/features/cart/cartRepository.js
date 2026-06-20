import { query } from '../../config/db.js';

const getCart = async (userId) => {
  const { rows } = await query(`
    SELECT c.* FROM courses c
    JOIN cart_items ci ON c.id = ci.course_id
    WHERE ci.user_id = $1
  `, [userId]);
  return rows;
};

const addToCart = async (userId, courseId) => {
  await query(`INSERT INTO cart_items (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, courseId]);
  return await getCart(userId);
};

const removeFromCart = async (userId, courseId) => {
  await query(`DELETE FROM cart_items WHERE user_id = $1 AND course_id = $2`, [userId, courseId]);
  return await getCart(userId);
};

const clearCart = async (userId) => {
  await query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
};

export const cartRepository = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
