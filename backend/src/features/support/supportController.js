import { logger } from '../../utils/logger.js';
import * as service from './supportService.js';
import { sendEmail, buildEmailHtml } from '../../utils/email.js';

export const createTicket = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        // if user is authenticated, req.user might exist. we can optionally attach it.
        const userId = req.user?.id || null;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        const ticket = await service.submitTicket({ userId, name, email, subject, message });
        res.status(201).json({ success: true, ticket });
    } catch (error) {
        logger.error('Create ticket error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit support ticket.' });
    }
};

export const getAdminTickets = async (req, res) => {
    try {
        const tickets = await service.getAdminTickets();
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        logger.error('Get admin tickets error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tickets.' });
    }
};

export const resolveTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminMessage } = req.body;
        
        const ticket = await service.resolveTicket(id, adminMessage);
        
        if (ticket && ticket.email && adminMessage) {
            await sendEmail({
                to: ticket.email,
                subject: `Resolved: ${ticket.subject}`,
                html: buildEmailHtml(`
                    <p style="margin: 0 0 20px; color: #334155; font-size: 16px; line-height: 1.6;">Hi <strong>${ticket.name || 'Student'}</strong>,</p>
                    <p style="margin: 0 0 32px; color: #334155; font-size: 16px; line-height: 1.6;">Your support ticket (<strong>#${ticket.id.substring(0,8)}</strong>) regarding "${ticket.subject}" has been reviewed and resolved by our team.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0;">
                        <p style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Resolution Message</p>
                        <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">${adminMessage}</p>
                    </div>
                    
                    <p style="color: #475569; margin-bottom: 24px; font-size: 16px; line-height: 1.6;">If you have any further questions or if the issue persists, please feel free to open a new ticket or reply to this email.</p>
                    <p style="color: #475569; font-weight: 500; font-size: 16px;">Best regards,<br><span style="color: #0f172a;">The Skillnora Team</span></p>
                `, 'Support Ticket Resolved', 'linear-gradient(135deg, #020617 0%, #334155 100%)')
            });
        }
        
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        logger.error('Resolve ticket error:', error);
        res.status(500).json({ success: false, error: 'Failed to resolve ticket.' });
    }
};
