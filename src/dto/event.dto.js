class EventDTO {
  constructor(event) {
    this.id = event._id?.toString() || event.id;
    this.title = event.title;
    this.description = event.description;
    this.category = event.category;
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;

    if (event.organizer) {
      if (typeof event.organizer === "object") {
        this.organizer = {
          id:
            event.organizer._id?.toString() ||
            event.organizer.id,
          first_name: event.organizer.first_name,
          last_name: event.organizer.last_name,
          email: event.organizer.email,
          role: event.organizer.role,
        };
      } else {
        this.organizer = event.organizer.toString();
      }
    }

    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}

export default EventDTO;