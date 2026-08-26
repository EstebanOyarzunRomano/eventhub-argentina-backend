import { Router } from "express";
import sessionsController from "../controllers/sessions.controller.js";

const router = Router();

router.post("/register", (req, res) =>
  sessionsController.register(req, res)
);

export default router;
