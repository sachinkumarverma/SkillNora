import { logger } from '../../utils/logger.js';
import { enrollmentsService } from './enrollmentsService.js';
import { supabaseServer, query } from '../../config/db.js';
import { enrollmentsRepository } from './enrollmentsRepository.js';
import { paymentsRepository } from '../payments/paymentsRepository.js';
import { paymentsService } from '../payments/paymentsService.js';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

const createEnrollment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
      error: 'Missing token'
    });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({
      error: 'Invalid token'
    });
    }
    if (!req.body.course_id) return res.status(400).json({
      error: 'course_id required'
    });

    // Allow force enroll from checkout flow (bypassing free check for now)
    await enrollmentsService.forceCreateEnrollment(userData.user.id, req.body.course_id);

    try {
      // Simulate Razorpay order insertion to update statistics
      const { rows } = await query('SELECT price FROM courses WHERE id = $1', [req.body.course_id]);
      const amount = rows.length > 0 ? rows[0].price : 0;
      
      await paymentsRepository.createOrder({
        razorpay_order_id: `sim_order_${Date.now()}`,
        user_id: userData.user.id,
        course_id: req.body.course_id,
        amount: amount,
        currency: 'INR',
        status: 'paid',
        receipt: `rcpt_${Date.now()}`
      });
    } catch (e) { 
      logger.error('Error in enrollmentsController.js:', e); 
      console.warn('Failed to simulate order', e);
    }

    res.json({
      success: true
    });
    
    // Asynchronous Mock Receipt Dispatch
    (async () => {
        try {
            const { rows } = await query('SELECT title, price FROM courses WHERE id = $1', [req.body.course_id]);
            const courseTitle = rows.length > 0 ? rows[0].title : 'Course';
            const amount = rows.length > 0 ? rows[0].price : 0;
            
            let fullName = 'Learner';
            const userRes = await query('SELECT full_name FROM users WHERE id = $1', [userData.user.id]);
            if (userRes.rows.length > 0 && userRes.rows[0].full_name) {
                fullName = userRes.rows[0].full_name;
            } else if (userData.user.user_metadata?.full_name) {
                fullName = userData.user.user_metadata.full_name;
            }
            
            const orderId = `sim_order_${Date.now()}`;
            const formattedAmount = Number(amount).toLocaleString('en-IN');
            
            logger.info(`Starting PDF generation for Mock Purchase Order ID: ${orderId}...`);
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
                                <div><strong>Invoice Number:</strong> ${orderId}</div>
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
                                        <strong>Customer Name:</strong> ${fullName}<br>
                                        <strong>Email:</strong> ${userData.user.email}
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
                                        <td>Course: ${courseTitle}</td>
                                        <td>1 Year Access</td>
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
                                        <strong>Payment Method:</strong> Mock Gateway<br>
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
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
            await browser.close();
            logger.info(`PDF generated successfully for Mock Purchase Order ID: ${orderId}. Preparing email...`);
            
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
                port: process.env.SMTP_PORT || 587,
                secure: false, 
                auth: { 
                    user: process.env.SMTP_USER, 
                    pass: process.env.SMTP_PASS 
                },
            });
            
            const beautifulEmail = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #2563eb; margin: 0;">Congratulations! 🎉</h1>
                    </div>
                    <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px;">
                        <h2 style="margin-top: 0;">Welcome to your new learning journey!</h2>
                        <p style="font-size: 16px; line-height: 1.5;">We are thrilled to have you on board. Your payment of <strong>₹${formattedAmount}</strong> was successful, and you now have 1-year access to <strong>${courseTitle}</strong>.</p>
                        <p style="font-size: 16px; line-height: 1.5;">Dive right in and start learning at your own pace. If you have any questions, our support team is always here to help.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to My Courses</a>
                        </div>
                    </div>
                    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">Your official PDF receipt is attached to this email.</p>
                </div>
            `;
            
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Skillnora Billing" <sachinv1410@gmail.com>',
                to: userData.user.email,
                subject: "🎉 Congratulations on your Skillnora enrollment! (Receipt Attached)",
                html: beautifulEmail,
                attachments: [{
                    filename: `Receipt_${orderId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
            });
            logger.info("Mock Purchase receipt email sent! Message ID: %s", info.messageId);
        } catch (e) {
            logger.error('Failed to generate mock purchase PDF/email:', e);
        }
    })();
  } catch (err) { logger.error('Error in enrollmentsController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const getUserEnrollments = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
      error: 'Missing token'
    });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({
      error: 'Invalid token'
    });
    }
    const data = await enrollmentsService.getUserEnrollmentsList(userData.user.id);
    res.json({
      enrolledIds: data.enrolledIds,
      enrollments: data.enrollments,
      certificatesCount: data.certificatesCount
    });
  } catch (err) { logger.error('Error in enrollmentsController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

const cancelEnrollment = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
        const { data: userData } = await supabaseServer.auth.getUser(token);
        if (!userData.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
        
        // Fetch full_name from the users table
        let fullName = 'Learner';
        try {
            const userRes = await query('SELECT full_name FROM users WHERE id = $1', [userData.user.id]);
            if (userRes.rows.length > 0 && userRes.rows[0].full_name) {
                fullName = userRes.rows[0].full_name;
            } else if (userData.user.user_metadata?.full_name) {
                fullName = userData.user.user_metadata.full_name;
            }
        } catch (e) {
            console.error('Error fetching user full name:', e);
        }
        
        const courseId = req.body.course_id;
        const enrollment = await enrollmentsRepository.getEnrollment(userData.user.id, courseId);
        if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course' });
        
        // Calculate days passed
        const enrolledDate = new Date(enrollment.created_at || Date.now());
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - enrolledDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
            return res.status(400).json({ error: 'Cancellation only allowed within 30 days of purchase.' });
        }
        
        const orderRes = await query("SELECT amount, razorpay_payment_id FROM orders WHERE user_id = $1 AND course_id = $2 AND status IN ('paid', 'captured') LIMIT 1", [userData.user.id, courseId]);
        let actualPaidAmount = 0;
        let paymentId = null;
        if (orderRes.rows.length > 0) {
            actualPaidAmount = Number(orderRes.rows[0].amount);
            paymentId = orderRes.rows[0].razorpay_payment_id;
        } else {
            // Fallback for free courses or old mock data
            actualPaidAmount = Number(await enrollmentsRepository.getCoursePrice(courseId));
        }
        
        const originalPrice = actualPaidAmount;
        
        let refundAmount = originalPrice;
        let deductAmount = 0;
        if (originalPrice > 0) {
            const daysConsumed = diffDays;
            const consumedRatio = daysConsumed / 365;
            deductAmount = originalPrice * consumedRatio;
            refundAmount = originalPrice - deductAmount;
        }
        
        await enrollmentsRepository.deleteEnrollment(userData.user.id, courseId);
        
        // Do not update original order to cancelled so we preserve the paid revenue record.
        try {
            if (paymentId && refundAmount > 0) {
                try {
                    await paymentsService.initiateRefund(paymentId, refundAmount);
                    logger.info(`Successfully initiated real Razorpay refund of Rs ${refundAmount} for payment ${paymentId}`);
                } catch (refundErr) {
                    logger.error(`Razorpay API refund failed for ${paymentId}:`, refundErr);
                }
            }

            // Make a new entry in DB for the refunded amount (negative)
            const refundReceipt = `rfnd_${Date.now()}`;
            await query(`
                INSERT INTO orders (razorpay_order_id, user_id, course_id, amount, currency, status, receipt)
                VALUES ($1, $2, $3, $4, 'INR', 'refunded', $5)
            `, [`sim_refund_${Date.now()}`, userData.user.id, courseId, refundAmount, refundReceipt]);
        } catch (e) {
            console.error("Error creating refund entry:", e);
        }
        
        res.json({ success: true, refundAmount });
        
        // Run PDF and Email generation asynchronously so it doesn't block the frontend
        (async () => {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
                    port: process.env.SMTP_PORT || 587,
                    secure: false, 
                    auth: { 
                        user: process.env.SMTP_USER, 
                        pass: process.env.SMTP_PASS 
                    },
                });
                
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
                            th { background-color: #ef4444; color: #fff; padding: 12px; text-align: left; font-size: 14px; }
                            td { padding: 12px; font-size: 14px; border-bottom: 1px solid #eee; }
                            tr:nth-child(even) { background-color: #f8fafc; }
                            .totals-table { width: 50%; margin-left: auto; border-collapse: collapse; }
                            .totals-table td { padding: 10px 12px; font-size: 14px; border: none; }
                            .totals-table tr { background-color: #113a5f; color: #fff; }
                            .totals-table tr:not(:last-child) { border-bottom: 1px solid #2a5a87; }
                            .totals-table tr.grand-total { font-weight: bold; color: #4ade80; }
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
                                <h1 class="title">Refund Receipt</h1>
                                <div class="logo-section">
                                    <div class="logo-text">
                                        <span style="background: #113a5f; color: #fff; padding: 5px 10px; border-radius: 5px;">S</span>
                                        Skillnora
                                    </div>
                                </div>
                            </div>
                            
                            <div class="dark-bar">
                                <div><strong>Receipt Number:</strong> REF-${courseId.substring(0, 8).toUpperCase()}</div>
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            
                            <div class="dotted-line"></div>
                            
                            <div class="billing-row">
                                <div class="billing-section">
                                    <div class="section-title">Issued From:</div>
                                    <p class="info-text">
                                        <strong>Company Name:</strong> Skillnora Inc.<br>
                                        <strong>Email:</strong> support@skillnora.com<br>
                                        <strong>Website:</strong> www.skillnora.com
                                    </p>
                                </div>
                                <div class="billing-section">
                                    <div class="section-title">Refund To:</div>
                                    <p class="info-text">
                                        <strong>Customer Name:</strong> ${fullName}<br>
                                        <strong>Email:</strong> ${userData.user.email}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="section-title">Cancellation Details:</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item Description</th>
                                        <th>Days Consumed</th>
                                        <th>Amount Paid</th>
                                        <th>Amount Deducted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Course Cancellation (ID: ${courseId})</td>
                                        <td>${diffDays} / 365 Days</td>
                                        <td>₹${originalPrice.toFixed(2)}</td>
                                        <td>₹${deductAmount.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <table class="totals-table">
                                <tr>
                                    <td>Original Paid Amount</td>
                                    <td style="text-align: right;">₹${originalPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Deduction (Usage)</td>
                                    <td style="text-align: right;">-₹${deductAmount.toFixed(2)}</td>
                                </tr>
                                <tr class="grand-total">
                                    <td>Total Amount Refunded</td>
                                    <td style="text-align: right;">₹${refundAmount.toFixed(2)}</td>
                                </tr>
                            </table>
                            
                            <div class="footer-row">
                                <div class="billing-section">
                                    <div class="section-title">Refund Information:</div>
                                    <p class="info-text">
                                        <strong>Refund Method:</strong> Original Payment Source<br>
                                        <strong>Processing Time:</strong> 3-5 Business Days
                                    </p>
                                </div>
                                <div class="billing-section">
                                    <div class="section-title">Terms and Conditions:</div>
                                    <ul class="terms">
                                        <li>We're sorry to see you go!</li>
                                        <li>As per our partial refund policy, we have deducted the amount corresponding to the time period you consumed the course.</li>
                                        <li>The deducted amount is directly proportional to the number of days you accessed the content.</li>
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

                // Generate PDF
                logger.info(`Starting PDF generation for Cancellation Course ID: ${courseId}...`);
                const browser = await puppeteer.launch({ 
                    headless: true, 
                    timeout: 15000,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'] 
                });
                const page = await browser.newPage();
                await page.setContent(htmlReceipt, { waitUntil: 'domcontentloaded' });
                const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
                await browser.close();
                logger.info(`PDF generated successfully for Cancellation Course ID: ${courseId}. Preparing to send email...`);

                const beautifulEmail = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <div style="text-align: center; padding: 20px 0;">
                            <h1 style="color: #ef4444; margin: 0;">Course Cancelled</h1>
                        </div>
                        <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px;">
                            <h2 style="margin-top: 0;">Your enrollment has been successfully cancelled.</h2>
                            <p style="font-size: 16px; line-height: 1.5;">We're sorry to see you go! As per our 30-day partial refund policy, we have calculated your dynamic refund.</p>
                            <p style="font-size: 16px; line-height: 1.5;">Refund Amount: <strong>₹${refundAmount.toFixed(2)}</strong></p>
                            <p style="font-size: 14px; line-height: 1.5; color: #475569;">This amount will be credited back to your original payment method within 3-5 business days.</p>
                        </div>
                        <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">Your official PDF cancellation receipt is attached to this email.</p>
                    </div>
                `;

                const info = await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Skillnora Billing" <sachinv1410@gmail.com>',
                    to: userData.user.email,
                    subject: "Your Skillnora Course Cancellation & Refund (Receipt Attached)",
                    text: `You have successfully cancelled the course. Refund amount: ₹${refundAmount.toFixed(2)}. Please find your PDF receipt attached.`,
                    html: beautifulEmail,
                    attachments: [
                        {
                            filename: `Cancellation_${courseId}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
                logger.info("Cancellation email sent! Message ID: %s", info.messageId);
            } catch(emailErr) {
                logger.error("Failed to generate PDF or send email:", emailErr);
            }
        })();
    } catch (err) { logger.error('Error in enrollmentsController.js:', err); 
        res.status(500).json({ error: err.message });
    }
}

export const enrollmentsController = {
  createEnrollment,
  getUserEnrollments,
  cancelEnrollment
};