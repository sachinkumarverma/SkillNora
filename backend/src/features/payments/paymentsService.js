import { paymentsRepository } from './paymentsRepository.js';
import { enrollmentsService } from '../enrollments/enrollmentsService.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendEmail, buildEmailHtml } from '../../utils/email.js';
import puppeteer from 'puppeteer';
import { logger } from '../../utils/logger.js';

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
        if (order && order.user_id && order.course_id) {
            await enrollmentsService.forceCreateEnrollment(order.user_id, order.course_id);
            logger.info(`Successfully enrolled User ${order.user_id} in Course ${order.course_id} via Webhook.`);
        }
        
        const details = await paymentsRepository.getOrderDetailsWithEmail(payment.order_id);
        
        if (details && details.email) {
          const formattedAmount = Number(details.amount).toLocaleString('en-IN');
          
          // Generate Beautiful PDF Invoice Asynchronously
          logger.info(`Starting PDF generation for Webhook Order ID: ${payment.order_id}...`);
          let pdfBuffer = null;
          try {
              const htmlReceipt = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; }
                            .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; box-sizing: border-box; }
                            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                            .title { font-size: 36px; font-weight: bold; color: #113a5f; margin: 0; }
                            .logo-section { text-align: right; }
                            .logo-text { font-size: 28px; font-weight: bold; color: #113a5f; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
                            .dark-bar { background-color: #113a5f; color: #fff; padding: 15px 30px; display: flex; justify-content: flex-start; gap: 40px; }
                            .dark-bar p { margin: 0; font-size: 14px; }
                            .dotted-line { border-bottom: 2px dotted #ccc; margin: 20px 0; }
                            .billing-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .billing-section { width: 45%; }
                            .section-title { font-size: 18px; font-weight: bold; color: #113a5f; margin-bottom: 10px; }
                            .info-text { font-size: 12px; line-height: 1.6; margin: 0; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th { background-color: #54b7ae; color: #fff; padding: 12px; text-align: left; font-size: 14px; }
                            td { padding: 12px; font-size: 14px; border-bottom: 1px solid #eee; }
                            tr:nth-child(even) { background-color: #f8fafc; }
                            .totals-table { width: 50%; margin-left: auto; border-collapse: collapse; }
                            .totals-table td { padding: 10px 12px; font-size: 14px; border: none; }
                            .totals-table tr { background-color: #113a5f; color: #fff; }
                            .totals-table tr:not(:last-child) { border-bottom: 1px solid #2a5a87; }
                            .totals-table tr.grand-total { font-weight: bold; }
                            .footer-row { display: flex; justify-content: space-between; margin-top: 40px; }
                            .terms { font-size: 12px; line-height: 1.6; padding-left: 20px; }
                            .terms li { margin-bottom: 5px; }
                            .signature-section { text-align: right; margin-top: 20px; }
                            .signature { margin-bottom: 5px; color: #aaa; font-family: 'Brush Script MT', cursive; font-size: 24px; }
                            .bottom-bar { background-color: #113a5f; color: #fff; padding: 15px; display: flex; justify-content: space-between; font-size: 12px; margin-top: 40px; }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-container">
                            <div class="header">
                                <h1 class="title">Invoice Receipt</h1>
                                <div class="logo-section">
                                    <div class="logo-text">
                                        <span style="background: #113a5f; color: #fff; padding: 5px 10px; border-radius: 5px;">S</span>
                                        Skillnora
                                    </div>
                                </div>
                            </div>
                            
                            <div class="dark-bar">
                                <div><strong>Invoice Number:</strong> ${payment.order_id}</div>
                                <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            
                            <div class="dotted-line"></div>
                            
                            <div class="billing-row">
                                <div class="billing-section">
                                    <div class="section-title">Billing Information:</div>
                                    <p class="info-text">
                                        <strong>Company Name:</strong> Skillnora Inc.<br>
                                        <strong>Email:</strong> support@skillnora.com<br>
                                        <strong>Website:</strong> www.skillnora.com
                                    </p>
                                </div>
                                <div class="billing-section">
                                    <div class="section-title">Bill To:</div>
                                    <p class="info-text">
                                        <strong>Customer Name:</strong> ${details.full_name || 'Learner'}<br>
                                        <strong>Email:</strong> ${details.email}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="section-title">Course Details:</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Item Description</th>
                                        <th>Access</th>
                                        <th>Rate/Unit</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Course: ${details.course_title}</td>
                                        <td>Lifetime Access</td>
                                        <td>₹${formattedAmount}</td>
                                        <td>₹${formattedAmount}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <table class="totals-table">
                                <tr>
                                    <td>Subtotal</td>
                                    <td style="text-align: right;">₹${formattedAmount}</td>
                                </tr>
                                <tr class="grand-total">
                                    <td>Total Amount Paid</td>
                                    <td style="text-align: right;">₹${formattedAmount}</td>
                                </tr>
                            </table>
                            
                            <div class="footer-row">
                                <div class="billing-section">
                                    <div class="section-title">Payment Information:</div>
                                    <p class="info-text">
                                        <strong>Payment Method:</strong> Razorpay Gateway<br>
                                        <strong>Status:</strong> Paid successfully
                                    </p>
                                </div>
                                <div class="billing-section">
                                    <div class="section-title">Terms and Conditions:</div>
                                    <ul class="terms">
                                        <li>Thank you for choosing Skillnora!</li>
                                        <li>You can cancel any course within 30 days to get a partial refund.</li>
                                        <li>The refund amount will be calculated by deducting the amount for the number of days you consumed the course out of 365 days.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="signature-section">
                                <div class="info-text">Date : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                <div class="signature">Skillnora</div>
                                <div class="info-text" style="border-top: 1px solid #333; display: inline-block; padding-top: 5px; width: 150px; text-align: center;">Skillnora Inc.</div>
                            </div>
                            
                            <div class="bottom-bar">
                                <div>support@skillnora.com</div>
                                <div>www.skillnora.com</div>
                            </div>
                        </div>
                    </body>
                    </html>
              `;
              const browser = await puppeteer.launch({ 
                  headless: true,
                  timeout: 15000, 
                  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'] 
              });
              const page = await browser.newPage();
              await page.setContent(htmlReceipt, { waitUntil: 'domcontentloaded' });
              pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
              await browser.close();
              logger.info(`PDF generated successfully for Webhook Order ID: ${payment.order_id}.`);
          } catch (pdfErr) {
              logger.error('Failed to generate PDF in webhook:', pdfErr);
          }

          const attachments = pdfBuffer ? [{
              filename: `Receipt_${payment.order_id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
          }] : undefined;

          await sendEmail({
            to: details.email,
            subject: `🎉 Congratulations on your Skillnora enrollment! (Receipt Attached)`,
            attachments,
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
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">Your official PDF receipt is attached to this email.</p>
              
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