import { logger } from "../../utils/logger.js";
import { paymentsService } from "./paymentsService.js";
import { enrollmentsService } from "../enrollments/enrollmentsService.js";
import { paymentsRepository } from "./paymentsRepository.js";
import { supabaseServer, query } from "../../config/db.js";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import crypto from "crypto";

const createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      receipt,
      user_id = null,
      course_id = null,
    } = req.body;
    const order = await paymentsService.createRazorpayOrder(
      amount,
      currency,
      receipt,
      user_id,
      course_id,
    );
    res.json({
      order,
    });
  } catch (err) {
    logger.error("Error in paymentsController.js:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const webhook = async (req, res) => {
  try {
    await paymentsService.verifyWebhook(
      req.body,
      req.headers["x-razorpay-signature"] || "",
    );
    res.json({
      ok: true,
    });
  } catch (err) {
    logger.error("Error in paymentsController.js:", err);
    res.status(400).json({
      error: err.message,
    });
  }
};

const recordOrderAndEnroll = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const { data: userData } = await supabaseServer.auth.getUser(token);
    if (!userData.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    let fullName = "Learner";
    try {
      const userRes = await query("SELECT full_name FROM users WHERE id = $1", [
        userData.user.id,
      ]);
      if (userRes.rows.length > 0 && userRes.rows[0].full_name) {
        fullName = userRes.rows[0].full_name;
      } else if (userData.user.user_metadata?.full_name) {
        fullName = userData.user.user_metadata.full_name;
      }
    } catch (e) {
      console.error("Error fetching user full name:", e);
    }

    const { orderId, paymentId, signature, totalAmount, enrollments } = req.body;

    // Verify Razorpay signature securely
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");
      
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid payment signature. Payment verification failed." });
    }

    for (const item of enrollments) {
      await enrollmentsService.forceCreateEnrollment(
        userData.user.id,
        item.course_id,
      );
      await paymentsRepository.createOrder({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        user_id: userData.user.id,
        course_id: item.course_id,
        amount: item.price,
        currency: "INR",
        status: "paid",
        receipt: `rcpt_${Date.now()}`,
      });
    }

    res.json({ success: true });

    // Run PDF and Email generation asynchronously so it doesn't block the frontend
    (async () => {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
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
                                <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
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
                                    ${enrollments
                                      .map(
                                        (e, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>Course Enrollment (ID: ${e.course_id})</td>
                                        <td>1 Year Access</td>
                                        <td>₹${e.price}</td>
                                        <td>₹${e.price}</td>
                                    </tr>`,
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                            
                            <table class="totals-table">
                                <tr>
                                    <td>Subtotal</td>
                                    <td style="text-align: right;">₹${totalAmount}</td>
                                </tr>
                                <tr class="grand-total">
                                    <td>Total Amount Paid</td>
                                    <td style="text-align: right;">₹${totalAmount}</td>
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
                                <div class="info-text">Date : ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
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
        logger.info(`Starting PDF generation for Order ID: ${orderId}...`);
        let pdfBuffer = null;
        try {
          const browser = await puppeteer.launch({
            headless: true,
            timeout: 15000,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-zygote",
              "--single-process",
            ],
          });
          const page = await browser.newPage();
          await page.setContent(htmlReceipt, { waitUntil: "domcontentloaded" });
          pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
          });
          await browser.close();
          logger.info(
            `PDF generated successfully for Order ID: ${orderId}. Preparing to send email...`,
          );
        } catch (pdfErr) {
          logger.error("Failed to generate PDF in paymentsController:", pdfErr);
        }

        const beautifulEmail = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <div style="text-align: center; padding: 20px 0;">
                            <h1 style="color: #2563eb; margin: 0;">Congratulations! 🎉</h1>
                        </div>
                        <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px;">
                            <h2 style="margin-top: 0;">Welcome to your new learning journey!</h2>
                            <p style="font-size: 16px; line-height: 1.5;">We are thrilled to have you on board. Your payment of <strong>₹${totalAmount}</strong> was successful, and you now have full 1-year access to your enrolled courses.</p>
                            <p style="font-size: 16px; line-height: 1.5;">Dive right in and start learning at your own pace. If you have any questions, our support team is always here to help.</p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to My Courses</a>
                            </div>
                        </div>
                        <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">Your official PDF receipt is attached to this email.</p>
                    </div>
                `;

        const info = await transporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            '"Skillnora Billing" <sachinv1410@gmail.com>',
          to: userData.user.email,
          subject:
            "🎉 Congratulations on your Skillnora enrollment! (Receipt Attached)",
          text: `Thank you for your purchase. Total amount: ₹${totalAmount}. Please find your PDF receipt attached.`,
          html: beautifulEmail,
          attachments: pdfBuffer
            ? [
                {
                  filename: `Receipt_${orderId}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ]
            : undefined,
        });
        logger.info("Receipt email sent! Message ID: %s", info.messageId);
      } catch (emailErr) {
        logger.error("Failed to generate PDF or send email:", emailErr);
      }
    })();
  } catch (err) {
    logger.error("Error in paymentsController.js:", err);
    res.status(500).json({ error: err.message });
  }
};

export const paymentsController = {
  createOrder,
  webhook,
  recordOrderAndEnroll,
};
