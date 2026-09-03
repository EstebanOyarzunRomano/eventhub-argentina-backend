import eventsDAO from "../dao/events.dao.js";

class EventsRepository {
  async createEvent(eventData) {
    return eventsDAO.create(eventData);
  }

  async findById(eventId) {
    return eventsDAO.findById(eventId);
  }

  async findEvents(filters, options) {
    const [events, total] = await Promise.all([
      eventsDAO.find(filters, options),
      eventsDAO.count(filters),
    ]);

    return {
      events,
      total,
    };
  }

  async updateEvent(eventId, eventData) {
    return eventsDAO.update(eventId, eventData);
  }
}

export default new EventsRepository();