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
      if (typeof ticket.event === "object") {
        this.event = {
          id:
            ticket.event._id?.toString() ||
            ticket.event.id,
          title: ticket.event.title,
          date: ticket.event.date,
          location: ticket.event.location,
        };
      } else {
        this.event = ticket.event.toString();
      }
    }

    if (ticket.user) {
      if (typeof ticket.user === "object") {
        this.user = {
          id:
            ticket.user._id?.toString() ||
            ticket.user.id,
          first_name: ticket.user.first_name,
          last_name: ticket.user.last_name,
          email: ticket.user.email,
        };
      } else {
        this.user = ticket.user.toString();
      }
    }
  }
}

export default TicketDTO;