import ticketsService from "../services/tickets.service.js";
import TicketDTO from "../dto/ticket.dto.js";

class TicketsController {
  async createTicket(req, res, next) {
    try {
      const { eid } = req.params;
      const { quantity } = req.body;

      const ticket = await ticketsService.createTicket(
        eid,
        req.user.id,
        quantity
      );

      res.status(201).json({
        status: "success",
        message: "Inscripción realizada correctamente",
        payload: new TicketDTO(ticket),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req, res, next) {
    try {
      const tickets = await ticketsService.getMyTickets(
        req.user.id
      );

      res.status(200).json({
        status: "success",
        payload: tickets.map(
          (ticket) => new TicketDTO(ticket)
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketsByEvent(req, res, next) {
    try {
      const { eid } = req.params;

      const tickets =
        await ticketsService.getTicketsByEvent(
          eid,
          req.user
        );

      res.status(200).json({
        status: "success",
        payload: tickets.map(
          (ticket) => new TicketDTO(ticket)
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelTicket(req, res, next) {
    try {
      const { tid } = req.params;

      const ticket = await ticketsService.cancelTicket(
        tid,
        req.user
      );

      res.status(200).json({
        status: "success",
        message: "Ticket cancelado correctamente",
        payload: new TicketDTO(ticket),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TicketsController();