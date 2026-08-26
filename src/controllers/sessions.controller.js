import sessionsService from "../services/sessions.service.js";

class SessionsController {
  async register(req, res) {
    try {
      const user = await sessionsService.register(req.body);

      return res.status(201).json({
        status: "success",
        payload: user,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Error interno del servidor",
      });
    }
  }
}

export default new SessionsController();