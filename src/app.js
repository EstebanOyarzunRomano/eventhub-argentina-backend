import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";

import sessionsRouter from "./routes/sessions.router.js";
import eventsRouter from "./routes/events.router.js";

import initializePassport from "./config/passport.config.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Configurar estrategias
initializePassport();

// Inicializar Passport
app.use(passport.initialize());

app.use("/api/sessions", sessionsRouter);
app.use("/api/events", eventsRouter);

// Middleware global de errores
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Error interno del servidor",
  });
});

export default app;