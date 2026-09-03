import usersRepository from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

class SessionsService {
  async register(userData) {
    const {
      first_name,
      last_name,
      email,
      password,
    } = userData;

    if (!first_name || !last_name || !email || !password) {
      const error = new Error("Faltan campos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      const error = new Error(
        "El email tiene un formato inválido"
      );
      error.statusCode = 400;
      throw error;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      const error = new Error(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
      error.statusCode = 400;
      throw error;
    }

    const existingUser =
      await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error(
        "El email ya está registrado"
      );
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await createHash(password);

    return usersRepository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
  }

  async login(email, password) {
    if (!email || !password) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user =
      await usersRepository.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const validPassword = await isValidPassword(
      password,
      user.password
    );

    if (!validPassword) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    return user;
  }

  async getCurrentUser(userId) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

export default new SessionsService();