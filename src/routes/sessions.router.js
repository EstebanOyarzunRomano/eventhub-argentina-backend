import { Router } from "express";
import sessionsController from "../controllers/sessions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", (req, res) =>
    sessionsController.register(req, res)
);

router.post("/login", (req, res) =>
    sessionsController.login(req, res)
);

router.get("/current", auth, (req, res) =>
    sessionsController.current(req, res)
);

router.post("/logout", (req, res) =>
    sessionsController.logout(req, res)
);

export default router;
