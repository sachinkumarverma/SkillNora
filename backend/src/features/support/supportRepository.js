import { query } from "../../config/db.js";

const createTicket = async ({ userId, name, email, subject, message }) => {
  const text = `
        INSERT INTO support_tickets (user_id, name, email, subject, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
  const values = [userId || null, name, email, subject, message];
  const res = await query(text, values);
  return res.rows[0];
};

const getAdminTickets = async () => {
  const text = `
        SELECT 
            id,
            subject,
            name as user,
            email,
            priority,
            status,
            created_at,
            TO_CHAR(created_at, 'DD Mon YYYY, HH12:MI AM') as created,
            TO_CHAR(resolved_at, 'DD Mon YYYY, HH12:MI AM') as closed_date
        FROM support_tickets
        ORDER BY created_at DESC
    `;
  const res = await query(text);
  return res.rows;
};

const updateTicketStatus = async (id, status, resolutionMessage = null) => {
  let text;
  if (status === "Closed") {
    text = `
            UPDATE support_tickets
            SET status = $1, resolution_message = $2, resolved_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
  } else {
    text = `
            UPDATE support_tickets
            SET status = $1, resolution_message = $2
            WHERE id = $3
            RETURNING *
        `;
  }
  const res = await query(text, [status, resolutionMessage, id]);
  return res.rows[0];
};

export const supportRepository = {
  createTicket,
  getAdminTickets,
  updateTicketStatus,
};
