import { Router } from "express";

import eventsController from "../controllers/events.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

// Listado público con filtros, paginación y ordenamiento
router.get("/", eventsController.getEvents);

// Consulta pública por ID
router.get("/:id", eventsController.getEventById);

// Crear evento: organizer o admin
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.createEvent
);

// Modificar evento: autenticado.
// La propiedad del evento se valida en el service.
router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.updateEvent
);

// Cambiar estado: organizer dueño o admin
router.patch(
  "/:id/status",
  authenticate,
  authorize("organizer", "admin"),
  eventsController.updateEventStatus
);

export default router;