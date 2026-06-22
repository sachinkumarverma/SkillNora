import { paymentsRepository } from './paymentsRepository.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendEmail, buildEmailHtml } from '../../utils/email.js';

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
      const order = await paymentsRepository.updateOrder(payment.order_id, payment.status || 'unknown');
      
      // If payment is successful, send the receipt email
      if (payment.status === 'captured' || payment.status === 'paid') {
        const details = await paymentsRepository.getOrderDetailsWithEmail(payment.order_id);
        
        if (details && details.email) {
          const formattedAmount = Number(details.amount).toLocaleString('en-IN');
          await sendEmail({
            to: details.email,
            subject: `Payment Receipt: ${details.course_title}`,
            html: buildEmailHtml(`
              <p style="margin: 0 0 20px; color: #334155; font-size: 16px; line-height: 1.6;">Hi <strong>${details.full_name || 'Student'}</strong>,</p>
              <p style="margin: 0 0 32px; color: #334155; font-size: 16px; line-height: 1.6;">We've successfully received your payment for <strong>${details.course_title}</strong>.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Receipt Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Order ID</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${payment.order_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Transaction ID</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${payment.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Date().toLocaleDateString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 0 0; font-size: 16px; color: #0f172a;"><strong>Amount Paid</strong></td>
                    <td style="padding: 16px 0 0 0; font-size: 16px; color: #059669; text-align: right;"><strong>₹${formattedAmount}</strong></td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 32px 0 0; color: #334155; font-size: 16px; line-height: 1.6;">You can now access your course directly from your dashboard.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
                  <tr>
                      <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'https://skillnora.vercel.app'}/enrolled" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">Go to My Courses</a>
                      </td>
                  </tr>
              </table>
            `, 'Payment Receipt', 'linear-gradient(135deg, #065f46 0%, #10b981 100%)')
          });
        }
      } else if (payment.status === 'failed') {
        const details = await paymentsRepository.getOrderDetailsWithEmail(payment.order_id);
        if (details && details.email) {
          const formattedAmount = Number(details.amount).toLocaleString('en-IN');
          await sendEmail({
            to: details.email,
            subject: `Payment Failed: ${details.course_title}`,
            html: buildEmailHtml(`
              <p style="margin: 0 0 20px; color: #334155; font-size: 16px; line-height: 1.6;">Hi <strong>${details.full_name || 'Student'}</strong>,</p>
              <p style="margin: 0 0 32px; color: #334155; font-size: 16px; line-height: 1.6;">Unfortunately, your payment of <strong>₹${formattedAmount}</strong> for <strong>${details.course_title}</strong> was not successful.</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: bold;">Error Details</p>
                <p style="margin: 0; color: #7f1d1d; font-size: 15px;">${payment.error_description || 'Your bank declined the transaction or it timed out.'}</p>
              </div>
              
              <p style="margin: 32px 0 0; color: #334155; font-size: 16px; line-height: 1.6;">No charges have been made. You can try completing your purchase again from the course page using a different payment method.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
                  <tr>
                      <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'https://skillnora.vercel.app'}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">Try Again</a>
                      </td>
                  </tr>
              </table>
            `, 'Payment Failed', 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)')
          });
        }
      }
    } catch (e) {
      console.error('Webhook processing error:', e);
    }
  }
  return true;
};

export const paymentsService = {
  createRazorpayOrder,
  verifyWebhook
};