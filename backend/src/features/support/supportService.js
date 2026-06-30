import { supportRepository as repository } from "./supportRepository.js";

const submitTicket = async (ticketData) => {
  return await repository.createTicket(ticketData);
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
