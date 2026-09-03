import Event from "../models/event.js";

class EventsDAO {
  async create(eventData) {
    return Event.create(eventData);
  }

  async findById(eventId) {
    return Event.findById(eventId);
  }

  async find(filters, options) {
    const { page, limit, sort } = options;

    const skip = (page - 1) * limit;

    return Event.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("organizer", "first_name last_name email role");
  }

  async count(filters) {
    return Event.countDocuments(filters);
  }

  async update(eventId, eventData) {
    return Event.findByIdAndUpdate(eventId, eventData, {
      new: true,
      runValidators: true,
    });
  }
}

export default new EventsDAO();