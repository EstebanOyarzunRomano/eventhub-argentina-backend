import express from "express";
import cookieParser from "cookie-parser";
import sessionsRouter from "./routes/sessions.router.js";
import eventsRouter from "./routes/events.router.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/sessions", sessionsRouter);
app.use("/api/events", eventsRouter);

export default app;