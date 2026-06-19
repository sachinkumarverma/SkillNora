import { paymentsRepository } from './paymentsRepository.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const createRazorpayOrder = async (amount, currency, receipt, userId, courseId) => {
  const razor = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  const amt = Math.round(Number(amount) * 100);
  if (!amt || amt <= 0) throw new Error('Invalid amount');
  const options = {
    amount: amt,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
    notes: {}
  };
  const order = await razor.orders.create(options);
  try {
    await paymentsRepository.createOrder({
      razorpay_order_id: order.id,
      user_id: userId,
      course_id: courseId,
      amount,
      currency,
      status: 'created',
      receipt: options.receipt
    });
  } catch (e) {
    console.warn('Failed to persist order', e);
  }
  return order;
};

const verifyWebhook = async (raw, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) throw new Error('Razorpay secret not configured');
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (signature !== expected) throw new Error('Invalid signature');
  const event = JSON.parse(raw);
  const payment = event.payload?.payment?.entity;
  if (payment) {
    try {
      await paymentsRepository.updateOrder(payment.order_id, payment.status || 'unknown');
    } catch (e) {}
  }
  return true;
};

export const paymentsService = {
  createRazorpayOrder,
  verifyWebhook
};