import usersRepository from "../repositories/users.repository.js";
import { createHash } from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

class SessionsService {
  async register(userData) {
    const { first_name, last_name, email, password } = userData;

    // 1. Validar campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      const error = new Error("Faltan campos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    // 2. Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validar formato de email
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      const error = new Error("El email tiene un formato inválido");
      error.statusCode = 400;
      throw error;
    }

    // 4. Validar longitud mínima de contraseña
    if (password.length < MIN_PASSWORD_LENGTH) {
      const error = new Error(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
      error.statusCode = 400;
      throw error;
    }

    // 5. Verificar si el email ya existe
    const existingUser = await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error("El email ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    // 6. Hashear contraseña
    const hashedPassword = await createHash(password);

    // 7. Crear usuario
    // IMPORTANTE: no usamos userData completo para evitar que
    // el cliente pueda enviar role: "admin"
    const newUser = await usersRepository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 8. Devolver solo datos seguros
    return {
      id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
    };
  }
}

export default new SessionsService();