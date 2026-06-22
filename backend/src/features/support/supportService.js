import * as repository from './supportRepository.js';

export const submitTicket = async (ticketData) => {
    return await repository.createTicket(ticketData);
};

export const getAdminTickets = async () => {
    return await repository.getAdminTickets();
};

export const resolveTicket = async (id, adminMessage) => {
    return await repository.updateTicketStatus(id, 'Closed', adminMessage);
};
