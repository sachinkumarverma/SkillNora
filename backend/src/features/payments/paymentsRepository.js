import { query } from "../../config/db.js";

const createOrder = async (data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO orders (${keys.join(", ")}) VALUES (${placeholders})`;
  await query(sql, values);
  return true;
};

const updateOrder = async (orderId, status) => {
  const sql = `UPDATE orders SET status = $1 WHERE razorpay_order_id = $2 RETURNING *`;
  const res = await query(sql, [status, orderId]);
  return res.rows[0];
};

const getOrderDetailsWithEmail = async (orderId) => {
  const sql = `
    SELECT 
      o.amount, o.currency, o.receipt, 
      u.email, u.full_name, 
      c.title as course_title
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN courses c ON o.course_id = c.id
    WHERE o.razorpay_order_id = $1
  `;
  const res = await query(sql, [orderId]);
  return res.rows[0];
};

export const paymentsRepository = {
  createOrder,
  updateOrder,
  getOrderDetailsWithEmail,
};
