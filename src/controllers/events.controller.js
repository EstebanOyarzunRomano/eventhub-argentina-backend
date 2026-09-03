import eventsService from "../services/events.service.js";
import EventDTO from "../dto/event.dto.js";

class EventsController {
  async getEvents(req, res, next) {
    try {
      const result = await eventsService.getEvents(req.query);

      const eventsDTO = result.data.map(
        (event) => new EventDTO(event)
      );

      return res.status(200).json({
        status: "success",
        data: eventsDTO,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req, res, next) {
    try {
      const event = await eventsService.getEventById(
        req.params.id
      );

      return res.status(200).json({
        status: "success",
        data: new EventDTO(event),
      });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await eventsService.createEvent(
        req.body,
        req.user
      );

      return res.status(201).json({
        status: "success",
        message: "Evento creado correctamente",
        data: new EventDTO(event),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const event = await eventsService.updateEvent(
        req.params.id,
        req.body,
        req.user
      );

      return res.status(200).json({
        status: "success",
        message: "Evento actualizado correctamente",
        data: new EventDTO(event),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req, res, next) {
    try {
      const event = await eventsService.updateEventStatus(
        req.params.id,
        req.body.status,
        req.user
      );

      return res.status(200).json({
        status: "success",
        message: "Estado del evento actualizado correctamente",
        data: new EventDTO(event),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventsController();