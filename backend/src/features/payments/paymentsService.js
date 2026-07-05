import { paymentsRepository } from "./paymentsRepository.js";
import { enrollmentsService } from "../enrollments/enrollmentsService.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import { sendEmail, buildEmailHtml } from "../../utils/email.js";
import puppeteer from "puppeteer";
import { logger } from "../../utils/logger.js";

const createRazorpayOrder = async (
  amount,
  currency,
  receipt,
  userId,
  courseId,
) => {
  const razor = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const amt = Math.round(Number(amount) * 100);
  if (!amt || amt <= 0) throw new Error("Invalid amount");
  const options = {
    amount: amt,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
    notes: {},
  };
  const order = await razor.orders.create(options);
  try {
    await paymentsRepository.createOrder({
      razorpay_order_id: order.id,
      user_id: userId,
      course_id: courseId,
      amount,
      currency,
      status: "created",
      receipt: options.receipt,
    });
  } catch (e) {
    console.warn("Failed to persist order", e);
  }
  return order;
};

const verifyWebhook = async (raw, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) throw new Error("Razorpay secret not configured");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("hex");
  if (signature !== expected) throw new Error("Invalid signature");
  const event = JSON.parse(raw);
  const payment = event.payload?.payment?.entity;
  if (payment) {
    try {
      const order = await paymentsRepository.updateOrder(
        payment.order_id,
        payment.status || "unknown",
        payment.id
      );

      // If payment is successful, send the receipt email
      if (payment.status === "captured" || payment.status === "paid") {
        if (order && order.user_id && order.course_id) {
          await enrollmentsService.forceCreateEnrollment(
            order.user_id,
            order.course_id,
          );
          logger.info(
            `Successfully enrolled User ${order.user_id} in Course ${order.course_id} via Webhook.`,
          );
        }

        const details = await paymentsRepository.getOrderDetailsWithEmail(
          payment.order_id,
        );

      } else if (payment.status === "failed") {
        const details = await paymentsRepository.getOrderDetailsWithEmail(
          payment.order_id,
        );
        if (details && details.email) {
          const formattedAmount = Number(details.amount).toLocaleString(
            "en-IN",
          );
          await sendEmail({
            to: details.email,
            subject: `Payment Failed: ${details.course_title}`,
            html: buildEmailHtml(
              `
              <p style="margin: 0 0 20px; color: #334155; font-size: 16px; line-height: 1.6;">Hi <strong>${details.full_name || "Student"}</strong>,</p>
              <p style="margin: 0 0 32px; color: #334155; font-size: 16px; line-height: 1.6;">Unfortunately, your payment of <strong>₹${formattedAmount}</strong> for <strong>${details.course_title}</strong> was not successful.</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: bold;">Error Details</p>
                <p style="margin: 0; color: #7f1d1d; font-size: 15px;">${payment.error_description || "Your bank declined the transaction or it timed out."}</p>
              </div>
              
              <p style="margin: 32px 0 0; color: #334155; font-size: 16px; line-height: 1.6;">No charges have been made. You can try completing your purchase again from the course page using a different payment method.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
                  <tr>
                      <td align="center">
                          <a href="${process.env.FRONTEND_URL || "https://skillnora.vercel.app"}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">Try Again</a>
                      </td>
                  </tr>
              </table>
            `,
              "Payment Failed",
              "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
            ),
          });
        }
      }
    } catch (e) {
      logger.error("Failed to process webhook email/PDF:", e);
    }
  }
};

const initiateRefund = async (paymentId, amount) => {
  if (!paymentId) return null;
  const razor = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const amt = Math.round(Number(amount) * 100);
  try {
    const refund = await razor.payments.refund(paymentId, { amount: amt });
    return refund;
  } catch (err) {
    logger.error("Failed to initiate Razorpay refund", err);
    throw err;
  }
};

export const paymentsService = {
  createRazorpayOrder,
  verifyWebhook,
  initiateRefund,
};
