import { query } from '../../config/db.js';

const createOrder = async data => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders})`;
  await query(sql, values);
  return true;
};

const updateOrder = async (orderId, status) => {
  const sql = `UPDATE orders SET status = $1 WHERE razorpay_order_id = $2`;
  await query(sql, [status, orderId]);
  return true;
};

export const paymentsRepository = {
  createOrder,
  updateOrder
};