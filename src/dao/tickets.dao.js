import Ticket from "../models/ticket.js";

class TicketsDAO {
  async create(ticketData) {
    return Ticket.create(ticketData);
  }

  async findById(ticketId) {
    return Ticket.findById(ticketId);
  }

  async findOne(filter) {
    return Ticket.findOne(filter);
  }

  async find(filter, options = {}) {
    let query = Ticket.find(filter);

    if (options.populate) {
      options.populate.forEach((populateOption) => {
        query = query.populate(
          populateOption.path,
          populateOption.select
        );
      });
    }

    if (options.sort) {
      query = query.sort(options.sort);
    }

    return query;
  }

  async count(filter) {
    return Ticket.countDocuments(filter);
  }

  async update(ticketId, ticketData) {
    return Ticket.findByIdAndUpdate(ticketId, ticketData, {
      new: true,
      runValidators: true,
    });
  }

  async save(ticket) {
    return ticket.save();
  }
}

export default new TicketsDAO();