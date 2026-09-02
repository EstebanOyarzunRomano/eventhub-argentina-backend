import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";

import sessionsRouter from "./routes/sessions.router.js";
import eventsRouter from "./routes/events.router.js";
import usersRouter from "./routes/users.router.js";
import ticketsRouter from "./routes/tickets.router.js";

import initializePassport from "./config/passport.config.js";

import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Configurar estrategias
initializePassport();

// Inicializar Passport
app.use(passport.initialize());

app.use("/api/sessions", sessionsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

app.use(errorHandler); // Middleware global de errores

export default app;