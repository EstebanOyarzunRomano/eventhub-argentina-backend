import Event from "../models/event.js";

class EventsRepository {
  async create(eventData) {
    return await Event.create(eventData);
  }

  async findById(eventId) {
    return await Event.findById(eventId);
  }

  async findAll(filters, options) {
    const { page, limit, sort } = options;

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("organizer", "first_name last_name email role"),

      Event.countDocuments(filters),
    ]);

    return {
      events,
      total,
    };
  }

  async update(eventId, eventData) {
    return await Event.findByIdAndUpdate(eventId, eventData, {
      new: true,
      runValidators: true,
    });
  }
}

export default new EventsRepository();