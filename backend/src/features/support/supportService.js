import { supportRepository as repository } from "./supportRepository.js";
import { notificationsService } from "../notifications/notificationsService.js";
import { query } from "../../config/db.js";

const submitTicket = async (ticketData) => {
  const ticket = await repository.createTicket(ticketData);

  try {
    const adminRes = await query(`SELECT id FROM users WHERE role = 'admin'`);
    const admins = adminRes.rows;
    
    for (const admin of admins) {
      await notificationsService.addNotification({
        user_id: admin.id,
        title: "New Support Ticket",
        message: `A new ticket "${ticketData.subject}" was raised by ${ticketData.name}.`,
        type: "support_ticket",
        link: "/admin/support",
      });
    }
  } catch (err) {
    console.error("Failed to send admin notifications for new ticket", err);
  }

  return ticket;
};

const getAdminTickets = async () => {
  return await repository.getAdminTickets();
};

const resolveTicket = async (id, adminMessage) => {
  return await repository.updateTicketStatus(id, "Closed", adminMessage);
};

export const supportService = {
  submitTicket,
  getAdminTickets,
  resolveTicket,
};
