import { Router } from "express";

import eventsController from "../controllers/events.controller.js";
import ticketsController from "../controllers/tickets.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

// Listado público con filtros, paginación y ordenamiento
router.get("/", eventsController.getEvents);

// Crear evento: organizer o admin
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.createEvent
);

// Crear ticket: cualquier usuario autenticado
router.post(
  "/:eid/tickets",
  authenticate,
  ticketsController.createTicket
);

// Consultar tickets de un evento:
// organizer (evento propio) o admin
router.get(
  "/:eid/tickets",
  authenticate,
  authorize("organizer", "admin"),
  ticketsController.getTicketsByEvent
);

// Cambiar estado: organizer dueño o admin
router.patch(
  "/:id/status",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.updateEventStatus
);

// Modificar evento
router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.updateEvent
);

// Consulta pública por ID
// IMPORTANTE: dejar esta ruta al final de las rutas GET con parámetros
router.get("/:id", eventsController.getEventById);

export default router;