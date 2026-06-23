import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Configure standard transporter (use valid SMTP in .env for production)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const buildEmailHtml = (content, title = 'Skillnora Notification', gradient = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    <!-- Premium Header Banner -->
                    <tr>
                        <td style="background-color: #1e3a8a; background: ${gradient}; padding: 40px 40px 35px; text-align: center;">
                            <div style="background-color: #ffffff; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 24px; padding: 12px; box-sizing: border-box; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                                <img src="https://skillnora.vercel.app/logo.png" alt="Skillnora" style="width: 100%; height: 100%; object-fit: contain;">
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
                        </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                </table>
                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
                    <tr>
                        <td style="padding: 24px 0; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                            &copy; ${new Date().getFullYear()} Skillnora. All rights reserved.<br>
                            Empowering your career, one skill at a time.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: '"Skillnora Support" <sachinv1410@gmail.com>',
            to,
            subject,
            html,
        });
        logger.info('Email sent: %s', info.messageId);
        
        // If using Ethereal email (fallback testing), you can view it here:
        if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
            logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error sending email:', error);
        return { success: false, error };
    }
};
