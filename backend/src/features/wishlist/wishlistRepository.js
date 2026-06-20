import { query } from '../../config/db.js';

const getWishlist = async (userId) => {
  const { rows } = await query(`
    SELECT course_id FROM wishlist_items
    WHERE user_id = $1
  `, [userId]);
  return rows.map(r => r.course_id);
};

const addToWishlist = async (userId, courseId) => {
  await query(`INSERT INTO wishlist_items (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, courseId]);
  return await getWishlist(userId);
};

const removeFromWishlist = async (userId, courseId) => {
  await query(`DELETE FROM wishlist_items WHERE user_id = $1 AND course_id = $2`, [userId, courseId]);
  return await getWishlist(userId);
};

export const wishlistRepository = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
