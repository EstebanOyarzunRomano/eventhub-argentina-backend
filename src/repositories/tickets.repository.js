import ticketsDAO from "../dao/tickets.dao.js";

class TicketsRepository {
  async createTicket(ticketData) {
    return ticketsDAO.create(ticketData);
  }

  async findById(ticketId) {
    return ticketsDAO.findById(ticketId);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return ticketsDAO.findOne({
      user: userId,
      event: eventId,
      status: "active",
    });
  }

  async countActiveTickets(eventId) {
    return ticketsDAO.count({
      event: eventId,
      status: "active",
    });
  }

  async getActiveTicketsByEvent(eventId) {
    return ticketsDAO.find({
      event: eventId,
      status: "active",
    });
  }

  async getMyTickets(userId) {
    return ticketsDAO.find(
      {
        user: userId,
      },
      {
        populate: [
          {
            path: "event",
            select: "title date location",
          },
        ],
        sort: {
          createdAt: -1,
        },
      }
    );
  }

  async getTicketsByEvent(eventId) {
    return ticketsDAO.find(
      {
        event: eventId,
      },
      {
        populate: [
          {
            path: "user",
            select: "first_name last_name email",
          },
        ],
        sort: {
          createdAt: -1,
        },
      }
    );
  }

  async cancelTicket(ticketId) {
    return ticketsDAO.update(ticketId, {
      status: "cancelled",
    });
  }

  async saveTicket(ticket) {
    return ticketsDAO.save(ticket);
  }
}

export default new TicketsRepository();