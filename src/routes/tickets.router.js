import { Router } from "express";
import ticketsController from "../controllers/tickets.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

// Mis tickets
router.get(
  "/my-tickets",
  authenticate,
  ticketsController.getMyTickets
);

// Cancelar ticket propio o como admin
// La propiedad del ticket se valida en el service
router.patch(
  "/:tid/cancel",
  authenticate,
  ticketsController.cancelTicket
);

export default router;