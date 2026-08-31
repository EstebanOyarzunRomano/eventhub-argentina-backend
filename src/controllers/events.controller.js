import eventsService from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getEvents();

    res.status(200).json({
      status: "success",
      payload: events,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(
      req.body,
      req.user.id
    );

    res.status(201).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(
      req.params.eid,
      req.body,
      req.user
    );

    res.status(200).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};