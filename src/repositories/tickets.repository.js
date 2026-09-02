import Ticket from "../models/ticket.js";

class TicketsRepository {
  async create(ticketData) {
    return await Ticket.create(ticketData);
  }

  async findById(ticketId) {
    return await Ticket.findById(ticketId);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return await Ticket.findOne({
      user: userId,
      event: eventId,
      status: {
        $in: ["confirmed", "pending"],
      },
    });
  }

  async getActiveTicketsByEvent(eventId) {
    return await Ticket.find({
      event: eventId,
      status: {
        $in: ["confirmed", "pending"],
      },
    });
  }

  async getMyTickets(userId) {
    return await Ticket.find({
      user: userId,
    })
      .populate("event", "title date location")
      .sort({ createdAt: -1 });
  }

  async getTicketsByEvent(eventId) {
    return await Ticket.find({
      event: eventId,
    })
      .populate("user", "first_name last_name email")
      .sort({ createdAt: -1 });
  }

  async save(ticket) {
    return await ticket.save();
  }
}

export default new TicketsRepository();