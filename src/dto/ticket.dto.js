class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id?.toString() || ticket.id;
    this.status = ticket.status;
    this.quantity = ticket.quantity;
    this.reservationCode = ticket.reservationCode;
    this.cancelledAt = ticket.cancelledAt;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;

    if (ticket.event) {
      // Evento populado
      if (ticket.event.title !== undefined) {
        this.event = {
          id: ticket.event._id?.toString() || ticket.event.id,
          title: ticket.event.title,
          date: ticket.event.date,
          location: ticket.event.location,
        };
      } else {
        // Solo ObjectId
        this.event = ticket.event.toString();
      }
    }

    if (ticket.user) {
      // Usuario populado
      if (ticket.user.email !== undefined) {
        this.user = {
          id: ticket.user._id?.toString() || ticket.user.id,
          first_name: ticket.user.first_name,
          last_name: ticket.user.last_name,
          email: ticket.user.email,
        };
      } else {
        // Solo ObjectId
        this.user = ticket.user.toString();
      }
    }
  }
}

export default TicketDTO;