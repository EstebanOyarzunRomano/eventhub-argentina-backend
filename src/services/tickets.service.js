import crypto from "crypto";
import Event from "../models/event.js";
import User from "../models/user.js";
import ticketsRepository from "../repositories/tickets.repository.js";
import mailService from "./mail.service.js";

class TicketsService {
  async createTicket(eventId, userId, quantity) {
    // 1. Validar que el evento exista
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar que esté publicado
    if (event.status !== "published") {
      if (event.status === "cancelled") {
        const error = new Error(
          "No es posible inscribirse a un evento cancelado"
        );
        error.statusCode = 400;
        throw error;
      }

      if (event.status === "finished") {
        const error = new Error(
          "No es posible inscribirse a un evento finalizado"
        );
        error.statusCode = 400;
        throw error;
      }

      const error = new Error(
        "El evento no está publicado"
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar fecha
    if (event.date <= new Date()) {
      const error = new Error(
        "No es posible inscribirse a un evento finalizado"
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Validar quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error(
        "La cantidad debe ser un número entero mayor a 0"
      );
      error.statusCode = 400;
      throw error;
    }

    // 5. Validar inscripción duplicada activa
    const existingTicket =
      await ticketsRepository.findActiveByUserAndEvent(
        userId,
        eventId
      );

    if (existingTicket) {
      const error = new Error(
        "Ya tenés una inscripción activa para este evento"
      );
      error.statusCode = 409;
      throw error;
    }

    // 6. Obtener tickets activos
    const activeTickets =
      await ticketsRepository.getActiveTicketsByEvent(eventId);

    // 7. Calcular cupos ocupados
    const occupiedCapacity = activeTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );

    const availableCapacity =
      event.capacity - occupiedCapacity;

    // 8. Validar cupos
    if (availableCapacity < quantity) {
      const error = new Error(
        `No hay cupos suficientes. Cupos disponibles: ${availableCapacity}`
      );
      error.statusCode = 400;
      throw error;
    }

    // 9. Generar código de reserva
    const reservationCode = crypto.randomUUID();

    // 10. Crear ticket
    const ticket = await ticketsRepository.create({
      user: userId,
      event: eventId,
      status: "confirmed",
      quantity,
      reservationCode,
    });

    // 11. Obtener usuario
    const user = await User.findById(userId);

    // 12. Enviar email
    if (user) {
      try {
        await mailService.sendTicketConfirmation(
          user,
          event,
          ticket
        );
      } catch (error) {
        console.error(
          "Error enviando email de confirmación:",
          error.message
        );
      }
    }

    return ticket;
  }

  async getMyTickets(userId) {
    return await ticketsRepository.getMyTickets(userId);
  }

  async getTicketsByEvent(eventId, user) {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (user.role === "admin") {
      return await ticketsRepository.getTicketsByEvent(eventId);
    }

    if (
      user.role === "organizer" &&
      event.organizer.toString() === user.id.toString()
    ) {
      return await ticketsRepository.getTicketsByEvent(eventId);
    }

    const error = new Error(
      "No tenés permisos para consultar los tickets de este evento"
    );
    error.statusCode = 403;
    throw error;
  }

  async cancelTicket(ticketId, user) {
    const ticket =
      await ticketsRepository.findById(ticketId);

    if (!ticket) {
      const error = new Error("Ticket no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const isOwner =
      ticket.user.toString() === user.id.toString();

    const isAdmin =
      user.role === "admin";

    if (!isOwner && !isAdmin) {
      const error = new Error(
        "No tenés permisos para cancelar este ticket"
      );
      error.statusCode = 403;
      throw error;
    }

    if (ticket.status === "cancelled") {
      const error = new Error(
        "El ticket ya se encuentra cancelado"
      );
      error.statusCode = 400;
      throw error;
    }

    ticket.status = "cancelled";
    ticket.cancelledAt = new Date();

    await ticketsRepository.save(ticket);

    return ticket;
  }
}

export default new TicketsService();