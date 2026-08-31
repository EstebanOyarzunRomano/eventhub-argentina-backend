import { Router } from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
} from "../controllers/events.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEvents);

router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  createEvent
);

router.put(
  "/:eid",
  authenticate,
  authorize("organizer", "admin"),
  updateEvent
);

export default router;