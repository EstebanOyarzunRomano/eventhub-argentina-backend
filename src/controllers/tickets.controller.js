import ticketsService from "../services/tickets.service.js";

class TicketsController {
  async createTicket(req, res) {
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
        payload: ticket,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getMyTickets(req, res) {
    try {
      const tickets = await ticketsService.getMyTickets(req.user.id);

      res.status(200).json({
        status: "success",
        payload: tickets,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getTicketsByEvent(req, res) {
    try {
      const { eid } = req.params;

      const tickets = await ticketsService.getTicketsByEvent(
        eid,
        req.user
      );

      res.status(200).json({
        status: "success",
        payload: tickets,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async cancelTicket(req, res) {
    try {
      const { tid } = req.params;

      const ticket = await ticketsService.cancelTicket(
        tid,
        req.user
      );

      res.status(200).json({
        status: "success",
        message: "Ticket cancelado correctamente",
        payload: ticket,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

export default new TicketsController();