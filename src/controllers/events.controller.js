import eventsService from "../services/events.service.js";

class EventsController {
  async getEvents(req, res, next) {
    try {
      const result = await eventsService.getEvents(req.query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req, res, next) {
    try {
      const event = await eventsService.getEventById(req.params.id);

      res.status(200).json({
        data: event,
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

      res.status(201).json({
        message: "Evento creado correctamente",
        data: event,
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

      res.status(200).json({
        message: "Evento actualizado correctamente",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req, res, next) {
    try {
      const { status } = req.body;

      if (!status) {
        const error = new Error("El estado es obligatorio");
        error.statusCode = 400;
        throw error;
      }

      const event = await eventsService.updateEventStatus(
        req.params.id,
        status,
        req.user
      );

      res.status(200).json({
        message: "Estado del evento actualizado correctamente",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventsController();