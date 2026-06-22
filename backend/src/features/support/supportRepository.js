import { query } from '../../config/db.js';

export const createTicket = async ({ userId, name, email, subject, message }) => {
    const text = `
        INSERT INTO support_tickets (user_id, name, email, subject, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [userId || null, name, email, subject, message];
    const res = await query(text, values);
    return res.rows[0];
};

export const getAdminTickets = async () => {
    const text = `
        SELECT 
            id,
            subject,
            name as user,
            email,
            priority,
            status,
            created_at,
            TO_CHAR(created_at, 'FMDay, FMDD FMMonth YYYY') as created
        FROM support_tickets
        ORDER BY created_at DESC
    `;
    const res = await query(text);
    return res.rows;
};

export const updateTicketStatus = async (id, status, resolutionMessage = null) => {
    const text = `
        UPDATE support_tickets
        SET status = $1, resolution_message = $2
        WHERE id = $3
        RETURNING *
    `;
    const res = await query(text, [status, resolutionMessage, id]);
    return res.rows[0];
};
