import eventsRepository from "../repositories/events.repository.js";

class EventsService {
  async getEvents(query) {
    const {
      status,
      category,
      location,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sort = "date",
    } = query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    if (location) {
      filters.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (dateFrom || dateTo) {
      filters.date = {};

      if (dateFrom) {
        const fromDate = new Date(dateFrom);

        if (Number.isNaN(fromDate.getTime())) {
          const error = new Error("dateFrom inválida");
          error.statusCode = 400;
          throw error;
        }

        filters.date.$gte = fromDate;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);

        if (Number.isNaN(toDate.getTime())) {
          const error = new Error("dateTo inválida");
          error.statusCode = 400;
          throw error;
        }

        filters.date.$lte = toDate;
      }
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage <= 0 ||
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0
    ) {
      const error = new Error("page y limit deben ser números enteros mayores a 0");
      error.statusCode = 400;
      throw error;
    }

    const allowedSortFields = ["date", "title", "capacity", "price", "createdAt"];

    let sortOrder = 1;
    let sortField = sort;

    if (sort.startsWith("-")) {
      sortOrder = -1;
      sortField = sort.slice(1);
    }

    if (!allowedSortFields.includes(sortField)) {
      const error = new Error("Campo de ordenamiento inválido");
      error.statusCode = 400;
      throw error;
    }

    const { events, total } = 
      await eventsRepository.findPublishedEvents(filters, {
        page: parsedPage,
        limit: parsedLimit,
        sort: {
          [sortField]: sortOrder,
        },
      });

    return {
      data: events,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async getEventById(eventId) {
    const event = await eventsRepository.findById(eventId);

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return event;
  }

  async createEvent(eventData, user) {
    const {
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      status,
    } = eventData;

    if (!title || !description || !category || !date || !location) {
      const error = new Error("Faltan campos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      const error = new Error("Fecha inválida");
      error.statusCode = 400;
      throw error;
    }

    if (eventDate <= new Date()) {
      const error = new Error("No se puede crear un evento con fecha pasada");
      error.statusCode = 400;
      throw error;
    }

    if (Number(capacity) <= 0) {
      const error = new Error("La capacidad debe ser mayor a 0");
      error.statusCode = 400;
      throw error;
    }

    if (Number(price) < 0) {
      const error = new Error("El precio no puede ser negativo");
      error.statusCode = 400;
      throw error;
    }

    const allowedStatuses = [
      "draft",
      "published",
      "cancelled",
      "finished",
    ];

    if (status && !allowedStatuses.includes(status)) {
      const error = new Error("Estado de evento inválido");
      error.statusCode = 400;
      throw error;
    }

    if (status === "cancelled" || status === "finished") {
      const error = new Error(
        "Un evento nuevo no puede crearse como cancelled o finished"
      );
      error.statusCode = 400;
      throw error;
    }

    return await eventsRepository.createEvent({
      title,
      description,
      category,
      date: eventDate,
      location,
      capacity: Number(capacity),
      price: Number(price),
      status: status || "draft",

      // Se ignora cualquier organizer enviado por el body
      organizer: user.id,
    });
  }

  async updateEvent(eventId, eventData, user) {
    const event = await eventsRepository.findById(eventId);

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role !== "admin" &&
      event.organizer.toString() !== user.id.toString()
    ) {
      const error = new Error(
        "No tenés permisos para modificar este evento"
      );
      error.statusCode = 403;
      throw error;
    }

    if (event.status === "cancelled") {
      const error = new Error("Los eventos cancelados no pueden modificarse");
      error.statusCode = 400;
      throw error;
    }

    // Organizer nunca se modifica desde el body.
    delete eventData.organizer;

    // El cambio de estado se maneja en el endpoint específico.
    delete eventData.status;

    if (eventData.date !== undefined) {
      const newDate = new Date(eventData.date);

      if (Number.isNaN(newDate.getTime())) {
        const error = new Error("Fecha inválida");
        error.statusCode = 400;
        throw error;
      }

      if (newDate <= new Date()) {
        const error = new Error(
          "La fecha del evento debe ser posterior a la fecha actual"
        );
        error.statusCode = 400;
        throw error;
      }

      eventData.date = newDate;
    }

    if (
      eventData.capacity !== undefined &&
      Number(eventData.capacity) <= 0
    ) {
      const error = new Error("La capacidad debe ser mayor a 0");
      error.statusCode = 400;
      throw error;
    }

    if (eventData.price !== undefined && Number(eventData.price) < 0) {
      const error = new Error("El precio no puede ser negativo");
      error.statusCode = 400;
      throw error;
    }

    if (eventData.capacity !== undefined) {
      eventData.capacity = Number(eventData.capacity);
    }

    if (eventData.price !== undefined) {
      eventData.price = Number(eventData.price);
    }

    return await eventsRepository.updateEvent(eventId, eventData);
  }

  async updateEventStatus(eventId, newStatus, user) {
    const event = await eventsRepository.findById(eventId);

    if (!newStatus) {
      const error = new Error("El estado es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role !== "admin" &&
      event.organizer.toString() !== user.id.toString()
    ) {
      const error = new Error(
        "No tenés permisos para modificar este evento"
      );
      error.statusCode = 403;
      throw error;
    }

    if (event.status === "cancelled") {
      const error = new Error(
        "No se puede cambiar el estado de un evento cancelado"
      );
      error.statusCode = 400;
      throw error;
    }

    const allowedStatuses = [
      "draft",
      "published",
      "cancelled",
      "finished",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      const error = new Error("Estado de evento inválido");
      error.statusCode = 400;
      throw error;
    }

    if (
      newStatus === "published" &&
      event.date <= new Date()
    ) {
      const error = new Error(
        "No se puede publicar un evento que ya finalizó"
      );
      error.statusCode = 400;
      throw error;
    }

    return await eventsRepository.updateEvent(eventId, {
      status: newStatus,
    });
  }
}

export default new EventsService();