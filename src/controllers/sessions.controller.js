import { generateToken } from "../utils/jwt.js";

class SessionsController {
  async register(req, res) {
    return res.status(201).json({
      status: "success",
      payload: req.user,
    });
  }

  async login(req, res) {
    try {
      // Passport ya validó las credenciales
      // El controller es quien genera el JWT
      const token = generateToken(req.user);

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
      return res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
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