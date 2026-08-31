import { Router } from "express";
import passport from "passport";

import sessionsController from "../controllers/sessions.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

const passportAuthenticate = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(
      strategy,
      { session: false },
      (error, user, info) => {
        if (error) {
          return next(error);
        }

        if (!user) {
          return res.status(401).json({
            status: "error",
            message:
              strategy === "login"
                ? "Credenciales inválidas"
                : "No autorizado",
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};

router.post(
  "/register",
  passportAuthenticate("register"),
  (req, res) => sessionsController.register(req, res)
);

router.post(
  "/login",
  passportAuthenticate("login"),
  (req, res) => sessionsController.login(req, res)
);

router.get(
  "/current",
  authenticate,
  (req, res) => sessionsController.current(req, res)
);

router.post(
  "/logout",
  (req, res) => sessionsController.logout(req, res)
);

export default router;