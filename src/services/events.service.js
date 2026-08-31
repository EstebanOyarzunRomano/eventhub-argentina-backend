import Event from "../models/event.js";

class EventsService {
  async getEvents() {
    return await Event.find();
  }

  async createEvent(eventData, organizerId) {
    const event = await Event.create({
      ...eventData,
      organizer: organizerId,
    });

    return event;
  }

  async updateEvent(eventId, eventData, user) {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Evento no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role === "organizer" &&
      event.organizer.toString() !== user.id.toString()
    ) {
      const error = new Error(
        "No tenés permisos para modificar este evento"
      );
      error.statusCode = 403;
      throw error;
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "date",
      "location",
      "capacity",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (eventData[field] !== undefined) {
        event[field] = eventData[field];
      }
    });

    await event.save();

    return event;
  }
}

export default new EventsService();