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

  async login(req, res) {
    try {
        const token = await sessionsService.login(req.body);

        res.cookie("currentUser", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 3600000,
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({
            status: "success",
            message: "Login correcto",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Error interno del servidor",
        });
    }
  }
  
  current(req, res) {
    return res.status(200).json({
        status: "success",
        payload: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
        },
    });
  }
  
  logout(req, res) {
    res.clearCookie("currentUser", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
        status: "success",
        message: "Sesión cerrada",
    });
  }

}

export default new SessionsController();